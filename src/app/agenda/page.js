"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import CalendarSync from "@/components/CalendarSync";

const MOIS_NOMS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const JOURS_NOMS = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];

const STATUT_CONFIG = {
  confirme: { label: "Confirmé", color: "#004649", bg: "#E8F5EF", border: "#A5C9B9" },
  en_attente: { label: "En attente", color: "#E65100", bg: "#FFF3E0", border: "#FFCC80" },
  annule: { label: "Annulé", color: "#C62828", bg: "#FFEBEE", border: "#EF9A9A" },
};

export default function Agenda() {
  const { pro } = useProProfile();
  const today = new Date();

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [moisActuel, setMoisActuel] = useState(today.getMonth());
  const [anneeActuelle, setAnneeActuelle] = useState(today.getFullYear());
  const [jourSelectionne, setJourSelectionne] = useState(formatDateKey(today));
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nouveauRdv, setNouveauRdv] = useState({ date: "", heure: "09:00", patient_user_id: "", patient_name: "", motif: "", notes: "", duree: "30" });

  // Action modal (confirm / cancel with optional message to patient)
  const [actionModal, setActionModal] = useState(null); // { rdv, action: 'confirme'|'annule' }
  const [actionMessage, setActionMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  function formatDateKey(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }

  useEffect(() => {
    if (!pro) return;
    loadAppointments();
    loadPatients();

    const channel = supabase
      .channel(`agenda_pro_${pro.id}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "appointments",
        filter: `professional_id=eq.${pro.id}`,
      }, () => {
        loadAppointments();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [pro]);

  async function loadAppointments() {
    setLoading(true);
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("professional_id", pro.id)
      .order("date_heure");
    setAppointments(data ?? []);
    setLoading(false);
  }

  async function loadPatients() {
    const { data: links } = await supabase
      .from("patient_professional_links")
      .select("patient_id")
      .eq("professional_id", pro.id);
    if (!links?.length) return;
    const ids = links.map(l => l.patient_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, prenom, nom, pseudo")
      .in("id", ids);
    setPatients(profiles ?? []);
  }

  async function ajouterRdv() {
    if (!nouveauRdv.date || !nouveauRdv.heure || (!nouveauRdv.patient_name && !nouveauRdv.patient_user_id)) return;
    setSaving(true);
    const dateHeure = new Date(`${nouveauRdv.date}T${nouveauRdv.heure}`).toISOString();

    let patientName = nouveauRdv.patient_name;
    if (nouveauRdv.patient_user_id && !patientName) {
      const p = patients.find(p => p.id === nouveauRdv.patient_user_id);
      patientName = p ? `${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || p.pseudo : "";
    }

    await supabase.from("appointments").insert({
      professional_id: pro.id,
      patient_user_id: nouveauRdv.patient_user_id || null,
      patient_name: patientName,
      date_heure: dateHeure,
      duree_minutes: parseInt(nouveauRdv.duree),
      motif: nouveauRdv.motif,
      notes: nouveauRdv.notes,
      statut: "confirme",
    });

    setSaving(false);
    setShowModal(false);
    setNouveauRdv({ date: "", heure: "09:00", patient_user_id: "", patient_name: "", motif: "", notes: "", duree: "30" });
    setJourSelectionne(nouveauRdv.date);
    loadAppointments();
  }

  function openActionModal(rdv, action) {
    setActionModal({ rdv, action });
    setActionMessage("");
  }

  async function executeAction() {
    if (!actionModal) return;
    setSaving(true);
    const updates = {
      statut: actionModal.action,
      ...(actionMessage.trim() ? { message_pro: actionMessage.trim() } : {}),
    };
    await supabase.from("appointments").update(updates).eq("id", actionModal.rdv.id);
    setSaving(false);
    setActionModal(null);
    setActionMessage("");
    loadAppointments();
  }

  async function deleteRdv(id) {
    if (!confirm("Supprimer ce rendez-vous ?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    loadAppointments();
  }

  // Group by date
  const rdvByDate = {};
  appointments.forEach(rdv => {
    const key = rdv.date_heure.split("T")[0];
    if (!rdvByDate[key]) rdvByDate[key] = [];
    rdvByDate[key].push(rdv);
  });

  const rdvJour = rdvByDate[jourSelectionne] ?? [];
  const nbEnAttente = appointments.filter(r => r.statut === "en_attente").length;

  const getPremierJour = () => { const d = new Date(anneeActuelle, moisActuel, 1).getDay(); return d === 0 ? 6 : d - 1; };
  const getNbJours = () => new Date(anneeActuelle, moisActuel + 1, 0).getDate();
  const formatKey = (day) => `${anneeActuelle}-${String(moisActuel+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  const moisPrecedent = () => { if (moisActuel === 0) { setMoisActuel(11); setAnneeActuelle(a => a-1); } else setMoisActuel(m => m-1); };
  const moisSuivant = () => { if (moisActuel === 11) { setMoisActuel(0); setAnneeActuelle(a => a+1); } else setMoisActuel(m => m+1); };

  const jourSel = jourSelectionne ? parseInt(jourSelectionne.split("-")[2]) : null;
  const moisSel = jourSelectionne ? parseInt(jourSelectionne.split("-")[1]) - 1 : null;
  const anneeSel = jourSelectionne ? parseInt(jourSelectionne.split("-")[0]) : null;

  const cardStyle = { background: "#FFFFFF", borderRadius: "24px", border: "1px solid rgba(0,70,73,0.08)", boxShadow: "0 8px 24px rgba(0,70,73,0.05)" };

  function formatHeure(isoString) {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2,"0")}h${String(d.getMinutes()).padStart(2,"0")}`;
  }

  const actionIsConfirm = actionModal?.action === "confirme";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />

      <div style={{ padding: "40px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>
        <PageHeader eyebrow="Planning" title="Agenda" subtitle="Gérez vos rendez-vous et suivez les demandes de vos patients">
            {nbEnAttente > 0 && (
              <div style={{ background: "#FFF6EC", border: "1px solid #FFD8A8", borderRadius: "50px", padding: "10px 18px", fontSize: "13px", fontWeight: "600", color: "#E65100" }}>
                ⏳ {nbEnAttente} demande{nbEnAttente > 1 ? "s" : ""} en attente
              </div>
            )}
            <button onClick={() => { setNouveauRdv({ ...nouveauRdv, date: jourSelectionne }); setShowModal(true); }} style={{ background: "linear-gradient(135deg, #004649 0%, #00363A 100%)", color: "#F4EDE4", borderRadius: "50px", padding: "13px 24px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 10px 26px rgba(0,70,73,0.25)" }}>
              + Nouveau RDV
            </button>
        </PageHeader>

        <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Calendrier */}
          <div style={{ ...cardStyle, padding: "32px", minWidth: "380px", flex: "0 0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <button onClick={moisPrecedent} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF3F8", border: "none", color: "#004649", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg></button>
              <span style={{ color: "#004649", fontWeight: "600", fontSize: "17px" }}>{MOIS_NOMS[moisActuel]} {anneeActuelle}</span>
              <button onClick={moisSuivant} style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF3F8", border: "none", color: "#004649", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
              {JOURS_NOMS.map(j => <div key={j} style={{ textAlign: "center", color: "#5A6B72", fontSize: "12px", fontWeight: "600", padding: "4px" }}>{j}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
              {Array.from({ length: getPremierJour() }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: getNbJours() }, (_, i) => i + 1).map((day) => {
                const key = formatKey(day);
                const aRdv = !!rdvByDate[key];
                const aEnAttente = rdvByDate[key]?.some(r => r.statut === "en_attente");
                const estSel = jourSel === day && moisSel === moisActuel && anneeSel === anneeActuelle;
                const estAujourd = day === today.getDate() && moisActuel === today.getMonth() && anneeActuelle === today.getFullYear();
                return (
                  <div key={day} onClick={() => setJourSelectionne(key)} style={{ textAlign: "center", padding: "10px 4px", borderRadius: "50px", cursor: "pointer", background: estSel ? "linear-gradient(135deg, #004649 0%, #00363A 100%)" : estAujourd ? "#DCEEE6" : "transparent", color: estSel ? "#F4EDE4" : "#2A3F4F", fontWeight: estSel || estAujourd ? "700" : "400", fontSize: "14px", position: "relative", boxShadow: estSel ? "0 4px 8px rgba(0,70,73,0.3)" : "none" }}>
                    {day}
                    {aRdv && <div style={{ position: "absolute", bottom: "3px", left: "50%", transform: "translateX(-50%)", width: "5px", height: "5px", borderRadius: "50%", backgroundColor: aEnAttente ? "#E65100" : (estSel ? "white" : "#004649") }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RDV du jour */}
          <div style={{ flex: "1 1 420px", ...cardStyle, padding: "32px" }}>
            <div style={{ marginBottom: "20px" }}>
              <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" }}>{jourSelectionne ? `${parseInt(jourSelectionne.split("-")[2])} ${MOIS_NOMS[parseInt(jourSelectionne.split("-")[1])-1]} ${jourSelectionne.split("-")[0]}` : "Sélectionnez un jour"}
              </p>
            </div>

            {loading ? (
              <p style={{ color: "#90A4AE", fontSize: "14px" }}>Chargement…</p>
            ) : rdvJour.length === 0 ? (
              <p style={{ color: "#90A4AE", fontSize: "14px", fontStyle: "italic" }}>Aucun rendez-vous ce jour</p>
            ) : rdvJour.map((rdv) => {
              const cfg = STATUT_CONFIG[rdv.statut] ?? STATUT_CONFIG.confirme;
              const pseudo = rdv.patient_pseudo;
              const patientDisplay = pseudo
                ? `${rdv.patient_name || "Patient"}${pseudo !== rdv.patient_name ? ` · @${pseudo}` : ""}`
                : rdv.patient_name;
              return (
                <div key={rdv.id} style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "18px 20px", background: cfg.bg, borderRadius: "20px", marginBottom: "12px", border: `1px solid ${cfg.border}55`, boxShadow: "0 8px 24px rgba(0,70,73,0.05)" }}>
                  <div style={{ minWidth: "50px" }}>
                    <p style={{ color: "#004649", fontWeight: "700", fontSize: "14px" }}>{formatHeure(rdv.date_heure)}</p>
                    <p style={{ color: "#5A6B72", fontSize: "11px" }}>{rdv.duree_minutes} min</p>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "14px" }}>{patientDisplay}</p>
                    {rdv.patient_user_id && (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                        <code style={{ color: "#5A6B72", fontSize: "10px", fontFamily: "monospace", background: "rgba(255,255,255,0.7)", padding: "2px 8px", borderRadius: "50px", letterSpacing: "0.3px", userSelect: "all" }}>
                          {rdv.patient_user_id}
                        </code>
                        <button
                          onClick={() => { navigator.clipboard.writeText(rdv.patient_user_id); setCopiedId(rdv.id); setTimeout(() => setCopiedId(null), 1500); }}
                          style={{ background: copiedId === rdv.id ? "#E8F5EF" : "#EEF2F7", border: `1px solid ${copiedId === rdv.id ? "#A5C9B9" : "#D0D9E2"}`, borderRadius: "50px", cursor: "pointer", padding: "2px 10px", fontSize: "10px", fontWeight: "600", color: copiedId === rdv.id ? "#004649" : "#5A6B72", transition: "all 0.2s", whiteSpace: "nowrap" }}>
                          {copiedId === rdv.id ? "✓ Copié" : "Copier"}
                        </button>
                      </div>
                    )}
                    <p style={{ color: "#5A6B72", fontSize: "13px", marginTop: "4px" }}>{rdv.motif}</p>
                    {rdv.notes && <p style={{ color: "#90A4AE", fontSize: "12px", marginTop: "4px", fontStyle: "italic" }}>{rdv.notes}</p>}
                    {rdv.message_pro && (
                      <p style={{ color: cfg.color, fontSize: "12px", marginTop: "4px", fontStyle: "italic" }}>💬 {rdv.message_pro}</p>
                    )}
                    <div style={{ marginTop: "6px", display: "inline-block", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "50px", padding: "3px 10px", fontSize: "11px", fontWeight: "600", color: cfg.color }}>
                      {cfg.label}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    {rdv.statut === "en_attente" && (
                      <button onClick={() => openActionModal(rdv, "confirme")} style={{ background: "linear-gradient(135deg, #004649, #00363A)", color: "#F4EDE4", border: "none", borderRadius: "50px", padding: "6px 12px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>✓ Confirmer</button>
                    )}
                    {rdv.statut !== "annule" && (
                      <button onClick={() => openActionModal(rdv, "annule")} style={{ background: "white", color: "#5A6B72", border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "6px 12px", fontSize: "12px", cursor: "pointer" }}>Annuler</button>
                    )}
                    <button onClick={() => deleteRdv(rdv.id)} style={{ background: "white", color: "#E53935", border: "1px solid #FFCDD2", borderRadius: "50px", padding: "6px 10px", fontSize: "12px", cursor: "pointer" }}>🗑</button>
                  </div>
                </div>
              );
            })}

            <CalendarSync proId={pro?.id} />
          </div>
        </div>
      </div>

      {/* Modal nouveau RDV */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "safe center", justifyContent: "center", zIndex: 400, overflowY: "auto", padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "48px", width: "500px", display: "flex", flexDirection: "column", gap: "18px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", textAlign: "center" }}>Nouveau rendez-vous</h2>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Date *</label>
                <input type="date" value={nouveauRdv.date} onChange={e => setNouveauRdv({ ...nouveauRdv, date: e.target.value })} style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F" }} />
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Heure *</label>
                <input type="time" value={nouveauRdv.heure} onChange={e => setNouveauRdv({ ...nouveauRdv, heure: e.target.value })} style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Patient *</label>
              <select value={nouveauRdv.patient_user_id} onChange={e => {
                const p = patients.find(p => p.id === e.target.value);
                const name = p ? `${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || p.pseudo : "";
                setNouveauRdv({ ...nouveauRdv, patient_user_id: e.target.value, patient_name: name });
              }} style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F", backgroundColor: "white" }}>
                <option value="">Sélectionner un patient lié</option>
                {patients.map(p => <option key={p.id} value={p.id}>{`${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || p.pseudo}</option>)}
              </select>
              <input placeholder="Ou saisir un nom manuellement" value={nouveauRdv.patient_name} onChange={e => setNouveauRdv({ ...nouveauRdv, patient_name: e.target.value, patient_user_id: "" })} style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F" }} />
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Durée</label>
                <select value={nouveauRdv.duree} onChange={e => setNouveauRdv({ ...nouveauRdv, duree: e.target.value })} style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F", backgroundColor: "white" }}>
                  {["15","30","45","60","90"].map(d => <option key={d} value={d}>{d} min</option>)}
                </select>
              </div>
              <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Motif</label>
                <input value={nouveauRdv.motif} onChange={e => setNouveauRdv({ ...nouveauRdv, motif: e.target.value })} placeholder="Consultation, suivi, bilan…" style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F" }} />
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>Notes (optionnel)</label>
              <textarea value={nouveauRdv.notes} onChange={e => setNouveauRdv({ ...nouveauRdv, notes: e.target.value })} rows={2} style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 32px", borderRadius: "12px", border: "1px solid #B7D7E8", backgroundColor: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>Annuler</button>
              <button onClick={ajouterRdv} disabled={saving} style={{ padding: "12px 32px", borderRadius: "50px", border: "none", background: "linear-gradient(135deg, #004649 0%, #00363A 100%)", color: "#F4EDE4", fontWeight: "600", cursor: "pointer", fontSize: "14px", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Enregistrement…" : "Ajouter le RDV"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal action (confirmer / annuler avec message au patient) */}
      {actionModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "safe center", justifyContent: "center", zIndex: 400, overflowY: "auto", padding: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "40px", width: "460px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "8px" }}>{actionIsConfirm ? "✅" : "❌"}</div>
              <h2 style={{ color: "#004649", fontWeight: "600", fontSize: "20px", letterSpacing: "-0.01em", marginBottom: "4px" }}>
                {actionIsConfirm ? "Confirmer le rendez-vous" : "Annuler le rendez-vous"}
              </h2>
              <p style={{ color: "#5A6B72", fontSize: "13px" }}>
                {actionModal.rdv.patient_pseudo
                  ? `@${actionModal.rdv.patient_pseudo}`
                  : actionModal.rdv.patient_name} · {formatHeure(actionModal.rdv.date_heure)}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>
                Message au patient <span style={{ color: "#90A4AE", fontWeight: "400" }}>(optionnel)</span>
              </label>
              <textarea
                value={actionMessage}
                onChange={e => setActionMessage(e.target.value)}
                rows={3}
                placeholder={actionIsConfirm
                  ? "Ex : Votre rendez-vous est confirmé, pensez à apporter votre ordonnance…"
                  : "Ex : Je suis indisponible ce jour, n'hésitez pas à reprendre rendez-vous…"}
                style={{ border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F", resize: "vertical", fontFamily: "inherit" }}
              />
              <p style={{ color: "#90A4AE", fontSize: "11px" }}>Ce message sera visible par le patient dans son application.</p>
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => { setActionModal(null); setActionMessage(""); }}
                style={{ padding: "12px 28px", borderRadius: "12px", border: "1px solid #B7D7E8", backgroundColor: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Retour
              </button>
              <button
                onClick={executeAction}
                disabled={saving}
                style={{ padding: "12px 28px", borderRadius: "50px", border: "none", background: actionIsConfirm ? "linear-gradient(135deg, #004649 0%, #00363A 100%)" : "linear-gradient(135deg, #B71C1C, #E53935)", color: "#F4EDE4", fontWeight: "600", cursor: "pointer", fontSize: "14px", opacity: saving ? 0.7 : 1 }}>
                {saving ? "…" : actionIsConfirm ? "✓ Confirmer" : "Annuler le RDV"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
