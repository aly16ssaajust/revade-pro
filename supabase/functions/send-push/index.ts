import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { importPKCS8, SignJWT } from "https://esm.sh/jose@5.9.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Get Firebase OAuth2 access token from service account ───────────────────
async function getFirebaseToken(serviceAccount: Record<string, string>): Promise<string> {
  const key = await importPKCS8(serviceAccount.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);

  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/firebase.messaging" })
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(serviceAccount.client_email)
    .setSubject(serviceAccount.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const data = await res.json();
  if (!data.access_token) {
    console.error("Firebase token error:", data);
    throw new Error("Failed to get Firebase access token");
  }
  return data.access_token as string;
}

// ─── Send FCM notification to a user ─────────────────────────────────────────
async function sendToUser(
  supabase: ReturnType<typeof createClient>,
  userId: string | undefined | null,
  title: string,
  body: string,
  data: Record<string, string> = {},
) {
  if (!userId) return;

  const { data: row } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", userId)
    .maybeSingle();

  if (!row?.token) return;

  const serviceAccountRaw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  if (!serviceAccountRaw) throw new Error("FIREBASE_SERVICE_ACCOUNT not set");
  const serviceAccount = JSON.parse(serviceAccountRaw);
  const accessToken = await getFirebaseToken(serviceAccount);

  const fcmRes = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          token: row.token,
          notification: { title, body },
          data,
          android: { priority: "high", notification: { sound: "default" } },
          apns: { payload: { aps: { sound: "default" } } },
        },
      }),
    },
  );

  if (!fcmRes.ok) {
    const err = await fcmRes.text();
    console.error("FCM error:", err);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // deno-lint-ignore no-explicit-any
    const payload: Record<string, any> = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const type: string | undefined = payload.type;
    const table: string | undefined = payload.table;
    // deno-lint-ignore no-explicit-any
    const record: Record<string, any> | undefined = payload.record;

    // Webhook: nouveau message pro → notifier le patient
    if (table === "pro_patient_messages" && type === "INSERT") {
      if (record?.sender_type !== "pro") return new Response("skip");
      await sendToUser(
        supabase,
        record.patient_id,
        "💬 Nouveau message",
        "Votre professionnel de santé vous a envoyé un message",
        { type: "message" },
      );
    }

    // Webhook: RDV confirmé → notifier le patient
    else if (table === "appointments" && type === "UPDATE") {
      if (record?.statut !== "confirme") return new Response("skip");
      await sendToUser(
        supabase,
        record.patient_user_id,
        "✅ Rendez-vous confirmé",
        "Votre rendez-vous a été confirmé par votre praticien",
        { type: "appointment" },
      );
    }

    // Webhook: nouveau lien pro-patient → notifier le patient
    else if (table === "patient_professional_links" && type === "INSERT") {
      await sendToUser(
        supabase,
        record?.patient_id,
        "🔗 Suivi activé",
        "Un professionnel a accès à votre dossier. Retrouvez votre suivi dans l'app.",
        { type: "followup" },
      );
    }

    // Webhook: commentaire forum → notifier l'auteur du post
    else if (table === "forum_comments" && type === "INSERT") {
      const { data: post } = await supabase
        .from("forum_posts")
        .select("user_id")
        .eq("id", record?.post_id)
        .maybeSingle();
      if (post && post.user_id !== record?.user_id) {
        await sendToUser(
          supabase,
          post.user_id,
          "💬 Nouvelle réponse",
          "Quelqu'un a répondu à votre message sur le forum",
          { type: "forum" },
        );
      }
    }

    // Appel direct depuis le logiciel web (documents, notes…)
    else if (payload.user_id) {
      await sendToUser(
        supabase,
        payload.user_id,
        payload.title,
        payload.body,
        payload.data ?? {},
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
