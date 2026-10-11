"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import { showToast } from "@/lib/toast";

const tuiles = [
  { id: "dashboard", label: "Fiches patients", icon: "👥", desc: "Gérez et consultez les dossiers de vos patients", href: "/dashboard", color: "linear-gradient(135deg, #E8F5EF 0%, #C8E6D4 100%)", shadow: "rgba(0,70,73,0.15)" },
  { id: "agenda", label: "Agenda", icon: "📅", desc: "Gérez vos rendez-vous et votre planning", href: "/agenda", color: "linear-gradient(135deg, #E8F0F5 0%, #C8D8E6 100%)", shadow: "rgba(30,58,74,0.15)" },
  { id: "forum", label: "Messagerie", icon: "💬", desc: "Échangez avec vos patients en privé", href: "/forum?tab=messagerie", color: "linear-gradient(135deg, #F0EBF8 0%, #DDD0F0 100%)", shadow: "rgba(80,50,140,0.15)" },
  { id: "annuaire", label: "Annuaire", icon: "📞", desc: "Contacts utiles et ressources professionnelles", href: "/annuaire", color: "linear-gradient(135deg, #F5F0E8 0%, #E6D8C8 100%)", shadow: "rgba(180,120,0,0.15)" },
  { id: "outils", label: "Outils", icon: "🛠", desc: "Tests cliniques HAD, Beck, Horn et formations MOOC", href: "/outils", color: "linear-gradient(135deg, #E8F4FD 0%, #C8DCF0 100%)", shadow: "rgba(21,101,192,0.15)" },
  { id: "profil", label: "Profil", icon: "👤", desc: "Gérez vos informations et paramètres professionnels", href: "/profil", color: "linear-gradient(135deg, #FFF0F0 0%, #F0D8D8 100%)", shadow: "rgba(180,30,30,0.12)" },
];

