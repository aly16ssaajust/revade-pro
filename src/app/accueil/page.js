"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const tuiles = [
  {
    id: "dashboard", label: "Fiches patients", icon: "👥",
    desc: "Gérez et consultez les dossiers de vos patients",
    href: "/dashboard",
    color: "linear-gradient(135deg, #E8F5EF 0%, #C8E6D4 100%)",
    shadow: "rgba(0,70,73,0.15)",
  },
  {
    id: "forum", label: "Forum", icon: "💬",
    desc: "Échangez avec vos patients et la communauté",
    href: "/forum",
    color: "linear-gradient(135deg, #E8F0F5 0%, #C8D8E6 100%)",
    shadow: "rgba(30,58,74,0.15)",
  },
  {
    id: "annuaire", label: "Annuaire", icon: "📞",
    desc: "Contacts utiles et ressources professionnelles",
    href: "/annuaire",
    color: "linear-gradient(135deg, #F5F0E8 0%, #E6D8C8 100%)",
    shadow: "rgba(180,120,0,0.15)",
  },
  {
    id: "profil", label: "Mon profil", icon: "👤",
    desc: "Gérez votre compte, agenda et informations",
    href: "/profil",
    color: "linear-gradient(135deg, #F0E8F5 0%, #D8C8E6 100%)",
    shadow: "rgba(100,0,150,0.15)",
  },
];

const activiteRecente = [
  { icon: "👥", texte: "Nouvelle fiche ajoutée", detail: "Lucas Schmidt", temps: "Il y a 2h" },
  { icon: "💬", texte: "Nouveau message dans le forum", detail: "Témoignages — Yannis", temps: "Il y a 3h" },
  { icon: "📋", texte: "Questionnaire complété", detail: "Amina Diallo", temps: "Il y a 1 jour" },
  { icon: "📅", texte: "Rendez-vous ajouté", detail: "Léa Martin — Bilan 3 mois", temps: "Il y a 2 jours" },
  { icon: "📄", texte: "Document importé", detail: "Compte-rendu Karim Benouli", temps: "Il y a 3 jours" },
];

export default function Accueil() {
  const [hovered, setHovered] = useState(null);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8" }}>

      {/* Navbar */}
      <nav style={{
        background: "linear-gradient(135deg, #C8E6F0 0%, #A8D4E6 100%)",
        padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
      }}>
        <Link href="/accueil" style={{ textDecoration: "none" }}>
          <Image src="/logo.png" alt="Rêvade" width={130} height={48} />
        </Link>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {[
            { href: "/accueil", label: "ACCUEIL", actif: true },
            { href: "/dashboard", label: "FICHES PATIENTS", actif: false },
            { href: "/forum", label: "FORUM", actif: false },
            { href: "/annuaire", label: "ANNUAIRE", actif: false },
            { href: "/profil", label: "PROFIL", actif: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "10px 20px", borderRadius: "10px",
                fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px",
                color: item.actif ? "white" : "#1E3A4A",
                background: item.actif
                  ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)",
                boxShadow: item.actif
                  ? "0 4px 8px rgba(0,70,73,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>{item.label}</div>
            </Link>
          ))}
        </div>
      </nav>

      <div style={{ padding: "48px 80px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* En-tête */}
        <div style={{ marginBottom: "48px" }}>
          <h1 style={{ color: "#004649", fontWeight: "700", fontSize: "28px", marginBottom: "8px" }}>
            Bonjour, Dr. Martin 👋
          </h1>
          <p style={{ color: "#888", fontSize: "15px" }}>
            Bienvenue sur votre espace professionnel Rêvade
          </p>
        </div>

        <div style={{ display: "flex", gap: "32px", alignItems: "flex-start" }}>

          {/* Tuiles principales */}
          <div style={{ flex: 1 }}>
            <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px", marginBottom: "20px", letterSpacing: "0.5px" }}>
              ACCÈS RAPIDE
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {tuiles.map((t) => (
                <Link key={t.id} href={t.href} style={{ textDecoration: "none" }}>
                  <div
                    onMouseEnter={() => setHovered(t.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: t.color,
                      borderRadius: "20px", padding: "32px 28px",
                      cursor: "pointer",
                      boxShadow: hovered === t.id
                        ? `0 12px 30px ${t.shadow}, inset 0 1px 0 rgba(255,255,255,0.8)`
                        : `0 4px 12px ${t.shadow}, inset 0 1px 0 rgba(255,255,255,0.7)`,
                      border: "1px solid rgba(255,255,255,0.7)",
                      transform: hovered === t.id ? "translateY(-4px)" : "translateY(0)",
                      transition: "all 0.2s ease",
                      display: "flex", flexDirection: "column", gap: "12px",
                    }}>
                    <span style={{ fontSize: "36px" }}>{t.icon}</span>
                    <div>
                      <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "17px", marginBottom: "6px" }}>{t.label}</p>
                      <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.5" }}>{t.desc}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#004649", fontSize: "13px", fontWeight: "600", marginTop: "4px" }}>
                      Accéder <span>→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Stats rapides */}
            <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px", marginBottom: "20px", marginTop: "40px", letterSpacing: "0.5px" }}>
              VUE D'ENSEMBLE
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                { label: "Patients suivis", value: "6", icon: "👥" },
                { label: "RDV ce mois", value: "8", icon: "📅" },
                { label: "Messages forum", value: "12", icon: "💬" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                  borderRadius: "16px", padding: "24px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
                  border: "1px solid rgba(255,255,255,0.7)",
                  display: "flex", alignItems: "center", gap: "16px",
                }}>
                  <span style={{ fontSize: "28px" }}>{stat.icon}</span>
                  <div>
                    <p style={{ color: "#004649", fontWeight: "700", fontSize: "24px" }}>{stat.value}</p>
                    <p style={{ color: "#888", fontSize: "12px" }}>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div style={{ width: "320px", flexShrink: 0 }}>
            <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px", marginBottom: "20px", letterSpacing: "0.5px" }}>
              ACTIVITÉ RÉCENTE
            </p>
            <div style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              borderRadius: "20px", padding: "24px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.7)",
              display: "flex", flexDirection: "column", gap: "0px",
            }}>
              {activiteRecente.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "14px",
                  padding: "16px 0",
                  borderBottom: i < activiteRecente.length - 1 ? "1px solid #F0F0F0" : "none",
                }}>
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #E8F5EF 0%, #C8E6D4 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: "16px",
                    boxShadow: "0 2px 6px rgba(0,70,73,0.1)",
                  }}>
                    {a.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#1E3A4A", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{a.texte}</p>
                    <p style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>{a.detail}</p>
                    <p style={{ color: "#B8D8E8", fontSize: "11px" }}>{a.temps}</p>
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