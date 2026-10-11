"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Grand sélecteur entre les deux espaces d'échange : messages privés patients / forum public.
export default function EchangesSwitch({ actif, proId }) {
  const [nonLus, setNonLus] = useState(0);

  useEffect(() => {
    if (!proId) return;
    supabase
      .from("pro_patient_messages")
      .select("id", { count: "exact", head: true })
      .eq("pro_id", proId)
      .eq("sender_type", "patient")
      .is("read_at", null)
      .then(({ count }) => setNonLus(count || 0));
  }, [proId]);

  const espaces = [
    {
      id: "prive", href: "/messagerie", icon: "🔒", titre: "Messages privés",
      desc: "Conversations confidentielles en tête-à-tête avec vos patients",
      badge: actif !== "prive" && nonLus > 0 ? `${nonLus} non lu${nonLus > 1 ? "s" : ""}` : null,
    },
    {
      id: "forum", href: "/forum", icon: "🗣️", titre: "Forum communauté",
      desc: "Discussions publiques entre patients et professionnels Rêvade",
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px", marginBottom: "32px" }}>
      {espaces.map((e) => {
        const on = actif === e.id;
        return (
          <Link key={e.id} href={e.href} style={{ textDecoration: "none" }}>
            <div style={{
              position: "relative", overflow: "hidden", height: "100%",
              display: "flex", alignItems: "center", gap: "18px",
              padding: "22px 24px", borderRadius: "24px",
              background: on ? "#004649" : "#FFFFFF",
              border: on ? "1px solid #004649" : "1px solid rgba(0,70,73,0.10)",
              boxShadow: on ? "0 20px 50px rgba(0,70,73,0.20)" : "0 8px 24px rgba(0,70,73,0.05)",
              transition: "all 0.2s ease",
            }}>
              {on && <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 90% 0%, rgba(183,215,232,0.25), transparent 50%)" }} />}
              <div style={{
                position: "relative", width: "56px", height: "56px", borderRadius: "18px", flexShrink: 0,
                background: on ? "rgba(244,237,228,0.12)" : (e.id === "prive" ? "#F4EDE4" : "#DCEEE6"),
                border: on ? "1px solid rgba(244,237,228,0.18)" : "none",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px",
              }}>{e.icon}</div>
              <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <p style={{ color: on ? "#F4EDE4" : "#004649", fontWeight: "600", fontSize: "18px" }}>{e.titre}</p>
                  {e.badge && <span style={{ background: "#E53935", color: "white", borderRadius: "50px", padding: "2px 10px", fontSize: "11px", fontWeight: "700" }}>{e.badge}</span>}
                </div>
                <p style={{ color: on ? "rgba(244,237,228,0.75)" : "#5A6B72", fontSize: "13px", marginTop: "4px", lineHeight: 1.5 }}>{e.desc}</p>
              </div>
              <div style={{
                position: "relative", flexShrink: 0, borderRadius: "50px", padding: "7px 14px", fontSize: "12px", fontWeight: "600",
                background: on ? "#A5C9B9" : "#EAF3F8", color: "#004649", whiteSpace: "nowrap",
              }}>{on ? "Vous êtes ici" : "Ouvrir →"}</div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
