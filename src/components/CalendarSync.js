"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Bloc « Synchroniser avec Google Agenda ou Outlook » : abonnement iCal à l'agenda Rêvade.
export default function CalendarSync({ proId }) {
  const [token, setToken] = useState(null);
  const [indispo, setIndispo] = useState(false);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!proId) return;
    supabase
      .from("professionals")
      .select("calendar_token")
      .eq("id", proId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data?.calendar_token) setIndispo(true);
        else setToken(data.calendar_token);
      });
  }, [proId]);

  const httpsUrl = token && typeof window !== "undefined" ? `${window.location.origin}/api/agenda/${token}.ics` : "";
  const webcalUrl = httpsUrl.replace(/^https?:/, "webcal:");
  const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent("Rêvade Pro")}`;

  function copier() {
    navigator.clipboard.writeText(httpsUrl);
    setCopie(true);
    setTimeout(() => setCopie(false), 1800);
  }

  const pill = { borderRadius: "50px", padding: "9px 18px", fontSize: "13px", fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" };

  return (
    <div style={{ marginTop: "24px", padding: "20px", background: "#EAF3F8", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ width: "40px", height: "40px", borderRadius: "14px", background: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>🔄</span>
        <div>
          <p style={{ color: "#004649", fontWeight: "600", fontSize: "14px" }}>Synchroniser avec Google Agenda ou Outlook</p>
          <p style={{ color: "#5A6B72", fontSize: "12px", lineHeight: 1.5 }}>
            Vos rendez-vous Rêvade apparaissent automatiquement dans votre agenda habituel. Seules les initiales des patients sont partagées.
          </p>
        </div>
      </div>

      {token ? (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{ ...pill, background: "#004649", color: "#F4EDE4", boxShadow: "0 6px 16px rgba(0,70,73,0.2)" }}>
            Google Agenda
          </a>
          <a href={outlookUrl} target="_blank" rel="noopener noreferrer" style={{ ...pill, background: "#004649", color: "#F4EDE4", boxShadow: "0 6px 16px rgba(0,70,73,0.2)" }}>
            Outlook
          </a>
          <button onClick={copier} style={{ ...pill, background: "#FFFFFF", color: "#004649", border: "1px solid rgba(0,70,73,0.20)" }}>
            {copie ? "✓ Lien copié" : "Copier le lien (Apple, autre)"}
          </button>
        </div>
      ) : (
        <p style={{ color: "#90A4AE", fontSize: "12px", fontStyle: "italic" }}>
          {indispo ? "Synchronisation bientôt disponible." : "Chargement…"}
        </p>
      )}
    </div>
  );
}
