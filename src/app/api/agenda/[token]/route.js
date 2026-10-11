import { supabase } from "@/lib/supabase";

// Flux iCalendar de l'agenda d'un pro, auquel Google Agenda / Outlook s'abonnent.
// Par confidentialité, seules les initiales du patient sortent de Rêvade (pas de nom ni de motif).

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function icsDate(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function initiales(nom) {
  return (nom || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((m) => m[0].toUpperCase() + ".")
    .join(" ");
}

export async function GET(request, { params }) {
  const { token: raw } = await params;
  const token = (raw || "").replace(/\.ics$/i, "");
  if (!UUID_RE.test(token)) {
    return new Response("Lien d'agenda invalide", { status: 404 });
  }

  const { data, error } = await supabase.rpc("get_calendar_feed", { p_token: token });
  if (error) {
    return new Response("Agenda indisponible", { status: 500 });
  }

  const now = icsDate(new Date());
  const events = (data || []).map((rdv) => {
    const debut = new Date(rdv.date_heure);
    const fin = new Date(debut.getTime() + (rdv.duree_minutes || 30) * 60000);
    const init = initiales(rdv.patient_name);
    const prefixe = rdv.statut === "en_attente" ? "[À confirmer] " : rdv.statut === "annule" ? "[Annulé] " : "";
    return [
      "BEGIN:VEVENT",
      `UID:${rdv.id}@revade-pro`,
      `DTSTAMP:${now}`,
      `DTSTART:${icsDate(debut)}`,
      `DTEND:${icsDate(fin)}`,
      `SUMMARY:${prefixe}Consultation Rêvade${init ? ` · ${init}` : ""}`,
      `STATUS:${rdv.statut === "annule" ? "CANCELLED" : rdv.statut === "en_attente" ? "TENTATIVE" : "CONFIRMED"}`,
      "END:VEVENT",
    ].join("\r\n");
  });

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Revade//Revade Pro//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Rêvade Pro",
    "X-WR-TIMEZONE:Europe/Paris",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="revade-pro.ics"',
      "Cache-Control": "no-store",
    },
  });
}
