"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import { showToast } from "@/lib/toast";
import DossierInitialModal from "@/components/DossierInitialModal";
import OrdonTSNModal from "@/components/OrdonTSNModal";
import TestResultModal from "@/components/TestResultModal";


const QUESTION_LABELS = {
  statut_tabagique: "Statut tabagique",
  // Fumeur
  fumeur_frequence: "Fréquence (cigarette)",
  fumeur_nb_cigarettes: "Nombre de cigarettes/jour",
  fumeur_temps_premiere_cig: "Temps avant 1ère cigarette",
  fumeur_difficulte_lieux_interdits: "Difficulté lieux interdits",
  fumeur_cig_importante: "Cigarette la plus importante",
  fumeur_plus_matin: "Fume plus le matin",
  fumeur_meme_malade: "Fume même malade",
  // Vapoteur
  vapoteur_concentration: "Concentration nicotine",
  vapoteur_nb_sessions: "Sessions de vape par jour",
  vapoteur_temps_premiere_session: "Temps avant 1ère session",
  vapoteur_difficulte_lieux_interdits: "Difficulté lieux interdits (vape)",
  vapoteur_session_importante: "Session la plus importante",
  vapoteur_plus_matin: "Vape plus le matin",
  vapoteur_meme_malade: "Vape même malade",
  // Substituts
  substituts: "Substituts nicotiniques",
  substitut_type: "Type de substitut",
  substitut_dose: "Dosage substitut",
  substitut_autre: "Substitut (précision)",
  // GAD-4
  "gad_nervosité": "Nervosité/anxiété (GAD)",
  gad_inquietudes: "Inquiétudes (GAD)",
  gad_interet: "Peu d'intérêt (GAD)",
  gad_tristesse: "Tristesse (GAD)",
  // Autres
  autres_addictions: "Autres addictions",
  addiction_autre: "Autre addiction (précision)",
  niveau_stress: "Niveau de stress",
  gestion_stress: "Gestion du stress",
  stress_autre: "Gestion du stress (précision)",
  // Associations comportementales
  association_pause: "Association : pause",
  association_alcool: "Association : alcool",
  association_cafe: "Association : café",
  association_convivialite: "Association : convivialité",
  association_reflexion: "Association : réflexion",
  association_fatigue: "Association : fatigue",
  association_stress: "Association : stress",
  association_humeur: "Association : humeur",
};

const META_KEYS = new Set([
  "score_fagerström_fumeur", "niveau_fagerström_fumeur",
  "score_fagerström_vapoteur", "niveau_fagerström_vapoteur",
  "score_gad4", "niveau_gad4",
]);

const OUI_NON_KEYS = new Set([
  "fumeur_difficulte_lieux_interdits", "fumeur_plus_matin", "fumeur_meme_malade",
  "vapoteur_difficulte_lieux_interdits", "vapoteur_plus_matin", "vapoteur_meme_malade",
]);

const GAD_KEYS = new Set(["gad_nervosité", "gad_inquietudes", "gad_interet", "gad_tristesse"]);

const TEMPS_DECODE = { "3": "Dans les 5 min", "2": "6–30 min", "1": "31–60 min", "0": "Après 60 min" };
const GAD_DECODE = { "0": "Jamais", "1": "Plusieurs jours", "2": "Plus de 7 jours", "3": "Presque tous les jours" };
const SESSIONS_DECODE = { "0": "10 ou moins", "1": "11–20", "2": "21–30", "3": "31 ou plus" };
const STATUT_DECODE = { fumeur: "Fumeur", vapoteur: "Vapoteur", les_deux: "Fumeur et vapoteur", "ex-fumeur": "Ex-fumeur", "non-fumeur": "Non-fumeur" };
const FREQUENCE_DECODE = { occasionnel: "Occasionnel (≤10 cig/semaine)", moins_10_jour: "Moins de 10/jour", plus_10_jour: "Plus de 10/jour" };
const STRESS_DECODE = { "1": "Très faible", "2": "Faible", "3": "Modéré", "4": "Élevé", "5": "Très élevé" };