export default function Accueil() {
  const [hovered, setHovered] = useState(null);
  const { pro } = useProProfile();

  const [nbPatients, setNbPatients] = useState("…");
  const [nbRdvMois, setNbRdvMois] = useState("…");
  const [nbMessages, setNbMessages] = useState("…");
  const [activiteRecente, setActiviteRecente] = useState([]);
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

      // Activité récente
      const activites = [];

      // Dernier patient ajouté
      const { data: derniersPatients } = await supabase
        .from("patient_professional_links")
        .select("patient_id, created_at")
        .eq("professional_id", pro.id)
        .order("created_at", { ascending: false })
        .limit(2);

      for (const lien of derniersPatients ?? []) {
        const { data: profil } = await supabase
          .from("profiles")
          .select("prenom, nom, pseudo")
          .eq("id", lien.patient_id)
          .single();
        const nom = profil ? `${profil.prenom ?? ""} ${profil.nom ?? ""}`.trim() || profil.pseudo : "Patient";
        activites.push({ icon: "👥", texte: "Patient suivi", detail: nom, ts: new Date(lien.created_at) });
      }

      // Derniers messages forum du pro
      const { data: derniersMessages } = await supabase
        .from("forum_comments")
        .select("contenu, created_at, post_id")
        .eq("user_id", pro.id)
        .order("created_at", { ascending: false })
        .limit(2);

      for (const msg of derniersMessages ?? []) {
        const { data: post } = await supabase
          .from("forum_posts")
          .select("titre")
          .eq("id", msg.post_id)
          .single();
        activites.push({ icon: "💬", texte: "Message envoyé", detail: post?.titre ?? "Publication", ts: new Date(msg.created_at) });
      }

      // Derniers RDV
      const { data: derniersRdv } = await supabase
        .from("appointments")
        .select("patient_name, date_heure, motif, statut")
        .eq("professional_id", pro.id)
        .order("created_at", { ascending: false })
        .limit(2);

      for (const rdv of derniersRdv ?? []) {
        const icon = rdv.statut === "en_attente" ? "⏳" : "📅";
        const label = rdv.statut === "en_attente" ? "Demande de RDV" : "Rendez-vous";
        activites.push({ icon, texte: label, detail: `${rdv.patient_name} — ${rdv.motif || ""}`, ts: new Date(rdv.date_heure) });
      }

      // Tri par date décroissante
      activites.sort((a, b) => b.ts - a.ts);
      setActiviteRecente(activites.slice(0, 5));
    } catch (e) {
      console.error(e);
      showToast("Impossible de charger les statistiques", 'error');
    }
    setLoadingStats(false);
  }

  function tempsRelatif(ts) {
    const diff = (Date.now() - ts.getTime()) / 1000;
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    if (diff < 172800) return "Hier";
    return `Il y a ${Math.floor(diff / 86400)} jours`;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />

      <div style={{ padding: "48px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ color: "#004649", fontWeight: "600", fontSize: "32px", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              Bonjour, {pro ? `${pro.prenom} ${pro.nom}` : "…"} 👋
            </h1>
            <p style={{ color: "#888", fontSize: "15px" }}>Bienvenue sur votre espace professionnel Rêvade</p>
          </div>
          <button onClick={loadStats} disabled={loadingStats} style={{
            background: "white", border: "1.5px solid #B7D7E8", borderRadius: "12px",
            padding: "10px 18px", fontSize: "13px", fontWeight: "600", color: "#004649",
            cursor: loadingStats ? "not-allowed" : "pointer", opacity: loadingStats ? 0.6 : 1,
            display: "flex", alignItems: "center", gap: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: loadingStats ? "spin 0.8s linear infinite" : "none" }}>
              <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
            {loadingStats ? "Actualisation…" : "Actualiser"}
          </button>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>

        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {/* Accès rapide */}
            <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "15px", marginBottom: "20px", letterSpacing: "0.5px" }}>ACCÈS RAPIDE</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {tuiles.map((t) => (
                <Link key={t.id} href={t.href} style={{ textDecoration: "none" }}>
                  <div onMouseEnter={() => setHovered(t.id)} onMouseLeave={() => setHovered(null)} style={{ background: t.color, borderRadius: "20px", padding: "32px 28px", cursor: "pointer", boxShadow: hovered === t.id ? `0 12px 30px ${t.shadow}` : `0 4px 12px ${t.shadow}`, border: "1px solid rgba(255,255,255,0.7)", transform: hovered === t.id ? "translateY(-4px)" : "translateY(0)", transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <span style={{ fontSize: "36px" }}>{t.icon}</span>
                    <div>
                      <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "17px", marginBottom: "6px" }}>{t.label}</p>
                      <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.5" }}>{t.desc}</p>
                    </div>
                    <div style={{ color: "#004649", fontSize: "13px", fontWeight: "600" }}>Accéder →</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Vue d'ensemble */}
            <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "15px", marginBottom: "20px", marginTop: "40px", letterSpacing: "0.5px" }}>VUE D'ENSEMBLE</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                { label: "Patients suivis", value: nbPatients, icon: "👥" },
                { label: "RDV ce mois", value: nbRdvMois, icon: "📅" },
                { label: "Messages échangés", value: nbMessages, icon: "💬" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "linear-gradient(135deg, #ffffff 0%, #EAF3F8 100%)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.06)", border: "1px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "28px" }}>{stat.icon}</span>
                  <div>
                    <p style={{ color: "#004649", fontWeight: "700", fontSize: "24px" }}>{loadingStats ? "…" : stat.value}</p>
                    <p style={{ color: "#888", fontSize: "12px" }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div style={{ width: "320px", flexShrink: 0 }}>
            <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "15px", marginBottom: "20px", letterSpacing: "0.5px" }}>ACTIVITÉ RÉCENTE</p>
            <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "24px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid rgba(255,255,255,0.7)" }}>
              {loadingStats ? (
                <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center" }}>Chargement…</p>
              ) : activiteRecente.length === 0 ? (
                <p style={{ color: "#aaa", fontSize: "13px", textAlign: "center", fontStyle: "italic" }}>Aucune activité récente</p>
              ) : activiteRecente.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "14px", padding: "16px 0", borderBottom: i < activiteRecente.length - 1 ? "1px solid #F0F0F0" : "none" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #E8F5EF 0%, #C8E6D4 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px" }}>{a.icon}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{a.texte}</p>
                    <p style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>{a.detail}</p>
                    <p style={{ color: "#B7D7E8", fontSize: "11px" }}>{tempsRelatif(a.ts)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
