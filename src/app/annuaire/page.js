"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const categories = [
  {
    id: 1, nom: "Tabac & Vapotage", icon: "🚭",
    contacts: [
      { nom: "Tabac Info Service", tel: "39 89", desc: "Aide au sevrage tabagique, 7j/7 de 8h à 20h", site: "https://www.tabac-info-service.fr", gratuit: true },
      { nom: "Alliance Contre le Tabac", tel: "01 48 87 65 87", desc: "Association nationale de lutte contre le tabac", site: "https://www.alliancecontreletabac.org", gratuit: false },
    ]
  },
  {
    id: 2, nom: "Addictions & Drogues", icon: "💊",
    contacts: [
      { nom: "Drogues Info Service", tel: "0 800 23 13 13", desc: "Écoute, information et orientation, anonyme et gratuit 7j/7", site: "https://www.drogues-info-service.fr", gratuit: true },
      { nom: "Narcotics Anonymous France", tel: "0 806 000 392", desc: "Groupes de soutien pour personnes dépendantes", site: "https://www.narcotiques-anonymes.fr", gratuit: true },
    ]
  },
  {
    id: 3, nom: "Alcool", icon: "🍷",
    contacts: [
      { nom: "Alcool Info Service", tel: "0 980 980 930", desc: "Aide et orientation pour les problèmes liés à l'alcool, 7j/7", site: "https://www.alcool-info-service.fr", gratuit: true },
      { nom: "Alcooliques Anonymes", tel: "09 69 39 40 20", desc: "Programme de rétablissement en 12 étapes", site: "https://www.alcooliques-anonymes.fr", gratuit: true },
    ]
  },
  {
    id: 4, nom: "Santé mentale", icon: "🧠",
    contacts: [
      { nom: "3114 - Numéro National Prévention Suicide", tel: "3114", desc: "Ligne nationale de prévention du suicide, 24h/24", site: "https://www.3114.fr", gratuit: true },
      { nom: "Fil Santé Jeunes", tel: "0 800 235 236", desc: "Écoute pour les jeunes, anonyme et gratuit", site: "https://www.filsantejeunes.com", gratuit: true },
      { nom: "France Dépression", tel: "01 40 61 61 61", desc: "Association d'aide aux personnes souffrant de dépression", site: "https://www.france-depression.org", gratuit: false },
    ]
  },
  {
    id: 5, nom: "Urgences & Orientation", icon: "🚨",
    contacts: [
      { nom: "SAMU", tel: "15", desc: "Urgences médicales", site: null, gratuit: true },
      { nom: "Sida Info Service", tel: "0 800 840 800", desc: "Information et soutien autour du VIH/SIDA", site: "https://www.sida-info-service.org", gratuit: true },
      { nom: "Hépatites Info Service", tel: "0 800 845 800", desc: "Information sur les hépatites virales", site: null, gratuit: true },
    ]
  },
  {
    id: 6, nom: "Ressources professionnelles", icon: "👨‍⚕️",
    contacts: [
      { nom: "Conseil National de l'Ordre des Médecins", tel: "01 53 89 32 00", desc: "Instance ordinale nationale des médecins", site: "https://www.conseil-national.medecin.fr", gratuit: false },
      { nom: "Société Française de Tabacologie", tel: null, desc: "Société savante dédiée à la prise en charge du tabagisme", site: "https://www.tabacologie.org", gratuit: false },
      { nom: "INPES - Santé Publique France", tel: null, desc: "Ressources et outils pour les professionnels de santé", site: "https://www.santepubliquefrance.fr", gratuit: false },
    ]
  },
];