function decodeValue(key, raw) {
  if (Array.isArray(raw)) return raw.join(", ");
  const v = String(raw ?? "");
  if (OUI_NON_KEYS.has(key)) return v === "1" ? "Oui" : v === "0" ? "Non" : v;
  if (GAD_KEYS.has(key)) return GAD_DECODE[v] ?? v;
  if (key === "fumeur_temps_premiere_cig" || key === "vapoteur_temps_premiere_session") return TEMPS_DECODE[v] ?? v;
  if (key === "fumeur_cig_importante" || key === "vapoteur_session_importante") return v === "1" ? "La première du matin" : v === "0" ? "Une autre" : v;
  if (key === "vapoteur_nb_sessions") return SESSIONS_DECODE[v] ?? v;
  if (key === "vapoteur_concentration") return v ? `${v} mg/ml` : v;
  if (key === "fumeur_frequence") return FREQUENCE_DECODE[v] ?? v;
  if (key === "statut_tabagique") return STATUT_DECODE[v] ?? v;
  if (key === "niveau_stress") return STRESS_DECODE[v] ?? v;
  if (v === "oui") return "Oui";
  if (v === "non") return "Non";
  return v;
}

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export default function FichePatient() {
  const { id } = useParams();
  const { pro } = useProProfile();
  const router = useRouter();

  const [patient, setPatient] = useState(null);
  const [moments, setMoments] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [puffs, setPuffs] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [substitutEntries, setSubstitutEntries] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [onglet, setOnglet] = useState("informations");
  const [sousOngletStats, setSousOngletStats] = useState("humeur");
  const [documents, setDocuments] = useState([]);
  const [questOuverts, setQuestOuverts] = useState({});
  const [recommandations, setRecommandations] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [noteTexte, setNoteTexte] = useState("");
  const [showHistorique, setShowHistorique] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingReco, setSavingReco] = useState(false);
  const [showOrdonnance, setShowOrdonnance] = useState(false);
  const [ordonnancePrescription, setOrdonnancePrescription] = useState("");
  const [ordonnanceDuree, setOrdonnanceDuree] = useState("");
  const [ordonnanceRenouvellement, setOrdonnanceRenouvellement] = useState("Non autorisé");
  const [ordonnanceNotes, setOrdonnanceNotes] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const fileInputRef = useRef(null);
  const threadScrollRef = useRef(null);
  const [threadMsgs, setThreadMsgs] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadInput, setThreadInput] = useState("");
  const [threadSending, setThreadSending] = useState(false);
  const [showOrdonTSN, setShowOrdonTSN] = useState(false);
  const [showDossierInitial, setShowDossierInitial] = useState(false);
  const [dossierInitialExiste, setDossierInitialExiste] = useState(true);
  const [openedTest, setOpenedTest] = useState(null);

  async function deleteLink() {
    if (!pro) return;
    setDeleting(true);
    await supabase
      .from("patient_professional_links")
      .delete()
      .eq("professional_id", pro.id)
      .eq("patient_id", id);
    router.push("/dashboard");
  }

  useEffect(() => {
    if (!id) return;
    async function loadData() {
      const [profileRes, momentsRes, questionnairesRes, sessionsRes, puffsRes, journalRes, substitutsRes, appointmentsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("moments").select("*").eq("user_id", id).order("position"),
        supabase.from("questionnaires").select("*").eq("user_id", id).order("date_completion", { ascending: false }),
        supabase.from("vape_sessions").select("duree_secondes, date_debut, moment_id, nombre_bouffees, nicotine").eq("user_id", id).order("date_debut", { ascending: false }).limit(200),
        supabase.from("puffs").select("duration_ms, nicotine, date_time").eq("user_id", id).order("date_time", { ascending: false }).limit(500),
        supabase.from("journal_entries").select("*").eq("user_id", id).order("date", { ascending: false }),
        supabase.from("substitut_entries").select("*").eq("user_id", id).order("date", { ascending: false }),
        supabase.from("appointments").select("id, date_rdv, statut, notes").eq("patient_user_id", id).order("date_rdv", { ascending: false }),
      ]);

      if (profileRes.error || !profileRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPatient(profileRes.data);

      // Dédupliquer les moments par nom (la sync Flutter peut créer des doublons)
      const rawMoments = momentsRes.data || [];
      const seenNames = new Set();
      const uniqueMoments = rawMoments
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .filter(m => { if (seenNames.has(m.name)) return false; seenNames.add(m.name); return true; });
      setMoments(uniqueMoments);

      // Dédupliquer les questionnaires par date (arrondie à la minute)
      const rawQuests = questionnairesRes.data || [];
      const seenDates = new Set();
      const uniqueQuests = rawQuests.filter(q => {
        const key = q.date_completion ? q.date_completion.slice(0, 16) : q.id;
        if (seenDates.has(key)) return false;
        seenDates.add(key);
        return true;
      });
      setQuestionnaires(uniqueQuests);

      setSessions(sessionsRes.data || []);
      setPuffs(puffsRes.data || []);
      setJournalEntries(journalRes.data || []);
      setSubstitutEntries(substitutsRes.data || []);
      setAppointments(appointmentsRes.data || []);
      setLoading(false);
    }
    loadData();

    // Realtime — mise à jour instantanée quand le patient agit dans l'app
    const rtMoments = supabase.channel(`rt_moments_${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "moments", filter: `user_id=eq.${id}` }, loadData)
      .subscribe();
    const rtSessions = supabase.channel(`rt_sessions_${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "vape_sessions", filter: `user_id=eq.${id}` }, loadData)
      .subscribe();
    const rtPuffs = supabase.channel(`rt_puffs_${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "puffs", filter: `user_id=eq.${id}` }, loadData)
      .subscribe();
    const rtJournal = supabase.channel(`rt_journal_${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "journal_entries", filter: `user_id=eq.${id}` }, loadData)
      .subscribe();
    const rtSubstituts = supabase.channel(`rt_substituts_${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "substitut_entries", filter: `user_id=eq.${id}` }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(rtMoments);
      supabase.removeChannel(rtSessions);
      supabase.removeChannel(rtPuffs);
      supabase.removeChannel(rtJournal);
      supabase.removeChannel(rtSubstituts);
    };
  }, [id]);

  const stats = useMemo(() => {
    const avgDurationSec =
      puffs.length > 0
        ? Math.round((puffs.reduce((s, p) => s + (p.duration_ms || 0), 0) / puffs.length / 100)) / 10
        : null;
    const avgSessionMin =
      sessions.length > 0
        ? Math.round((sessions.reduce((s, x) => s + (x.duree_secondes || 0), 0) / sessions.length / 6)) / 10
        : null;
    const distinctDays = new Set(sessions.map((s) => s.date_debut?.split("T")[0]).filter(Boolean)).size;
    const avgPerDay = distinctDays > 0 ? Math.round((sessions.length / distinctDays) * 10) / 10 : null;

    return {
      momentParJour: avgPerDay ?? "—",
      dureeMoyenneTaff: avgDurationSec != null ? `${avgDurationSec} sec` : "—",
      tempsSessionMoyen: avgSessionMin != null ? `${avgSessionMin} min` : "—",
    };
  }, [puffs, sessions]);

  const lastNicotine = useMemo(() => {
    if (puffs.length > 0 && puffs[0].nicotine) return `${puffs[0].nicotine} MG/ML`;
    if (sessions.length > 0 && sessions[0].nicotine) return `${sessions[0].nicotine} MG/ML`;
    return "—";
  }, [puffs, sessions]);

  const historique = useMemo(() => {
    const quests = questionnaires.map((q) => ({
      date: formatDate(q.date_completion),
      type: "Questionnaire",
      detail: `Score Fagerström : ${q.score} - ${q.niveau}`,
      _iso: q.date_completion,
    }));
    const rdvs = appointments.map((a) => {
      const statut = a.statut === "confirme" ? "Confirmé" : a.statut === "annule" ? "Annulé" : a.statut || "En attente";
      return {
        date: formatDate(a.date_rdv),
        type: "Rendez-vous",
        detail: `Statut : ${statut}${a.notes ? ` — ${a.notes}` : ""}`,
        _iso: a.date_rdv,
      };
    });
    return [...quests, ...rdvs].sort((a, b) => new Date(b._iso || 0) - new Date(a._iso || 0));
  }, [questionnaires, appointments]);

  // Load docs + recommendations from Supabase when pro is available
  useEffect(() => {
    if (!id || !pro) return;
    async function loadDocsAndReco() {
      const [recoRes, docsRes, dossierRes, testsRes] = await Promise.all([
        supabase.from("patient_recommendations").select("*").eq("patient_id", id).eq("pro_id", pro.id).maybeSingle(),
        supabase.from("patient_documents").select("*").eq("patient_id", id).eq("pro_id", pro.id).order("created_at", { ascending: false }),
        supabase.from("patient_dossiers").select("updated_at").eq("patient_id", id).eq("pro_id", pro.id).eq("type", "initial").maybeSingle(),
        supabase.from("patient_tests").select("id, type, created_at, data, scores").eq("patient_id", id).eq("pro_id", pro.id).order("created_at", { ascending: false }),
      ]);
      if (recoRes.data?.data) setRecommandations(recoRes.data.data);
      const docs = (docsRes.data || []).map(d => ({ id: d.id, nom: d.nom, type: d.type, file_url: d.file_url ?? null }));
      const TEST_LABELS = { had: "Test HAD", horn: "Test de Horn", beck: "Colonnes de Beck" };
      for (const t of (testsRes.data || [])) {
        const date = new Date(t.created_at).toLocaleDateString("fr-FR");
        docs.push({ id: t.id, nom: `${TEST_LABELS[t.type] || "Test"} — ${date}`, type: `test_${t.type}`, file_url: null, source: "patient_tests", testType: t.type, testData: t.data, testScores: t.scores });
      }
      if (dossierRes.data) {
        const date = new Date(dossierRes.data.updated_at).toLocaleDateString("fr-FR");
        docs.unshift({ id: "dossier_initial", nom: `Dossier consultation initiale — ${date}`, type: "dossier_initial", file_url: null });
        setDossierInitialExiste(true);
      } else {
        setDossierInitialExiste(false);
      }
      setDocuments(docs);
    }
    loadDocsAndReco();
  }, [id, pro]);

  async function loadThread() {
    if (!pro || !id) return;
    setThreadLoading(true);
    const { data } = await supabase.from("pro_patient_messages")
      .select("*")
      .eq("pro_id", pro.id)
      .eq("patient_id", id)
      .order("created_at", { ascending: true });
    setThreadMsgs(data || []);
    setThreadLoading(false);
    await supabase.from("pro_patient_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("pro_id", pro.id)
      .eq("patient_id", id)
      .eq("sender_type", "patient")
      .is("read_at", null);
    setTimeout(() => {
      if (threadScrollRef.current) threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight;
    }, 50);
  }

  async function sendThreadMsg() {
    const text = threadInput.trim();
    if (!text || threadSending || !pro || !id) return;
    setThreadSending(true);
    setThreadInput("");
    const tempMsg = { pro_id: pro.id, patient_id: id, sender_type: "pro", content: text, created_at: new Date().toISOString() };
    setThreadMsgs((prev) => [...prev, tempMsg]);
    setTimeout(() => { if (threadScrollRef.current) threadScrollRef.current.scrollTop = threadScrollRef.current.scrollHeight; }, 50);
    await supabase.from("pro_patient_messages").insert({ pro_id: pro.id, patient_id: id, sender_type: "pro", content: text });
    setThreadSending(false);
    loadThread();
  }

  useEffect(() => {
    if (onglet !== "messages" || !pro || !id) return;
    loadThread();
    const ch = supabase
      .channel(`pro_thread_${pro.id}_${id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pro_patient_messages", filter: `pro_id=eq.${pro.id}` }, () => loadThread())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [onglet, pro?.id, id]);


  async function supprimerDocument(doc) {
    if (!doc.id) return;
    if (!confirm(`Supprimer "${doc.nom}" ?`)) return;
    if (doc.source === "patient_tests") {
      await supabase.from("patient_tests").delete().eq("id", doc.id);
    } else {
      if (doc.file_url) {
        const path = doc.file_url.split("/patient-documents/")[1];
        if (path) await supabase.storage.from("patient-documents").remove([decodeURIComponent(path)]);
      }
      await supabase.from("patient_documents").delete().eq("id", doc.id);
    }
    setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
  }

  const handleImport = (e) => {
    const fichiers = Array.from(e.target.files);
    setDocuments([...documents, ...fichiers.map((f) => ({ nom: f.name, type: "import" }))]);
  };

  const toggleQuest = (i) => setQuestOuverts((prev) => ({ ...prev, [i]: !prev[i] }));

  const enregistrerNote = async () => {
    if (!noteTexte.trim() || !pro) return;
    const date = new Date().toLocaleDateString("fr-FR");
    const nom = `Note consultation ${date}.txt`;
    const { data: newDoc, error: noteErr } = await supabase.from("patient_documents").insert({
      patient_id: id, pro_id: pro.id, nom, contenu: noteTexte, type: "note",
    }).select().single();
    if (noteErr) { showToast(`Erreur sauvegarde note : ${noteErr.message}`, 'error'); return; }
    if (newDoc) {
      setDocuments((prev) => [{ id: newDoc.id, nom: newDoc.nom, type: newDoc.type, file_url: null }, ...prev]);
      showToast("Note partagée avec le patient");
    }
    supabase.functions.invoke("send-push", { body: { user_id: id, title: "📝 Note de consultation", body: "Votre praticien a partagé une note de consultation", data: { type: "document" } } });
    setNoteTexte("");
    setShowNotes(false);
    setOnglet("documents");
  };

  const enregistrerRecommandations = async () => {
    if (!pro) return;
    setSavingReco(true);
    const { error } = await supabase.from("patient_recommendations").upsert(
      { patient_id: id, pro_id: pro.id, data: recommandations, updated_at: new Date().toISOString() },
      { onConflict: "patient_id,pro_id" }
    );
    if (!error) {
      try {
        await supabase.functions.invoke('send-push', {
          body: {
            user_id: id,
            title: '📋 Recommandations mises à jour',
            body: `${pro.prenom ?? 'Votre professionnel'} a mis à jour vos recommandations de suivi`,
            data: { type: 'recommendations_updated' },
          }
        });
      } catch (_) {}
      showToast("Recommandations enregistrées et envoyées au patient");
    } else {
      showToast("Erreur lors de l'enregistrement", 'error');
    }
    setSavingReco(false);
  };

  async function genererOrdonnancePDF() {
    if (!ordonnancePrescription.trim()) return;
    setGeneratingPdf(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const mL = 20, mR = 190;

      // En-tête prescripteur
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.text(pro ? `Dr. ${pro.prenom} ${pro.nom}` : "", mL, 22);
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      let yPro = 22;
      if (pro?.specialite) { yPro += 5; doc.text(pro.specialite, mL, yPro); }
      if (pro?.cabinet) { yPro += 5; doc.text(pro.cabinet, mL, yPro); }
      if (pro?.adresse) { yPro += 5; doc.text(pro.adresse, mL, yPro); }
      if (pro?.telephone) { yPro += 5; doc.text(`Tél. : ${pro.telephone}`, mL, yPro); }
      if (pro?.rpps) { yPro += 5; doc.text(`N° RPPS : ${pro.rpps}`, mL, yPro); }
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
      doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(dateStr, mR, 22, { align: "right" });

      const lineY = Math.max(yPro + 5, 42);
      doc.setDrawColor(180, 180, 180); doc.line(mL, lineY, mR, lineY);

      // Patient
      const patY = lineY + 7;
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("Patient :", mL, patY);
      doc.setFont("helvetica", "normal");
      const sexe = patient.genre ? (patient.genre === "homme" || patient.genre === "masculin" || patient.genre === "M" ? "M." : "Mme") : "";
      doc.text(`${sexe} ${patient.prenom || ""} ${patient.nom || ""}`.trim(), mL + 18, patY);
      let patLine = patY;
      if (patient.date_naissance) { patLine += 5; doc.text(`Né(e) le : ${patient.date_naissance}`, mL, patLine); }
      doc.line(mL, patLine + 5, mR, patLine + 5);

      // Prescription
      const rpY = patLine + 16;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("Rp.", mL, rpY);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const prescLines = doc.splitTextToSize(ordonnancePrescription.trim(), 145);
      doc.text(prescLines, mL + 12, rpY);
      let y = rpY + prescLines.length * 5.5 + 6;

      if (ordonnanceDuree.trim()) {
        doc.setFont("helvetica", "bold"); doc.text("Durée :", mL + 12, y);
        doc.setFont("helvetica", "normal"); doc.text(ordonnanceDuree.trim(), mL + 30, y); y += 6;
      }
      doc.setFont("helvetica", "bold"); doc.text("Renouvellement :", mL + 12, y);
      doc.setFont("helvetica", "normal"); doc.text(ordonnanceRenouvellement, mL + 50, y); y += 6;

      if (ordonnanceNotes.trim()) {
        y += 4;
        doc.setFont("helvetica", "italic"); doc.setFontSize(9);
        const noteLines = doc.splitTextToSize(ordonnanceNotes.trim(), 145);
        doc.text(noteLines, mL + 12, y); y += noteLines.length * 5 + 4;
      }

      // Zone signature e-CPS
      doc.setDrawColor(160, 160, 160);
      doc.rect(125, 248, 55, 28);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text("Signature électronique e-CPS", 152, 258, { align: "center" });
      doc.text("ou cachet du praticien", 152, 264, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // Mention légale
      doc.setFont("helvetica", "italic"); doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text("Document généré par Rêvade Pro — à signer via e-CPS ou votre logiciel certifié avant toute dispensation.", mL, 283, { maxWidth: 170 });
      doc.setTextColor(0, 0, 0);

      // Upload Supabase Storage
      const pdfBlob = doc.output("blob");
      const path = `${patient.id}/ordonnance-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("patient-documents").upload(path, pdfBlob, { contentType: "application/pdf" });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("patient-documents").getPublicUrl(path);
      const nom = `Ordonnance - ${new Date().toLocaleDateString("fr-FR")}.pdf`;
      const { data: newDoc, error: docErr } = await supabase.from("patient_documents").insert({
        patient_id: id, pro_id: pro.id, nom, type: "ordonnance", file_url: urlData.publicUrl,
      }).select().single();
      if (docErr) throw new Error(`DB insert: ${docErr.message}`);
      if (newDoc) {
        setDocuments(prev => [{ id: newDoc.id, nom: newDoc.nom, type: newDoc.type, file_url: newDoc.file_url }, ...prev]);
        showToast("Ordonnance générée et partagée avec le patient");
      }
      supabase.functions.invoke("send-push", { body: { user_id: id, title: "📄 Nouvelle ordonnance", body: "Votre praticien a partagé une ordonnance", data: { type: "document" } } });

      window.open(urlData.publicUrl, "_blank");
      setShowOrdonnance(false);
      setOrdonnancePrescription(""); setOrdonnanceDuree(""); setOrdonnanceRenouvellement("Non autorisé"); setOrdonnanceNotes("");
      setOnglet("documents");
    } catch (e) {
      console.error("PDF error:", e);
      const msg = e?.message || e?.error_description || JSON.stringify(e);
      if (msg?.includes("Bucket not found") || msg?.includes("bucket")) {
        showToast("Bucket « patient-documents » introuvable — créez-le dans Supabase Storage", 'error');
      } else if (msg?.includes("row-level security") || msg?.includes("policy") || msg?.includes("403")) {
        showToast("Erreur de droits sur le bucket Storage — vérifiez les policies", 'error');
      } else {
        showToast(`Erreur PDF : ${msg}`, 'error');
      }
    }
    setGeneratingPdf(false);
  }

  const typeHistoriqueColor = (type) => {
    if (type === "Paramètres") return { bg: "#E8F5EF", color: "#004649" };
    if (type === "Moments") return { bg: "#EEF0FF", color: "#3F51B5" };
    if (type === "Questionnaire") return { bg: "#FDE8C8", color: "#F5A623" };
    if (type === "Rendez-vous") return { bg: "#EDE7F6", color: "#6A1B9A" };
    return { bg: "#F0F0F0", color: "#888" };
  };

  const docIcon = (type) => {
    if (type === "note") return "📝";
    if (type === "ordonnance") return "📄";
    if (type === "dossier_initial") return "📋";
    if (type === "test_had") return "🧠";
    if (type === "test_horn") return "🚬";
    if (type === "test_beck") return "📝";
    if (type?.startsWith("test_")) return "📋";
    return "📄";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888", fontSize: "15px" }}>Chargement du dossier patient...</p>
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        <p style={{ color: "#1E3A4A", fontSize: "16px", fontWeight: "600" }}>Patient introuvable</p>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "white", border: "1.5px solid #B8D8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", color: "#90A4AE", fontWeight: "500", letterSpacing: "0.3px" }}>NAVIGATION</p>
            <p style={{ margin: 0, fontSize: "15px", color: "#1E3A4A", fontWeight: "700" }}>Fiches patients</p>
          </div>
        </Link>
      </div>
    );
  }

  const nomComplet = `${patient.prenom || ""} ${patient.nom || ""}`.trim();

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8" }}>

      <Navbar proId={pro?.id} />

      <div style={{ padding: "40px 80px", maxWidth: "1200px", margin: "0 auto" }}>

        {/* Flèche retour + boutons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "10px", background: "white", border: "1.5px solid #B8D8E8", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1E3A4A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "11px", color: "#90A4AE", fontWeight: "500", letterSpacing: "0.3px" }}>FICHES PATIENTS</p>
              <p style={{ margin: 0, fontSize: "15px", color: "#1E3A4A", fontWeight: "700" }}>{nomComplet}</p>
            </div>
          </Link>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={() => setShowDeleteModal(true)} style={{
              background: "white", color: "#C62828", borderRadius: "12px", padding: "10px 18px",
              fontSize: "13px", fontWeight: "600", border: "1.5px solid #FFCDD2", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}>🗑️ Supprimer</button>
            <button onClick={() => setShowHistorique(true)} style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              color: "#1E3A4A", borderRadius: "12px", padding: "10px 18px",
              fontSize: "13px", fontWeight: "600", border: "1.5px solid #B8D8E8", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "7px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
            }}>🕐 Historique</button>
            <button onClick={() => setShowNotes(true)} style={{
              background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)",
              color: "white", borderRadius: "12px", padding: "10px 18px",
              fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,70,73,0.3)",
              display: "flex", alignItems: "center", gap: "7px",
            }}>✏️ Notes de consultation</button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: "2px solid #DFF0EA", marginBottom: "36px", gap: "40px" }}>
          {["informations", "statistiques", "parametres", "recommandations", "documents", "messages"].map((o) => {
            const labels = { informations: "Informations", statistiques: "Statistiques", parametres: "Paramètres", recommandations: "Recommandations", documents: "Documents", messages: "Messages" };
            const actif = onglet === o;
            return (
              <button key={o} onClick={() => setOnglet(o)} style={{
                padding: "12px 0", fontSize: "15px", fontWeight: actif ? "700" : "400",
                color: "#1E3A4A", background: "none", border: "none", cursor: "pointer",
                borderBottom: actif ? "3px solid #004649" : "3px solid transparent", marginBottom: "-2px",
              }}>{labels[o]}</button>
            );
          })}
        </div>

        {/* Bannière dossier initial non rempli */}
        {!dossierInitialExiste && (
          <div style={{ background: "linear-gradient(135deg, #FFF3E0, #FFE0B2)", border: "1.5px solid #FFB74D", borderRadius: "16px", padding: "18px 24px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{ fontSize: "28px", flexShrink: 0 }}>⚠️</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#E65100", fontWeight: "700", fontSize: "15px", margin: 0 }}>Dossier de consultation initiale non rempli</p>
              <p style={{ color: "#BF360C", fontSize: "13px", margin: "4px 0 0 0" }}>Ce dossier contient des données essentielles pour le suivi et les statistiques. Pensez à le remplir dès la première consultation.</p>
            </div>
            <button onClick={() => { setShowDossierInitial(true); setOnglet("documents"); }}
              style={{ background: "linear-gradient(135deg, #E65100, #BF360C)", color: "white", border: "none", borderRadius: "12px", padding: "10px 20px", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, boxShadow: "0 4px 8px rgba(230,81,0,0.3)" }}>
              📋 Remplir maintenant
            </button>
          </div>
        )}

        {/* INFORMATIONS */}
        {onglet === "informations" && (
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "40px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", maxWidth: "700px" }}>
            <p style={{ color: "#004649", fontWeight: "700", fontSize: "17px", marginBottom: "4px" }}>{nomComplet}</p>
            <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "24px" }}>Ces informations proviennent de l&apos;application Rêvade</p>
            {[
              ["Prénom", patient.prenom],
              ["Nom", patient.nom],
              ["Pseudo", patient.pseudo],
              ["Genre", patient.genre],
              ["Catégorie socio-professionnelle", patient.categorie_socio_pro],
              ["Date de naissance", patient.date_naissance],
            ].filter(([, v]) => v).map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F0F0F0" }}>
                <span style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600", minWidth: "220px" }}>{label}</span>
                <span style={{ color: "#1E3A4A", fontSize: "14px" }}>{value}</span>
              </div>
            ))}

            <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginTop: "36px", marginBottom: "16px" }}>📋 Questionnaires</p>

            {questionnaires.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun questionnaire complété</p>
            ) : questionnaires.map((q, i) => {
              const reponses = typeof q.reponses === "string" ? JSON.parse(q.reponses) : (q.reponses || {});
              const scoreFumeur = reponses["score_fagerström_fumeur"];
              const niveauFumeur = reponses["niveau_fagerström_fumeur"];
              const scoreVapoteur = reponses["score_fagerström_vapoteur"];
              const niveauVapoteur = reponses["niveau_fagerström_vapoteur"];
              const scoreGAD = reponses["score_gad4"];
              const niveauGAD = reponses["niveau_gad4"];
              const autresReponses = Object.entries(reponses)
                .filter(([key]) => !META_KEYS.has(key))
                .map(([key, value]) => ({
                  question: QUESTION_LABELS[key] || key.replace(/_/g, " "),
                  reponse: decodeValue(key, value),
                }));

              const getNiveauStyle = (niveau) => {
                if (!niveau) return { bg: "#EFEFEF", color: "#555" };
                const n = niveau.toLowerCase();
                if (n === "très faible" || n === "aucune") return { bg: "#E8F5E9", color: "#2E7D32" };
                if (n === "faible" || n === "légère") return { bg: "#F1F8E9", color: "#558B2F" };
                if (n === "moyenne" || n === "modérée") return { bg: "#FFF3E0", color: "#E65100" };
                if (n === "forte" || n === "sévère") return { bg: "#FFEBEE", color: "#C62828" };
                if (n === "très forte") return { bg: "#FCE4EC", color: "#880E4F" };
                return { bg: "#EFEFEF", color: "#555" };
              };

              const mainNiveau = q.niveau;
              const mainStyle = getNiveauStyle(mainNiveau);
              const cardBorder = mainStyle.color;

              return (
                <div key={i} style={{ border: `1.5px solid ${cardBorder}40`, borderRadius: "16px", padding: "20px", marginBottom: "16px", backgroundColor: `${mainStyle.bg}`, boxShadow: `0 2px 8px ${cardBorder}20` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => toggleQuest(i)}>
                    <div style={{ background: mainStyle.color, borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 4px 8px ${mainStyle.color}40` }}>
                      <span style={{ color: "white", fontWeight: "700", fontSize: "20px" }}>{q.score}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ color: mainStyle.color, fontWeight: "700", fontSize: "15px" }}>{mainNiveau}</span>
                        {i === 0 && <span style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "12px" }}>Récent</span>}
                      </div>
                      <p style={{ color: "#aaa", fontSize: "13px" }}>{formatDate(q.date_completion)}</p>
                    </div>
                    <span style={{ color: "#aaa", fontSize: "18px" }}>{questOuverts[i] ? "▲" : "▼"}</span>
                  </div>
                  {questOuverts[i] && (
                    <div style={{ marginTop: "20px", borderTop: `1px solid ${cardBorder}30`, paddingTop: "20px" }}>
                      <p style={{ fontWeight: "700", color: "#1E3A4A", marginBottom: "12px" }}>📊 Scores</p>
                      {scoreFumeur != null && (() => { const s = getNiveauStyle(niveauFumeur); return (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "14px", color: "#1E3A4A" }}>Fagerström (fumeur)</span>
                          <span style={{ backgroundColor: s.bg, color: s.color, borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600", border: `1px solid ${s.color}30` }}>{scoreFumeur} — {niveauFumeur}</span>
                        </div>
                      ); })()}
                      {scoreVapoteur != null && (() => { const s = getNiveauStyle(niveauVapoteur); return (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                          <span style={{ fontSize: "14px", color: "#1E3A4A" }}>Fagerström (vapoteur)</span>
                          <span style={{ backgroundColor: s.bg, color: s.color, borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600", border: `1px solid ${s.color}30` }}>{scoreVapoteur} — {niveauVapoteur}</span>
                        </div>
                      ); })()}
                      {scoreGAD != null && (() => { const s = getNiveauStyle(niveauGAD); return (
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                          <span style={{ fontSize: "14px", color: "#1E3A4A" }}>GAD-4 (détresse psy.)</span>
                          <span style={{ backgroundColor: s.bg, color: s.color, borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600", border: `1px solid ${s.color}30` }}>{scoreGAD} — {niveauGAD}</span>
                        </div>
                      ); })()}
                      {autresReponses.length > 0 && (
                        <>
                          <p style={{ fontWeight: "700", color: "#1E3A4A", marginBottom: "12px" }}>📝 Réponses</p>
                          {autresReponses.map((r, j) => (
                            <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${cardBorder}20` }}>
                              <span style={{ fontSize: "13px", color: "#1E3A4A", fontWeight: "500", flex: 1 }}>{r.question}</span>
                              <span style={{ fontSize: "13px", color: "#888", marginLeft: "16px", textAlign: "right" }}>{r.reponse}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* STATISTIQUES */}
        {onglet === "statistiques" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px", marginBottom: "8px" }}>Sessions vapotage</p>
              <p style={{ color: "#888", fontSize: "13px" }}>
                {sessions.length === 0
                  ? "Aucune session enregistrée"
                  : `${sessions.length} session${sessions.length > 1 ? "s" : ""} synchronisée${sessions.length > 1 ? "s" : ""}`}
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {[
                { label: "Moments par jour", value: stats.momentParJour, icon: "📅" },
                { label: "Durée moyenne d'une taff", value: stats.dureeMoyenneTaff, icon: "⏱️" },
                { label: "Temps de session moyen", value: stats.tempsSessionMoyen, icon: "🕐" },
              ].map((stat) => (
                <div key={stat.label} style={{ background: "linear-gradient(135deg, #E8F5EF 0%, #D0EDE0 100%)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,70,73,0.1), inset 0 1px 0 rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "28px" }}>{stat.icon}</span>
                  <p style={{ color: "#004649", fontWeight: "700", fontSize: "22px" }}>{stat.value}</p>
                  <p style={{ color: "#1E3A4A", fontSize: "13px", textAlign: "center" }}>{stat.label}</p>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "16px", marginBottom: "20px" }}>Journal de bord</p>
              <div style={{ display: "flex", borderBottom: "2px solid #F0F0F0", marginBottom: "24px", gap: "32px" }}>
                {["humeur", "substituts"].map((s) => {
                  const actif = sousOngletStats === s;
                  return (
                    <button key={s} onClick={() => setSousOngletStats(s)} style={{ padding: "8px 0", fontSize: "14px", fontWeight: actif ? "700" : "400", color: "#1E3A4A", background: "none", border: "none", cursor: "pointer", borderBottom: actif ? "3px solid #004649" : "3px solid transparent", marginBottom: "-2px" }}>
                      {s === "humeur" ? "Humeur" : "Substituts"}
                    </button>
                  );
                })}
              </div>
              {sousOngletStats === "humeur" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {journalEntries.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucune entrée d&apos;humeur</p>
                  ) : journalEntries.map((h, i) => (
                    <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px" }}>
                          {new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                        </span>
                        <span style={{ fontSize: "28px" }}>{h.mood}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#E07B39" }}>🔥</span>
                        <span style={{ color: "#888", fontSize: "13px" }}>Manque :</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {Array.from({ length: 10 }, (_, j) => (
                            <div key={j} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: j < h.craving ? "#E07B39" : "#E0E0E0" }} />
                          ))}
                        </div>
                      </div>
                      {h.notes && <span style={{ color: "#888", fontSize: "13px", fontStyle: "italic" }}>{h.notes}</span>}
                    </div>
                  ))}
                </div>
              )}
              {sousOngletStats === "substituts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {substitutEntries.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun substitut renseigné</p>
                  ) : substitutEntries.map((s, i) => (
                    <div key={i} style={{ border: "1.5px solid #B8D8E8", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🕐</span>
                          <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px" }}>
                            {new Date(s.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <span style={{ border: "1px solid #B8D8E8", borderRadius: "8px", padding: "4px 14px", fontSize: "13px", color: "#1E3A4A" }}>{s.forme}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#888", fontSize: "13px" }}>
                        <span>💬</span><span>{s.moment}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1E3A4A", fontSize: "13px", fontWeight: "600" }}>
                        <span>🧪</span><span>{s.dosage} mg</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PARAMÈTRES */}
        {onglet === "parametres" && (
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "40px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
            <div style={{ display: "flex", gap: "60px", alignItems: "flex-start" }}>
              <div style={{ background: "linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)", borderRadius: "16px", padding: "20px", width: "180px", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Image src="/vape.png" alt="Vape" width={140} height={200} style={{ objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1, display: "flex", gap: "60px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Puissance</p>
                  <span style={{ fontSize: "28px" }}>⚡</span>
                  <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600" }}>—</p>
                  <div style={{ width: "8px", height: "120px", background: "linear-gradient(180deg, #004649 0%, #DFF0EA 100%)", borderRadius: "4px" }}></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Nicotine</p>
                  <span style={{ fontSize: "28px" }}>🧪</span>
                  <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600" }}>{lastNicotine}</p>
                  <div style={{ width: "8px", height: "120px", background: "linear-gradient(180deg, #004649 0%, #DFF0EA 100%)", borderRadius: "4px" }}></div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Plan de sevrage</p>
                  {moments.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun moment configuré</p>
                  ) : moments.map((m, i) => (
                    <div key={i} style={{ background: "linear-gradient(135deg, #F5F9F8 0%, #E8F5EF 100%)", border: "1px solid #DFF0EA", borderRadius: "16px", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,70,73,0.08)" }}>
                      <div>
                        <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>{m.name}</span>
                        <br /><span style={{ color: "#888", fontSize: "13px" }}>Bouffées autorisées</span>
                      </div>
                      <div style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", borderRadius: "12px", padding: "8px 20px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                        <span style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>{m.puffs}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMANDATIONS */}
        {onglet === "recommandations" && (() => {
          const TSN = [
            { id: "patch_24h", nom: "Patch 24h", icon: "🩹", doses: ["7 mg/24h", "14 mg/24h", "21 mg/24h"] },
            { id: "patch_16h", nom: "Patch 16h", icon: "🩹", doses: ["10 mg/16h", "15 mg/16h", "25 mg/16h"] },
            { id: "gomme", nom: "Gomme à mâcher", icon: "🟡", doses: ["2 mg", "4 mg"] },
            { id: "subl", nom: "Comprimés sublinguaux", icon: "💊", doses: ["2 mg"] },
            { id: "sucer", nom: "Comprimés à sucer", icon: "⚪", doses: ["1,5 mg", "4 mg"] },
            { id: "spray", nom: "Spray", icon: "🌬️", doses: ["1 mg/dose"] },
            { id: "pastille", nom: "Pastilles", icon: "🔵", doses: ["1 mg", "2 mg", "4 mg"] },
          ];
          return (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Recommandations libres */}
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "8px" }}>📝 Recommandations thérapeutiques</p>
              <p style={{ color: "#90A4AE", fontSize: "13px", marginBottom: "16px" }}>Rédigez librement vos recommandations, conseils, plan de soins et points de vigilance.</p>
              <textarea value={recommandations.notes || ""} onChange={(e) => setRecommandations(prev => ({ ...prev, notes: e.target.value }))}
                placeholder={"Ex : Arrêt total recommandé dès le 15/06. Initier substitution nicotinique en bithérapie (patch + forme orale). Revoir dans 4 semaines. Orienter vers soutien psychologique si besoin."}
                rows={6}
                style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "16px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "vertical", backgroundColor: "#FAFAFA", boxSizing: "border-box", lineHeight: "1.7" }} />
            </div>

            {/* Plan TSN */}
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "6px" }}>💊 Plan de substitution nicotinique (TSN)</p>
              <p style={{ color: "#90A4AE", fontSize: "13px", marginBottom: "20px" }}>Cochez les produits prescrits et sélectionnez la dose. Plusieurs produits peuvent être combinés (bithérapie).</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {TSN.map(p => {
                  const actif = !!recommandations[`tsn_${p.id}`];
                  const dose = recommandations[`tsn_dose_${p.id}`] || "";
                  return (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", background: actif ? "linear-gradient(135deg, #E8F5EF, #D4EDE0)" : "#F8FAFC", borderRadius: "14px", border: `1.5px solid ${actif ? "#004649" : "#E4ECF2"}`, transition: "all 0.15s" }}>
                      <input type="checkbox" checked={actif}
                        onChange={() => setRecommandations(prev => ({ ...prev, [`tsn_${p.id}`]: !actif, [`tsn_dose_${p.id}`]: !actif ? "" : prev[`tsn_dose_${p.id}`] }))}
                        style={{ width: "18px", height: "18px", accentColor: "#004649", flexShrink: 0, cursor: "pointer" }} />
                      <span style={{ fontSize: "20px", flexShrink: 0 }}>{p.icon}</span>
                      <span style={{ color: "#1E3A4A", fontWeight: actif ? "700" : "500", fontSize: "14px", flex: 1 }}>{p.nom}</span>
                      <select value={dose}
                        onChange={e => setRecommandations(prev => ({ ...prev, [`tsn_dose_${p.id}`]: e.target.value }))}
                        disabled={!actif}
                        style={{ border: "1px solid #B8D8E8", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", color: actif ? "#004649" : "#B0BEC5", backgroundColor: actif ? "white" : "#F0F0F0", outline: "none", cursor: actif ? "pointer" : "not-allowed", minWidth: "130px" }}>
                        <option value="">— Dose —</option>
                        {p.doses.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: "20px" }}>
                <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", marginBottom: "8px" }}>Précisions posologiques</p>
                <textarea value={recommandations.posologie || ""} onChange={(e) => setRecommandations(prev => ({ ...prev, posologie: e.target.value }))}
                  placeholder="Ex : 1 patch 21mg/24h le matin + gomme 4mg à la demande (max 15/jour) — durée 12 semaines puis décroissance"
                  rows={3}
                  style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "vertical", backgroundColor: "#FAFAFA", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Suivi */}
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "20px" }}>🗓️ Suivi du traitement</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", marginBottom: "8px" }}>Durée prévue du traitement</p>
                  <select value={recommandations.duree || ""} onChange={(e) => setRecommandations(prev => ({ ...prev, duree: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#1E3A4A", backgroundColor: "white", boxSizing: "border-box" }}>
                    <option value="">Sélectionner</option>
                    <option>4 semaines</option><option>8 semaines</option><option>12 semaines</option><option>6 mois</option><option>1 an</option>
                  </select>
                </div>
                <div>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", marginBottom: "8px" }}>Date du prochain contrôle</p>
                  <input type="date" value={recommandations.dateControle || ""} onChange={(e) => setRecommandations(prev => ({ ...prev, dateControle: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#1E3A4A", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={enregistrerRecommandations} disabled={savingReco} style={{ background: savingReco ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "12px", padding: "14px 36px", fontSize: "14px", fontWeight: "600", border: "none", cursor: savingReco ? "not-allowed" : "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                {savingReco ? "Enregistrement..." : "✓ Enregistrer les recommandations"}
              </button>
            </div>
          </div>
          );
        })()}

        {/* DOCUMENTS */}
        {onglet === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Boutons d'action */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button onClick={() => setShowOrdonnance(true)} style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
                📄 Ordonnance
              </button>
              <button onClick={() => setShowOrdonTSN(true)} style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
                💊 Ordon TSN
              </button>
              <button onClick={() => setShowDossierInitial(true)} style={{ background: "linear-gradient(135deg, #1565C0 0%, #1976D2 100%)", color: "white", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(21,101,192,0.3)", display: "flex", alignItems: "center", gap: "8px" }}>
                📋 Dossier consultation initiale
              </button>
              <button onClick={() => setShowNotes(true)} style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)", color: "#004649", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "1.5px solid #004649", cursor: "pointer" }}>
                ✏️ Note de consultation
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImport} multiple style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current.click()} style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)", color: "#004649", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "1.5px solid #A5C9B9", cursor: "pointer" }}>
                + Importer
              </button>
            </div>

            {/* Liste des documents */}
            {documents.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun document pour l&apos;instant</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {documents.map((doc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "1px solid #F0F0F0" }}>
                    <span style={{ fontSize: "22px", flexShrink: 0 }}>{docIcon(doc.type)}</span>
                    <span style={{ flex: 1, color: "#1E3A4A", fontSize: "14px", fontWeight: "500" }}>{doc.nom}</span>
                    {doc.type === "dossier_initial" ? (
                      <button onClick={() => setShowDossierInitial(true)} style={{ color: "#004649", fontSize: "13px", fontWeight: "600", background: "#E8F5EF", borderRadius: "8px", padding: "6px 14px", border: "1px solid #A5C9B9", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer" }}>
                        Ouvrir ↗
                      </button>
                    ) : doc.type?.startsWith("test_") ? (
                      <button onClick={() => setOpenedTest({ id: doc.id, type: doc.testType, nom: doc.nom })} style={{ color: "#004649", fontSize: "13px", fontWeight: "600", background: "#E8F5EF", borderRadius: "8px", padding: "6px 14px", border: "1px solid #A5C9B9", whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer" }}>
                        Ouvrir ↗
                      </button>
                    ) : doc.file_url ? (
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer" style={{ color: "#004649", fontSize: "13px", fontWeight: "600", textDecoration: "none", background: "#E8F5EF", borderRadius: "8px", padding: "6px 14px", border: "1px solid #A5C9B9", whiteSpace: "nowrap", flexShrink: 0 }}>
                        Ouvrir ↗
                      </a>
                    ) : (
                      <span style={{ color: "#ccc", fontSize: "12px", flexShrink: 0 }}>Texte</span>
                    )}
                    {doc.type !== "dossier_initial" && (
                      <button onClick={() => supprimerDocument(doc)} style={{ background: "none", border: "1px solid #FFCDD2", borderRadius: "8px", padding: "6px 10px", fontSize: "13px", color: "#C62828", cursor: "pointer", flexShrink: 0 }} title="Supprimer">🗑️</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MESSAGES (thread inline) */}
      {onglet === "messages" && (() => {
        const patientInitials = `${(patient.prenom || "")[0] || ""}${(patient.nom || "")[0] || ""}`.toUpperCase();
        const proInitials = `${(pro?.prenom || "")[0] || ""}${(pro?.nom || "")[0] || ""}`.toUpperCase();
        return (
          <div style={{ maxWidth: "760px", margin: "0 auto", marginTop: "-20px" }}>
          <div style={{ display: "flex", flexDirection: "column", height: "620px", borderRadius: "20px", overflow: "hidden", border: "1.5px solid #E4ECF2", boxShadow: "0 8px 32px rgba(0,0,0,0.07)" }}>

            {/* Header */}
            <div style={{ background: "white", padding: "16px 24px", display: "flex", alignItems: "center", gap: "14px", borderBottom: "1px solid #EEF3F7" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #004649, #006B6F)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,70,73,0.25)" }}>
                <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>{patientInitials}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px", margin: 0 }}>{nomComplet}</p>
                <p style={{ color: "#90A4AE", fontSize: "12px", margin: "2px 0 0 0" }}>Messagerie sécurisée · visible dans l&apos;app Rêvade</p>
              </div>
            </div>

            {/* Zone messages */}
            <div ref={threadScrollRef} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px", background: "#F4F8FB" }}>
              {threadLoading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                  <p style={{ color: "#90A4AE", fontSize: "14px" }}>Chargement…</p>
                </div>
              ) : threadMsgs.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", gap: "14px" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #E8F5EF, #C8E6D4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#004649" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                  </div>
                  <p style={{ color: "#546E7A", fontSize: "14px", fontWeight: "600", margin: 0 }}>Aucun message pour le moment</p>
                  <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center", maxWidth: "280px", lineHeight: "1.5", margin: 0 }}>
                    Démarrez la conversation — {patient.prenom} recevra une notification directement dans son application
                  </p>
                </div>
              ) : threadMsgs.map((msg, i) => {
                const isPro = msg.sender_type === "pro";
                const time = msg.created_at ? (() => {
                  const d = new Date(msg.created_at);
                  const now = new Date();
                  return d.toDateString() === now.toDateString()
                    ? d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
                    : d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " · " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
                })() : "";
                return (
                  <div key={i} style={{ display: "flex", justifyContent: isPro ? "flex-end" : "flex-start", alignItems: "flex-end", gap: "8px" }}>
                    {!isPro && (
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #455A64, #546E7A)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ color: "white", fontWeight: "700", fontSize: "11px" }}>{patientInitials}</span>
                      </div>
                    )}
                    <div style={{ maxWidth: "65%" }}>
                      <div style={{
                        padding: "11px 15px",
                        borderRadius: isPro ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        background: isPro ? "linear-gradient(135deg, #004649, #006B6F)" : "white",
                        boxShadow: isPro ? "0 4px 14px rgba(0,70,73,0.22)" : "0 2px 8px rgba(0,0,0,0.06)",
                        border: isPro ? "none" : "1px solid #E8EEF4",
                      }}>
                        <p style={{ color: isPro ? "white" : "#1E3A4A", fontSize: "14px", lineHeight: "1.5", margin: 0, whiteSpace: "pre-wrap" }}>{msg.content}</p>
                      </div>
                      <p style={{ color: "#B0BEC5", fontSize: "11px", margin: "4px 6px 0", textAlign: isPro ? "right" : "left" }}>{time}</p>
                    </div>
                    {isPro && (
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #004649, #006B6F)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,70,73,0.2)" }}>
                        <span style={{ color: "white", fontWeight: "700", fontSize: "11px" }}>{proInitials}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Zone saisie */}
            <div style={{ padding: "14px 20px", background: "white", borderTop: "1px solid #EEF3F7", display: "flex", alignItems: "flex-end", gap: "10px" }}>
              <textarea
                value={threadInput}
                onChange={(e) => setThreadInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendThreadMsg(); } }}
                placeholder={`Message à ${patient.prenom}… (Entrée pour envoyer)`}
                rows={1}
                style={{ flex: 1, border: "1.5px solid #E4ECF2", borderRadius: "14px", padding: "11px 16px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "none", fontFamily: "inherit", lineHeight: "1.5", background: "#F8FAFC" }}
              />
              <button
                onClick={sendThreadMsg}
                disabled={threadSending || !threadInput.trim()}
                style={{ width: "46px", height: "46px", borderRadius: "50%", border: "none", flexShrink: 0, cursor: (threadSending || !threadInput.trim()) ? "default" : "pointer", background: (threadSending || !threadInput.trim()) ? "#E8EEF2" : "linear-gradient(135deg, #004649, #006B6F)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: (threadSending || !threadInput.trim()) ? "none" : "0 4px 12px rgba(0,70,73,0.32)", transition: "all 0.15s ease" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={(threadSending || !threadInput.trim()) ? "#90A4AE" : "white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
          </div>
        );
      })()}

      {/* Modal ordonnance */}
      {showOrdonnance && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "24px", padding: "40px", width: "620px", maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px" }}>📄 Créer une ordonnance</h2>
              <button onClick={() => setShowOrdonnance(false)} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888" }}>×</button>
            </div>

            {/* En-tête médecin / patient */}
            <div style={{ background: "#F0F4F8", borderRadius: "12px", padding: "16px 20px", display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
              <div>
                <div style={{ fontWeight: "700", color: "#1E3A4A", fontSize: "14px" }}>Dr. {pro?.prenom} {pro?.nom}</div>
                {pro?.specialite && <div style={{ color: "#546E7A", marginTop: "2px" }}>{pro.specialite}</div>}
                {pro?.cabinet && <div style={{ color: "#546E7A" }}>{pro.cabinet}</div>}
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700", color: "#1E3A4A", fontSize: "14px" }}>{nomComplet}</div>
                {patient?.date_naissance && <div style={{ color: "#546E7A", marginTop: "2px" }}>Né(e) le {patient.date_naissance}</div>}
                <div style={{ color: "#888", marginTop: "2px" }}>{new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</div>
              </div>
            </div>

            {/* Prescription */}
            <div>
              <label style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>
                Médicaments / Substituts prescrits <span style={{ color: "#E65100" }}>*</span>
              </label>
              <textarea
                value={ordonnancePrescription}
                onChange={e => setOrdonnancePrescription(e.target.value)}
                placeholder={"Ex :\n- Patch nicotine 21 mg/24h, 1 patch/jour pendant 6 semaines\n- Gomme nicotine 4 mg, max 15/jour"}
                rows={5}
                style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "vertical", backgroundColor: "#FAFAFA", boxSizing: "border-box", fontFamily: "inherit", lineHeight: "1.5" }}
              />
            </div>

            {/* Durée + Renouvellement */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>Durée du traitement</label>
                <input value={ordonnanceDuree} onChange={e => setOrdonnanceDuree(e.target.value)} placeholder="Ex : 6 semaines"
                  style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#1E3A4A", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>Renouvellement</label>
                <select value={ordonnanceRenouvellement} onChange={e => setOrdonnanceRenouvellement(e.target.value)}
                  style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", color: "#1E3A4A", outline: "none", backgroundColor: "white", boxSizing: "border-box" }}>
                  <option>Non autorisé</option>
                  <option>1 fois</option>
                  <option>2 fois</option>
                  <option>3 fois</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>
                Notes complémentaires <span style={{ color: "#aaa", fontWeight: "400" }}>(optionnel)</span>
              </label>
              <textarea value={ordonnanceNotes} onChange={e => setOrdonnanceNotes(e.target.value)}
                placeholder="Instructions particulières, mises en garde, conseils…" rows={3}
                style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "vertical", backgroundColor: "#FAFAFA", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>

            {/* Boutons */}
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => setShowOrdonnance(false)} style={{ padding: "12px 28px", borderRadius: "12px", border: "1px solid #B8D8E8", backgroundColor: "white", color: "#1E3A4A", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Annuler
              </button>
              <button
                onClick={genererOrdonnancePDF}
                disabled={generatingPdf || !ordonnancePrescription.trim()}
                style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: (generatingPdf || !ordonnancePrescription.trim()) ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", fontWeight: "600", cursor: (generatingPdf || !ordonnancePrescription.trim()) ? "not-allowed" : "pointer", fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                {generatingPdf ? "Génération…" : "📄 Générer le PDF et partager"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal historique */}
      {showHistorique && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "24px", padding: "40px", width: "560px", maxHeight: "80vh", overflow: "auto", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px" }}>🕐 Historique — {nomComplet}</h2>
              <button onClick={() => setShowHistorique(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888" }}>×</button>
            </div>
            {historique.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun historique disponible</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {historique.map((h, i) => {
                  const colors = typeHistoriqueColor(h.type);
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "16px", background: "linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%)", borderRadius: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: colors.color }} />
                        {i < historique.length - 1 && <div style={{ width: "2px", height: "24px", backgroundColor: "#E0E0E0" }} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                          <span style={{ backgroundColor: colors.bg, color: colors.color, borderRadius: "999px", padding: "2px 10px", fontSize: "12px", fontWeight: "600" }}>{h.type}</span>
                          <span style={{ color: "#aaa", fontSize: "12px" }}>{h.date}</span>
                        </div>
                        <p style={{ color: "#1E3A4A", fontSize: "14px" }}>{h.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal notes */}
      {showNotes && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "24px", padding: "48px", width: "560px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px" }}>✏️ Notes — {nomComplet}</h2>
            <p style={{ color: "#888", fontSize: "13px", marginTop: "-8px" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <textarea value={noteTexte} onChange={(e) => setNoteTexte(e.target.value)}
              placeholder="Rédigez vos notes de consultation ici..." rows={10}
              style={{ border: "1px solid #B8D8E8", borderRadius: "16px", padding: "16px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "none", backgroundColor: "#FAFAFA", lineHeight: "1.6" }} />
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button onClick={() => { setShowNotes(false); setNoteTexte(""); }} style={{ padding: "12px 28px", borderRadius: "12px", border: "1px solid #B8D8E8", backgroundColor: "white", color: "#1E3A4A", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Annuler
              </button>
              <button onClick={enregistrerNote} style={{ padding: "12px 28px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                Enregistrer dans Documents
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression fiche */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "420px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>🗑️</div>
              <h2 style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "17px", marginBottom: "6px" }}>Supprimer la fiche patient</h2>
              <p style={{ color: "#546E7A", fontSize: "13px", lineHeight: "1.5" }}>
                La fiche de <strong>{nomComplet}</strong> sera retirée de votre liste.<br />
                Ses données de santé sont conservées dans notre système.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setShowDeleteModal(false)} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E0E0E0", background: "white", color: "#546E7A", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Annuler
              </button>
              <button onClick={deleteLink} disabled={deleting} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #B71C1C, #E53935)", color: "white", fontWeight: "700", cursor: deleting ? "default" : "pointer", fontSize: "14px", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <OrdonTSNModal
        open={showOrdonTSN}
        onClose={() => setShowOrdonTSN(false)}
        patient={patient}
        pro={pro}
        patientId={id}
        onSaved={(newDoc) => newDoc && setDocuments(prev => [newDoc, ...prev])}
      />

      <DossierInitialModal
        open={showDossierInitial}
        onClose={() => setShowDossierInitial(false)}
        patient={patient}
        pro={pro}
        patientId={id}
        questionnaires={questionnaires}
        onSaved={() => {
          const date = new Date().toLocaleDateString("fr-FR");
          setDossierInitialExiste(true);
          setDocuments(prev => {
            const filtered = prev.filter(d => d.id !== "dossier_initial");
            return [{ id: "dossier_initial", nom: `Dossier consultation initiale — ${date}`, type: "dossier_initial", file_url: null }, ...filtered];
          });
        }}
      />

      {openedTest && <TestResultModal test={openedTest} onClose={() => setOpenedTest(null)} />}
    </div>
  );
}
