"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const rdvData = {
  "2026-03-30": [
    { heure: "09h00", patient: "Amina Diallo", type: "Consultation sevrage" },
    { heure: "11h30", patient: "Karim Benouli", type: "Suivi mensuel" },
    { heure: "14h00", patient: "Léa Martin", type: "Bilan 3 mois" },
  ],
  "2026-03-25": [
    { heure: "10h00", patient: "Sofia Rodriguez", type: "Première consultation" },
    { heure: "15h00", patient: "Lucas Schmidt", type: "Suivi hebdomadaire" },
  ],
  "2026-03-18": [
    { heure: "09h30", patient: "Mei Chen", type: "Bilan mensuel" },
  ],
  "2026-04-02": [
    { heure: "10h00", patient: "Amina Diallo", type: "Suivi mensuel" },
    { heure: "14h30", patient: "Karim Benouli", type: "Bilan 2 mois" },
  ],
  "2026-04-08": [
    { heure: "11h00", patient: "Léa Martin", type: "Consultation sevrage" },
  ],
};

const moisNoms = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const joursNoms = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function Profil() {
  const [modeEdition, setModeEdition] = useState(false);
  const [section, setSection] = useState(null);
  const today = new Date();
  const [moisActuel, setMoisActuel] = useState(today.getMonth());
  const [anneeActuelle, setAnneeActuelle] = useState(today.getFullYear());
  const [jourSelectionne, setJourSelectionne] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  const [profil, setProfil] = useState({
    nom: "Michel Martin",
    titre: "Médecin généraliste",
    email: "michel.martin@cabinet.fr",
    telephone: "06 12 34 56 78",
    cabinet: "Cabinet Médical du Parc",
    adresse: "12 rue des Lilas, 75010 Paris",
    specialite: "Addictologie",
    rpps: "12345678901",
  });

  const handleChange = (field, value) => setProfil((prev) => ({ ...prev, [field]: value }));

  const getPremierJourMois = () => {
    const d = new Date(anneeActuelle, moisActuel, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };

  const getNbJoursMois = () => new Date(anneeActuelle, moisActuel + 1, 0).getDate();

  const moisPrecedent = () => {
    if (moisActuel === 0) { setMoisActuel(11); setAnneeActuelle(a => a - 1); }
    else setMoisActuel(m => m - 1);
  };

  const moisSuivant = () => {
    if (moisActuel === 11) { setMoisActuel(0); setAnneeActuelle(a => a + 1); }
    else setMoisActuel(m => m + 1);
  };

  const formatKey = (day) => `${anneeActuelle}-${String(moisActuel + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const rdvJour = rdvData[jourSelectionne] || [];
  const jourSelectDate = jourSelectionne ? parseInt(jourSelectionne.split("-")[2]) : null;
  const moisSelectDate = jourSelectionne ? parseInt(jourSelectionne.split("-")[1]) - 1 : null;
  const anneeSelectDate = jourSelectionne ? parseInt(jourSelectionne.split("-")[0]) : null;

  const sections = [
    { id: "annuaire", label: "Mes informations sur l'annuaire", icon: "📋" },
    { id: "parametres", label: "Paramètres du compte", icon: "⚙️" },
    { id: "agenda", label: "Agenda", icon: "📅" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#B8D8E8", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo.png" alt="Rêvade" width={130} height={48} />
        <div style={{ display: "flex", gap: "60px", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px", letterSpacing: "1px", textDecoration: "none" }}>FICHES PATIENTS</Link>
          <Link href="/forum" style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px", letterSpacing: "1px", textDecoration: "none" }}>FORUM</Link>
          <Link href="/profil" style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "14px", letterSpacing: "1px", textDecoration: "none", borderBottom: "2px solid #1E3A4A", paddingBottom: "2px" }}>PROFIL</Link>
        </div>
      </nav>

      <div style={{ padding: "40px 80px", maxWidth: "1100px", margin: "0 auto" }}>

        {section !== null ? (
          <div>
            <button onClick={() => setSection(null)} style={{ background: "none", border: "none", color: "#1E3A4A", fontWeight: "600", fontSize: "15px", cursor: "pointer", marginBottom: "32px", display: "flex", alignItems: "center", gap: "8px" }}>
              ← Retour au profil
            </button>

            {/* ANNUAIRE */}
            {section === "annuaire" && (
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "18px" }}>Mes informations sur l'annuaire</h2>
                  <button onClick={() => setModeEdition(!modeEdition)} style={{ backgroundColor: modeEdition ? "#004649" : "white", color: modeEdition ? "white" : "#004649", border: "2px solid #004649", borderRadius: "12px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                    {modeEdition ? "✓ Sauvegarder" : "✏️ Modifier"}
                  </button>
                </div>
                {[["Nom complet", "nom"], ["Titre", "titre"], ["Email professionnel", "email"], ["Téléphone", "telephone"], ["Cabinet", "cabinet"], ["Adresse", "adresse"], ["Spécialité", "specialite"], ["Numéro RPPS", "rpps"]].map(([label, field]) => (
                  <div key={field} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid #F0F0F0" }}>
                    <span style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600", minWidth: "220px" }}>{label}</span>
                    {modeEdition ? (
                      <input value={profil[field]} onChange={(e) => handleChange(field, e.target.value)} style={{ flex: 1, border: "1px solid #B8D8E8", borderRadius: "8px", padding: "8px 14px", fontSize: "14px", color: "#1E3A4A", outline: "none" }} />
                    ) : (
                      <span style={{ color: "#1E3A4A", fontSize: "14px" }}>{profil[field]}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PARAMÈTRES */}
            {section === "parametres" && (
              <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "40px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "18px", marginBottom: "32px" }}>Paramètres du compte</h2>
                {[
                  { label: "Changer le mot de passe", desc: "Modifier votre mot de passe de connexion", icon: "🔒" },
                  { label: "Notifications", desc: "Gérer vos préférences de notifications", icon: "🔔" },
                  { label: "Langue", desc: "Français", icon: "🌍" },
                  { label: "Confidentialité", desc: "Gérer vos données personnelles", icon: "🛡️" },
                  { label: "Se déconnecter", desc: "Fermer votre session", icon: "🚪", danger: true },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid #F0F0F0", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "22px" }}>{item.icon}</span>
                      <div>
                        <p style={{ color: item.danger ? "#E53935" : "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>{item.label}</p>
                        <p style={{ color: "#aaa", fontSize: "13px", marginTop: "2px" }}>{item.desc}</p>
                      </div>
                    </div>
                    <span style={{ color: "#aaa", fontSize: "18px" }}>›</span>
                  </div>
                ))}
              </div>
            )}

            {/* AGENDA */}
            {section === "agenda" && (
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

                {/* Calendrier */}
                <div style={{ backgroundColor: "white", borderRadius: "20px", padding: "32px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", minWidth: "420px" }}>
                  {/* Navigation mois */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <button onClick={moisPrecedent} style={{ background: "none", border: "none", color: "#1E3A4A", fontSize: "18px", cursor: "pointer" }}>◀</button>
                    <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "16px" }}>{moisNoms[moisActuel]} {anneeActuelle}</span>
                    <button onClick={moisSuivant} style={{ background: "none", border: "none", color: "#1E3A4A", fontSize: "18px", cursor: "pointer" }}>▶</button>
                  </div>

                  {/* Jours semaine */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                    {joursNoms.map((j) => (
                      <div key={j} style={{ textAlign: "center", color: "#888", fontSize: "12px", fontWeight: "600", padding: "4px" }}>{j}</div>
                    ))}
                  </div>

                  {/* Cases jours */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                    {Array.from({ length: getPremierJourMois() }).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: getNbJoursMois() }, (_, i) => i + 1).map((day) => {
                      const key = formatKey(day);
                      const aRdv = !!rdvData[key];
                      const estSelectionne = jourSelectDate === day && moisSelectDate === moisActuel && anneeSelectDate === anneeActuelle;
                      const estAujourdhui = day === today.getDate() && moisActuel === today.getMonth() && anneeActuelle === today.getFullYear();
                      return (
                        <div
                          key={day}
                          onClick={() => setJourSelectionne(key)}
                          style={{
                            textAlign: "center",
                            padding: "10px 4px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            backgroundColor: estSelectionne ? "#004649" : estAujourdhui ? "#DFF0EA" : "transparent",
                            color: estSelectionne ? "white" : "#1E3A4A",
                            fontWeight: estSelectionne || estAujourdhui ? "700" : "400",
                            fontSize: "14px",
                            position: "relative",
                          }}
                        >
                          {day}
                          {aRdv && (
                            <div style={{ position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: estSelectionne ? "white" : "#004649" }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RDV du jour sélectionné */}
                <div style={{ flex: 1, backgroundColor: "white", borderRadius: "20px", padding: "32px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)" }}>
                  <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "20px" }}>
                    📅 {jourSelectionne ? `${parseInt(jourSelectionne.split("-")[2])} ${moisNoms[parseInt(jourSelectionne.split("-")[1]) - 1]} ${jourSelectionne.split("-")[0]}` : "Sélectionnez un jour"}
                  </p>
                  {rdvJour.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun rendez-vous ce jour</p>
                  ) : (
                    rdvJour.map((rdv, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px 20px", backgroundColor: "#F5F9F8", borderRadius: "12px", marginBottom: "12px", borderLeft: "4px solid #004649" }}>
                        <span style={{ color: "#004649", fontWeight: "700", fontSize: "14px", minWidth: "60px" }}>{rdv.heure}</span>
                        <div>
                          <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>{rdv.patient}</p>
                          <p style={{ color: "#888", fontSize: "13px" }}>{rdv.type}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        ) : (
          <div>
            {/* En-tête profil */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "48px", position: "relative" }}>
              <button onClick={() => setSection("annuaire")} style={{ position: "absolute", right: 0, top: 0, backgroundColor: "#004649", color: "white", borderRadius: "12px", padding: "12px 24px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer" }}>
                ✏️ Modifier le profil
              </button>
              <div style={{ width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#DFF0EA", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px" }}>
                <svg width="50" height="50" viewBox="0 0 24 24" fill="#004649">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
              <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "20px", marginBottom: "4px" }}>{profil.nom}</p>
              <p style={{ color: "#888", fontSize: "14px", marginBottom: "4px" }}>{profil.titre}</p>
              <p style={{ color: "#888", fontSize: "14px" }}>{profil.specialite}</p>
              <div style={{ marginTop: "12px", backgroundColor: "#004649", color: "white", borderRadius: "999px", padding: "6px 16px", fontSize: "13px", fontWeight: "600" }}>
                ✓ Professionnel certifié
              </div>
            </div>

            {/* Grille sections */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px" }}>
              {sections.map((s) => (
                <div key={s.id} onClick={() => setSection(s.id)} style={{ backgroundColor: "white", borderRadius: "20px", padding: "36px 32px", boxShadow: "0 1px 6px rgba(0,0,0,0.08)", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "28px" }}>{s.icon}</span>
                  <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}