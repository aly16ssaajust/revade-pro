"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import CalendarSync from "@/components/CalendarSync";
import { showToast } from "@/lib/toast";

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
  "2026-03-18": [{ heure: "09h30", patient: "Mei Chen", type: "Bilan mensuel" }],
  "2026-04-02": [
    { heure: "10h00", patient: "Amina Diallo", type: "Suivi mensuel" },
    { heure: "14h30", patient: "Karim Benouli", type: "Bilan 2 mois" },
  ],
  "2026-04-08": [{ heure: "11h00", patient: "Léa Martin", type: "Consultation sevrage" }],
};

const moisNoms = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const joursNoms = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
const patientsListe = ["Amina Diallo","Karim Benouli","Mei Chen","Léa Martin","Sofia Rodriguez","Lucas Schmidt"];
const motifsList = ["Consultation sevrage","Suivi mensuel","Bilan 3 mois","Première consultation","Suivi hebdomadaire","Bilan mensuel"];


export default function Profil() {
  const router = useRouter();
  const { pro, setPro, loading } = useProProfile();
  const [modeEdition, setModeEdition] = useState(false);
  const [section, setSection] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'ok' | 'error' | null
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null); // 'ok' | 'error' | null
  const today = new Date();
  const [moisActuel, setMoisActuel] = useState(today.getMonth());
  const [anneeActuelle, setAnneeActuelle] = useState(today.getFullYear());
  const [jourSelectionne, setJourSelectionne] = useState(
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`
  );
  const [rdvs, setRdvs] = useState(rdvData);
  const [showModalRdv, setShowModalRdv] = useState(false);
  const [nouveauRdv, setNouveauRdv] = useState({ date: "", heure: "", patient: "", type: "" });

  const handleChange = (field, value) => setPro((prev) => ({ ...prev, [field]: value }));

  async function handleSave() {
    if (!pro) return;
    setSaveLoading(true);
    setSaveStatus(null);
    const { error } = await supabase.from('professionals').update({
      nom: pro.nom,
      prenom: pro.prenom,
      titre: pro.titre,
      specialite: pro.specialite,
      telephone: pro.telephone,
      cabinet: pro.cabinet,
      adresse: pro.adresse,
      rpps: pro.rpps,
      bio: pro.bio ?? '',
      doctolib_url: pro.doctolib_url ?? '',
      booking_email: pro.booking_email ?? '',
      booking_phone: pro.booking_phone ?? '',
      booking_revade: pro.booking_revade ?? false,
      visible_annuaire: pro.visible_annuaire ?? true,
    }).eq('id', pro.id);
    setSaveLoading(false);
    if (error) {
      console.error('Supabase save error:', error.code, error.message, error.details);
      setSaveStatus(error.message || 'error');
    } else {
      setSaveStatus('ok');
      setModeEdition(false);
      showToast("Profil mis à jour avec succès");
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }

  async function handlePasswordChange() {
    if (!newPassword || newPassword !== confirmPassword) {
      setPasswordStatus('error');
      return;
    }
    setPasswordLoading(true);
    setPasswordStatus(null);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      setPasswordStatus('error');
    } else {
      setPasswordStatus('ok');
      setNewPassword("");
      setConfirmPassword("");
      showToast("Mot de passe modifié avec succès");
      setTimeout(() => { setShowPasswordModal(false); setPasswordStatus(null); }, 1500);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/connexion');
  }

  async function handleDeleteAccount() {
    try {
      await supabase.rpc('delete_my_account');
    } catch (_) {}
    await supabase.auth.signOut();
    router.push('/connexion');
  }

  const getPremierJourMois = () => {
    const d = new Date(anneeActuelle, moisActuel, 1).getDay();
    return d === 0 ? 6 : d - 1;
  };
  const getNbJoursMois = () => new Date(anneeActuelle, moisActuel + 1, 0).getDate();
  const moisPrecedent = () => { if (moisActuel === 0) { setMoisActuel(11); setAnneeActuelle(a => a-1); } else setMoisActuel(m => m-1); };
  const moisSuivant = () => { if (moisActuel === 11) { setMoisActuel(0); setAnneeActuelle(a => a+1); } else setMoisActuel(m => m+1); };
  const formatKey = (day) => `${anneeActuelle}-${String(moisActuel+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const rdvJour = rdvs[jourSelectionne] || [];
  const jourSelectDate = jourSelectionne ? parseInt(jourSelectionne.split("-")[2]) : null;
  const moisSelectDate = jourSelectionne ? parseInt(jourSelectionne.split("-")[1]) - 1 : null;
  const anneeSelectDate = jourSelectionne ? parseInt(jourSelectionne.split("-")[0]) : null;

  const ajouterRdv = () => {
    if (!nouveauRdv.date || !nouveauRdv.heure || !nouveauRdv.patient || !nouveauRdv.type) return;
    setRdvs((prev) => ({
      ...prev,
      [nouveauRdv.date]: [...(prev[nouveauRdv.date] || []), {
        heure: nouveauRdv.heure, patient: nouveauRdv.patient, type: nouveauRdv.type
      }].sort((a, b) => a.heure.localeCompare(b.heure)),
    }));
    setJourSelectionne(nouveauRdv.date);
    setShowModalRdv(false);
    setNouveauRdv({ date: "", heure: "", patient: "", type: "" });
  };

  const cardStyle = {
    background: "#FFFFFF",
    borderRadius: "24px", padding: "40px",
    border: "1px solid rgba(0,70,73,0.08)",
    boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
  };

  const sections = [
    { id: "annuaire", label: "Mes informations sur l'annuaire", icon: "📋" },
    { id: "parametres", label: "Paramètres du compte", icon: "⚙️" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />

      <div style={{ padding: "40px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>

        {section !== null ? (
          <div>
            <button onClick={() => setSection(null)} style={{ background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", padding: 0, marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "white", border: "1px solid rgba(0,70,73,0.12)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A3F4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: "11px", color: "#004649", fontWeight: "500", letterSpacing: "0.18em" }}>PROFIL</p>
                <p style={{ margin: 0, fontSize: "15px", color: "#004649", fontWeight: "600" }}>{sections.find(s => s.id === section)?.label || "Retour"}</p>
              </div>
            </button>

            {/* ANNUAIRE */}
            {section === "annuaire" && (
              <div style={cardStyle}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                  <h2 style={{ color: "#004649", fontWeight: "600", fontSize: "20px", letterSpacing: "-0.01em" }}>Mes informations sur l'annuaire</h2>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {saveStatus === 'ok' && (
                      <span style={{ color: "#004649", fontWeight: "600", fontSize: "13px" }}>✓ Sauvegardé</span>
                    )}
                    {saveStatus && saveStatus !== 'ok' && (
                      <span style={{ color: "#E53935", fontWeight: "600", fontSize: "12px", maxWidth: "300px" }}>❌ {saveStatus}</span>
                    )}
                    <button onClick={() => modeEdition ? handleSave() : setModeEdition(true)} style={{
                      background: modeEdition ? "linear-gradient(135deg, #004649 0%, #00363A 100%)" : "white",
                      color: modeEdition ? "#F4EDE4" : "#004649", border: "1px solid #004649",
                      borderRadius: "50px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
                      boxShadow: modeEdition ? "0 4px 8px rgba(0,70,73,0.3)" : "0 2px 4px rgba(0,0,0,0.08)",
                      opacity: saveLoading ? 0.7 : 1,
                    }}>
                      {modeEdition ? (saveLoading ? "Sauvegarde..." : "✓ Sauvegarder") : "✏️ Modifier"}
                    </button>
                  </div>
                </div>
                {/* Infos de base */}
                {[
                  ["Nom complet","nom"],["Titre","titre"],["Email professionnel","email"],
                  ["Téléphone","telephone"],["Cabinet","cabinet"],["Adresse","adresse"],
                  ["Spécialité","specialite"],["Numéro RPPS","rpps"]
                ].map(([label, field]) => (
                  <div key={field} style={{ display: "flex", alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(0,70,73,0.08)" }}>
                    <span style={{ color: "#5A6B72", fontSize: "13px", minWidth: "220px" }}>{label}</span>
                    {modeEdition ? (
                      <input value={pro?.[field] ?? ''} onChange={(e) => handleChange(field, e.target.value)}
                        style={{ flex: 1, border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "8px 14px", fontSize: "14px", color: "#2A3F4F", outline: "none" }} />
                    ) : (
                      <span style={{ color: "#004649", fontSize: "15px", fontWeight: "600" }}>{pro?.[field] ?? ''}</span>
                    )}
                  </div>
                ))}

                {/* Bio */}
                <div style={{ padding: "16px 0", borderBottom: "1px solid rgba(0,70,73,0.08)" }}>
                  <span style={{ color: "#2A3F4F", fontSize: "14px", fontWeight: "600", display: "block", marginBottom: "8px" }}>Bio / Présentation</span>
                  {modeEdition ? (
                    <textarea value={pro?.bio ?? ''} onChange={(e) => handleChange('bio', e.target.value)} rows={3}
                      style={{ width: "100%", border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "8px 14px", fontSize: "14px", color: "#2A3F4F", outline: "none", resize: "vertical" }} />
                  ) : (
                    <span style={{ color: "#2A3F4F", fontSize: "14px" }}>{pro?.bio || <em style={{ color: "#90A4AE" }}>Non renseigné</em>}</span>
                  )}
                </div>

                {/* Prise de RDV */}
                <div style={{ padding: "20px 0 8px" }}>
                  <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "12px" }}>Options de prise de rendez-vous</p>
                  {[
                    ["Email de réservation","booking_email","Affiché aux patients pour vous contacter par email"],
                    ["Téléphone de réservation","booking_phone","Affiché aux patients pour vous appeler"],
                    ["Lien Doctolib","doctolib_url","URL complète de votre profil Doctolib"],
                  ].map(([label, field, hint]) => (
                    <div key={field} style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(0,70,73,0.08)" }}>
                      <div style={{ minWidth: "220px" }}>
                        <span style={{ color: "#2A3F4F", fontSize: "14px", fontWeight: "600" }}>{label}</span>
                        {modeEdition && <p style={{ color: "#90A4AE", fontSize: "11px", marginTop: "2px" }}>{hint}</p>}
                      </div>
                      {modeEdition ? (
                        <input value={pro?.[field] ?? ''} onChange={(e) => handleChange(field, e.target.value)}
                          placeholder={hint}
                          style={{ flex: 1, border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "8px 14px", fontSize: "14px", color: "#2A3F4F", outline: "none" }} />
                      ) : (
                        <span style={{ color: "#2A3F4F", fontSize: "14px" }}>{pro?.[field] || <em style={{ color: "#90A4AE" }}>Non renseigné</em>}</span>
                      )}
                    </div>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(0,70,73,0.08)" }}>
                    <div style={{ minWidth: "220px" }}>
                      <span style={{ color: "#2A3F4F", fontSize: "14px", fontWeight: "600" }}>Prise de RDV via Rêvade</span>
                      {modeEdition && <p style={{ color: "#90A4AE", fontSize: "11px", marginTop: "2px" }}>Les patients peuvent demander un créneau depuis l'app</p>}
                    </div>
                    {modeEdition ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input type="checkbox" checked={pro?.booking_revade ?? false} onChange={(e) => handleChange('booking_revade', e.target.checked)}
                          style={{ width: "18px", height: "18px", accentColor: "#004649", cursor: "pointer" }} />
                        <span style={{ fontSize: "14px", color: "#2A3F4F" }}>{pro?.booking_revade ? "Activé" : "Désactivé"}</span>
                      </label>
                    ) : (
                      <span style={{ color: pro?.booking_revade ? "#004649" : "#aaa", fontSize: "14px", fontWeight: "600" }}>
                        {pro?.booking_revade ? "✓ Activé" : "Désactivé"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Visibilité annuaire */}
                <div style={{ padding: "20px 0 8px", borderTop: "1px solid rgba(0,70,73,0.08)", marginTop: "8px" }}>
                  <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Visibilité</p>
                  <div style={{ display: "flex", alignItems: "center", padding: "12px 0" }}>
                    <div style={{ minWidth: "220px" }}>
                      <span style={{ color: "#2A3F4F", fontSize: "14px", fontWeight: "600" }}>Apparaître dans l'annuaire</span>
                      {modeEdition && <p style={{ color: "#90A4AE", fontSize: "11px", marginTop: "2px" }}>Les patients peuvent vous trouver dans la liste des professionnels Rêvade</p>}
                    </div>
                    {modeEdition ? (
                      <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                        <input type="checkbox" checked={pro?.visible_annuaire ?? true} onChange={(e) => handleChange('visible_annuaire', e.target.checked)}
                          style={{ width: "18px", height: "18px", accentColor: "#004649", cursor: "pointer" }} />
                        <span style={{ fontSize: "14px", color: "#2A3F4F" }}>{(pro?.visible_annuaire ?? true) ? "Visible" : "Caché"}</span>
                      </label>
                    ) : (
                      <span style={{ color: (pro?.visible_annuaire ?? true) ? "#004649" : "#aaa", fontSize: "14px", fontWeight: "600" }}>
                        {(pro?.visible_annuaire ?? true) ? "✓ Visible dans l'annuaire" : "Non affiché dans l'annuaire"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PARAMÈTRES */}
            {section === "parametres" && (
              <div style={cardStyle}>
                <h2 style={{ color: "#004649", fontWeight: "600", fontSize: "20px", letterSpacing: "-0.01em", marginBottom: "32px" }}>Paramètres du compte</h2>
                <div onClick={() => setShowPasswordModal(true)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid rgba(0,70,73,0.08)", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#EAF3F8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🔒</span>
                    <div>
                      <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "14px" }}>Changer le mot de passe</p>
                      <p style={{ color: "#90A4AE", fontSize: "13px", marginTop: "2px" }}>Modifier votre mot de passe de connexion</p>
                    </div>
                  </div>
                  <span style={{ color: "#90A4AE", fontSize: "18px" }}>›</span>
                </div>
                {[
                  { label: "Langue", desc: "Français", icon: "🌍" },
                  { label: "Confidentialité", desc: "Gérer vos données personnelles", icon: "🛡️" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", borderBottom: "1px solid rgba(0,70,73,0.08)", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#EAF3F8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>{item.icon}</span>
                      <div>
                        <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "14px" }}>{item.label}</p>
                        <p style={{ color: "#90A4AE", fontSize: "13px", marginTop: "2px" }}>{item.desc}</p>
                      </div>
                    </div>
                    <span style={{ color: "#90A4AE", fontSize: "18px" }}>›</span>
                  </div>
                ))}
              </div>
            )}

            {/* AGENDA */}
            {section === "agenda" && (
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

                {/* Calendrier */}
                <div style={{ ...cardStyle, padding: "32px", minWidth: "400px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                    <button onClick={moisPrecedent} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF3F8", border: "none", color: "#004649", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
                    <span style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "16px" }}>{moisNoms[moisActuel]} {anneeActuelle}</span>
                    <button onClick={moisSuivant} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF3F8", border: "none", color: "#004649", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                    {joursNoms.map((j) => (
                      <div key={j} style={{ textAlign: "center", color: "#5A6B72", fontSize: "12px", fontWeight: "600", padding: "4px" }}>{j}</div>
                    ))}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                    {Array.from({ length: getPremierJourMois() }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: getNbJoursMois() }, (_, i) => i + 1).map((day) => {
                      const key = formatKey(day);
                      const aRdv = !!rdvs[key];
                      const estSelectionne = jourSelectDate === day && moisSelectDate === moisActuel && anneeSelectDate === anneeActuelle;
                      const estAujourdhui = day === today.getDate() && moisActuel === today.getMonth() && anneeActuelle === today.getFullYear();
                      return (
                        <div key={day} onClick={() => setJourSelectionne(key)} style={{
                          textAlign: "center", padding: "10px 4px", borderRadius: "50px", cursor: "pointer",
                          background: estSelectionne
                            ? "linear-gradient(135deg, #004649 0%, #00363A 100%)"
                            : estAujourdhui ? "#DCEEE6" : "transparent",
                          color: estSelectionne ? "#F4EDE4" : "#2A3F4F",
                          fontWeight: estSelectionne || estAujourdhui ? "700" : "400",
                          fontSize: "14px", position: "relative",
                          boxShadow: estSelectionne ? "0 4px 8px rgba(0,70,73,0.3)" : "none",
                        }}>
                          {day}
                          {aRdv && <div style={{ position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: estSelectionne ? "white" : "#004649" }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* RDV du jour */}
                <div style={{ flex: 1, ...cardStyle, padding: "32px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" }}>{jourSelectionne ? `${parseInt(jourSelectionne.split("-")[2])} ${moisNoms[parseInt(jourSelectionne.split("-")[1])-1]} ${jourSelectionne.split("-")[0]}` : "Sélectionnez un jour"}
                    </p>
                    <button
                      onClick={() => { setNouveauRdv({ ...nouveauRdv, date: jourSelectionne }); setShowModalRdv(true); }}
                      style={{ background: "linear-gradient(135deg, #004649 0%, #00363A 100%)", color: "#F4EDE4", borderRadius: "50px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                      + Ajouter un RDV
                    </button>
                  </div>

                  {rdvJour.length === 0 ? (
                    <p style={{ color: "#90A4AE", fontSize: "14px", fontStyle: "italic" }}>Aucun rendez-vous ce jour</p>
                  ) : rdvJour.map((rdv, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "20px", padding: "16px 20px", background: "#F1F8F5", borderRadius: "20px", marginBottom: "12px", borderLeft: "4px solid #004649", boxShadow: "0 2px 8px rgba(0,70,73,0.08)" }}>
                      <span style={{ color: "#004649", fontWeight: "700", fontSize: "14px", minWidth: "60px" }}>{rdv.heure}</span>
                      <div>
                        <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "14px" }}>{rdv.patient}</p>
                        <p style={{ color: "#5A6B72", fontSize: "13px" }}>{rdv.type}</p>
                      </div>
                    </div>
                  ))}

                  <CalendarSync proId={pro?.id} />
                </div>
              </div>
            )}
          </div>

        ) : (
          <div>
            <section style={{ position: "relative", overflow: "hidden", background: "#004649", borderRadius: "28px", padding: "40px", marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", flexWrap: "wrap", boxShadow: "0 24px 60px rgba(0,70,73,0.18)" }}>
              <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 85% 0%, rgba(183,215,232,0.28), transparent 45%), radial-gradient(circle at 0% 100%, rgba(165,201,185,0.22), transparent 40%)" }} />
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "22px" }}>
                <div style={{ width: "84px", height: "84px", borderRadius: "28px", background: "linear-gradient(135deg, #A5C9B9 0%, #B7D7E8 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#004649", fontWeight: "700", fontSize: "28px" }}>
                    {`${(pro?.prenom?.[0] ?? '').toUpperCase()}${(pro?.nom?.[0] ?? '').toUpperCase()}`}
                  </span>
                </div>
                <div>
                  <p style={{ color: "#A5C9B9", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Mon profil</p>
                  <h1 style={{ color: "#F4EDE4", fontWeight: "600", fontSize: "32px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>{pro?.prenom} {pro?.nom}</h1>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "10px" }}>
                    {[pro?.specialite, pro?.email].filter(Boolean).map((t) => (
                      <span key={t} style={{ color: "rgba(244,237,228,0.85)", fontSize: "12px", background: "rgba(244,237,228,0.10)", border: "1px solid rgba(244,237,228,0.16)", borderRadius: "50px", padding: "4px 12px" }}>{t}</span>
                    ))}
                    <span style={{ color: "#004649", fontSize: "12px", fontWeight: "600", background: "#A5C9B9", borderRadius: "50px", padding: "4px 12px" }}>✓ Professionnel certifié</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSection("annuaire")} style={{ position: "relative", background: "linear-gradient(135deg, #A5C9B9, #B7D7E8)", color: "#004649", borderRadius: "50px", padding: "12px 24px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 8px 20px rgba(0,0,0,0.18)" }}>
                ✏️ Modifier le profil
              </button>
            </section>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px", marginBottom: "24px" }}>
              {sections.map((s) => (
                <div key={s.id} onClick={() => setSection(s.id)} style={{ background: "white", borderRadius: "24px", padding: "26px", boxShadow: "0 8px 24px rgba(0,70,73,0.05)", cursor: "pointer", display: "flex", alignItems: "center", gap: "16px", border: "1px solid rgba(0,70,73,0.08)", transition: "all 0.15s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.border = "1px solid rgba(0,70,73,0.22)"; e.currentTarget.style.boxShadow = "0 24px 50px rgba(0,70,73,0.14)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.border = "1px solid rgba(0,70,73,0.08)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,70,73,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "16px", background: "#DCEEE6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "22px" }}>{s.icon}</span>
                  </div>
                  <span style={{ color: "#004649", fontWeight: "600", fontSize: "16px", flex: 1 }}>{s.label}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B0BEC5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              ))}
            </div>

            {/* Déconnexion */}
            <div style={{ background: "white", borderRadius: "24px", border: "1px solid #FFE0DE", padding: "8px 4px" }}>
              <button onClick={handleLogout} style={{ width: "100%", background: "none", border: "none", display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", cursor: "pointer", borderRadius: "20px" }}
                onMouseEnter={e => e.currentTarget.style.background = "#FFF5F4"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}>
                <div style={{ width: "40px", height: "40px", borderRadius: "14px", background: "#FFF0EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E53935" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                </div>
                <span style={{ color: "#E53935", fontWeight: "600", fontSize: "14px" }}>Se déconnecter</span>
              </button>
              <button onClick={() => setShowDeleteModal(true)} style={{ width: "100%", background: "none", border: "none", display: "flex", alignItems: "center", gap: "14px", padding: "12px 20px", cursor: "pointer", borderTop: "1px solid #FFF0EE" }}>
                <span style={{ color: "#B0BEC5", fontSize: "12px", paddingLeft: "50px" }}>Supprimer mon compte</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal changement de mot de passe */}
      {showPasswordModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "40px", width: "420px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "18px", textAlign: "center" }}>🔒 Changer le mot de passe</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Nouveau mot de passe</label>
              <input
                type="password" value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setPasswordStatus(null); }}
                placeholder="Minimum 8 caractères"
                style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#2A3F4F" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Confirmer le mot de passe</label>
              <input
                type="password" value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordStatus(null); }}
                placeholder="Répétez le mot de passe"
                style={{ border: `1px solid ${confirmPassword && confirmPassword !== newPassword ? "#E53935" : "#B7D7E8"}`, borderRadius: "12px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#2A3F4F" }}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={{ color: "#E53935", fontSize: "12px" }}>Les mots de passe ne correspondent pas</p>
              )}
            </div>
            {passwordStatus === 'ok' && <p style={{ color: "#004649", fontWeight: "600", fontSize: "13px", textAlign: "center" }}>✓ Mot de passe modifié avec succès</p>}
            {passwordStatus === 'error' && <p style={{ color: "#E53935", fontSize: "13px", textAlign: "center" }}>Erreur — vérifiez les champs et réessayez</p>}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              <button onClick={() => { setShowPasswordModal(false); setNewPassword(""); setConfirmPassword(""); setPasswordStatus(null); }}
                style={{ padding: "12px 28px", borderRadius: "12px", border: "1px solid #B7D7E8", backgroundColor: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Annuler
              </button>
              <button onClick={handlePasswordChange} disabled={passwordLoading || !newPassword || newPassword !== confirmPassword}
                style={{ padding: "12px 28px", borderRadius: "50px", border: "none",
                  background: (passwordLoading || !newPassword || newPassword !== confirmPassword) ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                  color: "#F4EDE4", fontWeight: "600", cursor: (passwordLoading || !newPassword || newPassword !== confirmPassword) ? "not-allowed" : "pointer", fontSize: "14px" }}>
                {passwordLoading ? "Modification..." : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression compte */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "white", borderRadius: "24px", padding: "40px", width: "400px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
            <p style={{ fontSize: "28px" }}>⚠️</p>
            <h2 style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "18px" }}>Supprimer mon compte</h2>
            <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.6" }}>
              Cette action est irréversible. Toutes vos données seront supprimées définitivement.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ padding: "12px 28px", borderRadius: "12px", border: "1px solid #B7D7E8", backgroundColor: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Annuler
              </button>
              <button onClick={handleDeleteAccount} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: "#E53935", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ajout RDV */}
      {showModalRdv && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "48px", width: "460px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", textAlign: "center" }}>Nouveau rendez-vous</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Date</label>
              <input type="date" value={nouveauRdv.date} onChange={(e) => setNouveauRdv({ ...nouveauRdv, date: e.target.value })}
                style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#2A3F4F" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Heure</label>
              <input type="time" value={nouveauRdv.heure} onChange={(e) => setNouveauRdv({ ...nouveauRdv, heure: e.target.value })}
                style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#2A3F4F" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Patient</label>
              <select value={nouveauRdv.patient} onChange={(e) => setNouveauRdv({ ...nouveauRdv, patient: e.target.value })}
                style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#2A3F4F", backgroundColor: "white" }}>
                <option value="">Sélectionner un patient</option>
                {patientsListe.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Motif</label>
              <select value={nouveauRdv.type} onChange={(e) => setNouveauRdv({ ...nouveauRdv, type: e.target.value })}
                style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#2A3F4F", backgroundColor: "white" }}>
                <option value="">Sélectionner un motif</option>
                {motifsList.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              <button onClick={() => setShowModalRdv(false)} style={{ padding: "12px 32px", borderRadius: "12px", border: "1px solid #B7D7E8", backgroundColor: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Annuler
              </button>
              <button onClick={ajouterRdv} style={{ padding: "12px 32px", borderRadius: "50px", border: "none", background: "linear-gradient(135deg, #004649 0%, #00363A 100%)", color: "#F4EDE4", fontWeight: "600", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}