export default function Annuaire() {
  const [recherche, setRecherche] = useState("");
  const [categorieActive, setCategorieActive] = useState(null);
  const [hovered, setHovered] = useState(null);

  const contactsFiltres = categories.flatMap((c) =>
    c.contacts.map((contact) => ({ ...contact, categorie: c.nom, categorieIcon: c.icon }))
  ).filter((c) =>
    c.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    c.desc.toLowerCase().includes(recherche.toLowerCase()) ||
    c.categorie.toLowerCase().includes(recherche.toLowerCase())
  );

  const categoriesAffichees = recherche
    ? null
    : categorieActive !== null
      ? categories.filter((c) => c.id === categorieActive)
      : categories;

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
            { href: "/accueil", label: "ACCUEIL", actif: false },
            { href: "/dashboard", label: "FICHES PATIENTS", actif: false },
            { href: "/forum", label: "FORUM", actif: false },
            { href: "/annuaire", label: "ANNUAIRE", actif: true },
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

      <div style={{ padding: "40px 80px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* En-tête */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ color: "#004649", fontWeight: "700", fontSize: "24px", marginBottom: "8px" }}>
            📞 Annuaire professionnel
          </h1>
          <p style={{ color: "#888", fontSize: "14px" }}>
            Ressources et contacts utiles pour accompagner vos patients
          </p>
        </div>

        {/* Barre de recherche */}
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          borderRadius: "16px", padding: "14px 20px", marginBottom: "32px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.8)",
          display: "flex", alignItems: "center", gap: "12px",
        }}>
          <span style={{ fontSize: "18px" }}>🔍</span>
          <input
            type="text" placeholder="Rechercher un contact, une ressource..."
            value={recherche} onChange={(e) => setRecherche(e.target.value)}
            style={{ width: "100%", outline: "none", border: "none", fontSize: "14px", color: "#1E3A4A", backgroundColor: "transparent" }}
          />
          {recherche && (
            <button onClick={() => setRecherche("")} style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "18px" }}>×</button>
          )}
        </div>

        {/* Filtres catégories */}
        {!recherche && (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
            <button
              onClick={() => setCategorieActive(null)}
              style={{
                padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "600",
                cursor: "pointer", border: "none",
                background: categorieActive === null
                  ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)"
                  : "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                color: categorieActive === null ? "white" : "#1E3A4A",
                boxShadow: categorieActive === null
                  ? "0 4px 8px rgba(0,70,73,0.3)"
                  : "0 2px 4px rgba(0,0,0,0.08)",
              }}>
              Tout voir
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategorieActive(categorieActive === cat.id ? null : cat.id)}
                style={{
                  padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "600",
                  cursor: "pointer", border: "none",
                  background: categorieActive === cat.id
                    ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)"
                    : "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                  color: categorieActive === cat.id ? "white" : "#1E3A4A",
                  boxShadow: categorieActive === cat.id
                    ? "0 4px 8px rgba(0,70,73,0.3)"
                    : "0 2px 4px rgba(0,0,0,0.08)",
                }}>
                {cat.icon} {cat.nom}
              </button>
            ))}
          </div>
        )}

        {/* Résultats recherche */}
        {recherche && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ color: "#888", fontSize: "13px" }}>{contactsFiltres.length} résultat(s) pour "{recherche}"</p>
            {contactsFiltres.map((contact, i) => (
              <ContactCard key={i} contact={contact} hovered={hovered} setHovered={setHovered} showCategorie />
            ))}
          </div>
        )}

        {/* Catégories et contacts */}
        {!recherche && categoriesAffichees && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {categoriesAffichees.map((cat) => (
              <div key={cat.id}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "22px" }}>{cat.icon}</span>
                  <h2 style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "16px" }}>{cat.nom}</h2>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                  {cat.contacts.map((contact, i) => (
                    <ContactCard key={i} contact={contact} hovered={hovered} setHovered={setHovered} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ContactCard({ contact, hovered, setHovered, showCategorie }) {
  const key = contact.nom;
  return (
    <div
      onMouseEnter={() => setHovered(key)}
      onMouseLeave={() => setHovered(null)}
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
        borderRadius: "16px", padding: "24px",
        boxShadow: hovered === key
          ? "0 8px 24px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)"
          : "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
        border: "1px solid rgba(255,255,255,0.7)",
        transform: hovered === key ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.2s ease",
      }}>

      {showCategorie && (
        <p style={{ color: "#888", fontSize: "12px", marginBottom: "8px" }}>
          {contact.categorieIcon} {contact.categorie}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
        <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px", flex: 1 }}>{contact.nom}</p>
        {contact.gratuit && (
          <span style={{
            background: "linear-gradient(135deg, #E8F5EF 0%, #C8E6D4 100%)",
            color: "#004649", borderRadius: "999px", padding: "3px 10px",
            fontSize: "11px", fontWeight: "600", marginLeft: "8px", flexShrink: 0,
          }}>Gratuit</span>
        )}
      </div>

      <p style={{ color: "#888", fontSize: "13px", lineHeight: "1.5", marginBottom: "16px" }}>{contact.desc}</p>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {contact.tel && (
          <a href={`tel:${contact.tel}`} style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)",
              color: "white", borderRadius: "10px", padding: "8px 16px",
              fontSize: "13px", fontWeight: "600",
              boxShadow: "0 4px 8px rgba(0,70,73,0.25)",
              display: "flex", alignItems: "center", gap: "6px",
            }}>
              📞 {contact.tel}
            </div>
          </a>
        )}
        {contact.site && (
          <a href={contact.site} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
            <div style={{
              background: "linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)",
              color: "#1E3A4A", borderRadius: "10px", padding: "8px 16px",
              fontSize: "13px", fontWeight: "600",
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              display: "flex", alignItems: "center", gap: "6px",
              border: "1px solid rgba(255,255,255,0.8)",
            }}>
              🌐 Site web
            </div>
          </a>
        )}
      </div>
    </div>
  );
}