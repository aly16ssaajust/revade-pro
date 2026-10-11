"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import { showToast } from "@/lib/toast";

const tuiles = [
  { id: "dashboard", label: "Fiches patients", icon: "👥", desc: "Dossiers, consommations et évolution de vos patients", href: "/dashboard", tint: "#DCEEE6" },
  { id: "agenda", label: "Agenda", icon: "📅", desc: "Rendez-vous, planning et demandes en attente", href: "/agenda", tint: "#D6E9F3" },
  { id: "forum", label: "Messagerie", icon: "💬", desc: "Échangez avec vos patients en privé", href: "/forum?tab=messagerie", tint: "#F4EDE4" },
  { id: "annuaire", label: "Annuaire", icon: "📞", desc: "Contacts utiles et ressources professionnelles", href: "/annuaire", tint: "#F4EDE4" },
  { id: "outils", label: "Outils cliniques", icon: "🛠", desc: "Tests HAD, Beck, Horn et formations MOOC", href: "/outils", tint: "#DCEEE6" },
  { id: "profil", label: "Profil", icon: "👤", desc: "Vos informations et paramètres professionnels", href: "/profil", tint: "#D6E9F3" },
];

const eyebrow = {
  color: "#004649", fontWeight: "500", fontSize: "12px",
  letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px",
};

export default function Accueil() {
  const [hovered, setHovered] = useState(null);
  const { pro } = useProProfile();

  const [nbPatients, setNbPatients] = useState("…");
  const [nbRdvMois, setNbRdvMois] = useState("…");
  const [nbMessages, setNbMessages] = useState("…");
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!pro) return;
    loadStats();
    // Realtime : actualise le compteur dès qu'un lien patient est ajouté/supprimé
    const ch = supabase.channel(`accueil_${pro.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "patient_professional_links", filter: `professional_id=eq.${pro.id}` }, () => loadStats())
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [pro]);

  async function loadStats() {
    setLoadingStats(true);
    try {
      // Patients suivis
      const { count: patients } = await supabase
        .from("patient_professional_links")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", pro.id);
      setNbPatients(patients ?? 0);

      // RDV ce mois
      const now = new Date();
      const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const finMois = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      const { count: rdvs } = await supabase
        .from("appointments")
        .select("*", { count: "exact", head: true })
        .eq("professional_id", pro.id)
        .gte("date_heure", debutMois)
        .lte("date_heure", finMois);
      setNbRdvMois(rdvs ?? 0);

      // Messages forum
      const { count: messages } = await supabase
        .from("forum_comments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", pro.id);
      setNbMessages(messages ?? 0);
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger les statistiques", 'error');
    }
    setLoadingStats(false);
  }

  const stats = [
    { label: "Patients suivis", value: nbPatients },
    { label: "RDV ce mois", value: nbRdvMois },
    { label: "Messages échangés", value: nbMessages },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      <div style={{ padding: "36px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>

        {/* Bandeau d'accueil */}
        <section style={{
          position: "relative", overflow: "hidden",
          background: "#004649", borderRadius: "28px",
          padding: "44px 48px", marginBottom: "48px",
          display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "32px", flexWrap: "wrap",
          boxShadow: "0 24px 60px rgba(0,70,73,0.18)",
        }}>
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 85% 0%, rgba(183,215,232,0.28), transparent 45%), radial-gradient(circle at 0% 100%, rgba(165,201,185,0.22), transparent 40%)" }} />

          <div style={{ position: "relative" }}>
            <p style={{ ...eyebrow, color: "#A5C9B9", marginBottom: "14px" }}>Espace professionnel</p>
            <h1 style={{ color: "#F4EDE4", fontWeight: "600", fontSize: "38px", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "10px" }}>
              Bonjour, {pro ? pro.prenom : "…"} 👋
            </h1>
            <p style={{ color: "rgba(244,237,228,0.75)", fontSize: "15px", fontWeight: "300", maxWidth: "460px", lineHeight: 1.6 }}>
              Bienvenue sur votre espace Rêvade. Voici un aperçu de votre activité.
            </p>
          </div>

          <div style={{ position: "relative", display: "flex", gap: "12px", alignItems: "stretch", flexWrap: "wrap" }}>
            {stats.map((st) => (
              <div key={st.label} style={{
                minWidth: "130px", padding: "16px 20px", borderRadius: "20px",
                background: "rgba(244,237,228,0.08)", border: "1px solid rgba(244,237,228,0.16)",
              }}>
                <p style={{ color: "#F4EDE4", fontWeight: "600", fontSize: "30px", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {loadingStats ? "…" : st.value}
                </p>
                <p style={{ color: "rgba(244,237,228,0.65)", fontSize: "12px", marginTop: "8px" }}>{st.label}</p>
              </div>
            ))}
            <button onClick={loadStats} disabled={loadingStats} title="Actualiser" style={{
              width: "48px", borderRadius: "20px", border: "1px solid rgba(244,237,228,0.16)",
              background: "rgba(244,237,228,0.08)", color: "#F4EDE4",
              cursor: loadingStats ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: loadingStats ? "spin 0.8s linear infinite" : "none" }}>
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
            </button>
          </div>
        </section>

        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Accès rapide */}
          <div style={{ flex: "1 1 600px" }}>
            <p style={eyebrow}>Accès rapide</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {tuiles.map((t) => {
                const h = hovered === t.id;
                return (
                  <Link key={t.id} href={t.href} style={{ textDecoration: "none" }}>
                    <div onMouseEnter={() => setHovered(t.id)} onMouseLeave={() => setHovered(null)} style={{
                      height: "100%", background: "#FFFFFF", borderRadius: "24px", padding: "26px",
                      border: h ? "1px solid rgba(0,70,73,0.22)" : "1px solid rgba(0,70,73,0.08)",
                      boxShadow: h ? "0 24px 50px rgba(0,70,73,0.14)" : "0 8px 24px rgba(0,70,73,0.05)",
                      transform: h ? "translateY(-4px)" : "translateY(0)",
                      transition: "all 0.25s ease",
                      display: "flex", flexDirection: "column", gap: "18px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: t.tint, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                          {t.icon}
                        </div>
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: h ? "#004649" : "#EAF3F8", color: h ? "#F4EDE4" : "#004649",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.25s ease", transform: h ? "rotate(-45deg)" : "none",
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </div>
                      </div>
                      <div>
                        <p style={{ color: "#004649", fontWeight: "600", fontSize: "17px", marginBottom: "6px" }}>{t.label}</p>
                        <p style={{ color: "#5A6B72", fontSize: "13px", lineHeight: 1.6 }}>{t.desc}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
