"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const navItems = [
  { href: "/accueil", label: "ACCUEIL", actif: false },
  { href: "/dashboard", label: "FICHES PATIENTS", actif: true },
  { href: "/forum", label: "FORUM", actif: false },
  { href: "/annuaire", label: "ANNUAIRE", actif: false },
  { href: "/profil", label: "PROFIL", actif: false },
];

const tousLesPatients = [
  {
    id: 1, prenom: "Amina", nom: "Diallo", pseudo: "aminad", email: "amina.diallo@mail.fr", genre: "Femme", csp: "Employée", dateNaissance: "14/03/1990",
    humeurs: [
      { date: "28 mars", emoji: "😄", manque: 2, note: "" },
      { date: "25 mars", emoji: "😊", manque: 1, note: "Bonne journée" },
    ],
    substituts: [{ heure: "09:00", type: "Patch", contexte: "Routine matin", dosage: "14 mg" }],
    questionnaires: [
      {
        date: "15 mars 2026", score: 3, niveau: "Faible", recent: true,
        fagerstrom: "3 - Faible", gad4: "3 - Légère",
        reponses: [
          { question: "Statut tabagique", reponse: "En sevrage" },
          { question: "Fréquence", reponse: "Occasionnelle" },
          { question: "Nombre de cigarettes/jour", reponse: "0 à 10" },
          { question: "Temps avant 1ère cigarette", reponse: "Après 60 minutes" },
          { question: "Difficulté lieux interdits", reponse: "Non" },
          { question: "Cigarette la plus importante", reponse: "Une autre" },
          { question: "Fume plus le matin", reponse: "Non" },
          { question: "Fume même malade", reponse: "Non" },
          { question: "Substituts nicotiniques", reponse: "Oui - Patch 14mg" },
          { question: "GAD - Nervosité/anxiété", reponse: "Plusieurs jours" },
          { question: "GAD - Inquiétudes", reponse: "Jamais" },
          { question: "GAD - Peu d'intérêt", reponse: "Jamais" },
          { question: "GAD - Tristesse", reponse: "Plusieurs jours" },
          { question: "Autres addictions", reponse: "Aucune" },
          { question: "Niveau de stress", reponse: "Faible" },
          { question: "Association pauses", reponse: "Oui" },
          { question: "Association alcool", reponse: "Non" },
          { question: "Association café", reponse: "Oui" },
          { question: "Association convivialité", reponse: "Non" },
          { question: "Association réflexion", reponse: "Non" },
          { question: "Association fatigue", reponse: "Non" },
          { question: "Association stress", reponse: "Oui" },
          { question: "Association humeur", reponse: "Non" },
          { question: "Gestion du stress", reponse: "Yoga" },
        ]
      },
    ],
    historique: [
      { date: "28 mars 2026", type: "Paramètres", detail: "Nicotine : 9 MG/ML → 6 MG/ML" },
      { date: "15 mars 2026", type: "Paramètres", detail: "Puissance : 3.5V → 3.0V" },
      { date: "10 mars 2026", type: "Moments", detail: "Ajout moment : Déjeuner (15 bouffées)" },
      { date: "1 mars 2026", type: "Questionnaire", detail: "Score Fagerström : 3 - Faible" },
    ],
    stats: { momentParJour: 2, dureeMoyenneTaff: "3 sec", tempsSessionMoyen: "8 min" },
    vape: { puissance: "3.0V", nicotine: "6 MG/ML" },
    moments: [{ nom: "Matin", bouffees: 20 }, { nom: "Déjeuner", bouffees: 15 }],
  },
  {
    id: 2, prenom: "Karim", nom: "Benouli", pseudo: "karimb", email: "karim.benouli@mail.fr", genre: "Homme", csp: "Ouvrier", dateNaissance: "22/07/1985",
    humeurs: [
      { date: "27 mars", emoji: "😔", manque: 8, note: "Journée difficile au travail" },
      { date: "24 mars", emoji: "😐", manque: 6, note: "" },
      { date: "20 mars", emoji: "😠", manque: 9, note: "Très stressé" },
    ],
    substituts: [
      { heure: "08:00", type: "Gomme", contexte: "Envie forte", dosage: "4 mg" },
      { heure: "14:30", type: "Gomme", contexte: "Pause travail", dosage: "2 mg" },
    ],
    questionnaires: [
      {
        date: "20 mars 2026", score: 8, niveau: "Élevée", recent: true,
        fagerstrom: "8 - Élevée", gad4: "9 - Sévère",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur uniquement" },
          { question: "Fréquence", reponse: "Régulière" },
          { question: "Nombre de cigarettes/jour", reponse: "21 à 30" },
          { question: "Temps avant 1ère cigarette", reponse: "Dans les 5 minutes" },
          { question: "Difficulté lieux interdits", reponse: "Oui" },
          { question: "Cigarette la plus importante", reponse: "La première du matin" },
          { question: "Fume plus le matin", reponse: "Oui" },
          { question: "Fume même malade", reponse: "Oui" },
          { question: "Substituts nicotiniques", reponse: "Non" },
          { question: "GAD - Nervosité/anxiété", reponse: "Presque tous les jours" },
          { question: "GAD - Inquiétudes", reponse: "Presque tous les jours" },
          { question: "GAD - Peu d'intérêt", reponse: "Plus de sept jours" },
          { question: "GAD - Tristesse", reponse: "Presque tous les jours" },
          { question: "Autres addictions", reponse: "Alcool occasionnel" },
          { question: "Niveau de stress", reponse: "Élevé" },
          { question: "Association pauses", reponse: "Oui" },
          { question: "Association alcool", reponse: "Oui" },
          { question: "Association café", reponse: "Oui" },
          { question: "Association convivialité", reponse: "Oui" },
          { question: "Association réflexion", reponse: "Non" },
          { question: "Association fatigue", reponse: "Oui" },
          { question: "Association stress", reponse: "Oui" },
          { question: "Association humeur", reponse: "Oui" },
          { question: "Gestion du stress", reponse: "Aucune" },
        ]
      },
      {
        date: "10 janvier 2026", score: 7, niveau: "Élevée", recent: false,
        fagerstrom: "7 - Élevée", gad4: "8 - Sévère",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur uniquement" },
          { question: "Nombre de cigarettes/jour", reponse: "21 à 30" },
          { question: "Substituts nicotiniques", reponse: "Non" },
          { question: "Autres addictions", reponse: "Aucune" },
          { question: "Niveau de stress", reponse: "Élevé" },
          { question: "Gestion du stress", reponse: "Sport" },
        ]
      },
    ],
    historique: [
      { date: "20 mars 2026", type: "Questionnaire", detail: "Score Fagerström : 8 - Élevée" },
      { date: "15 mars 2026", type: "Paramètres", detail: "Nicotine : 18 MG/ML (inchangé)" },
      { date: "5 mars 2026", type: "Moments", detail: "Modification : Soirée 40 → 50 bouffées" },
      { date: "10 janvier 2026", type: "Questionnaire", detail: "Score Fagerström : 7 - Élevée" },
    ],
    stats: { momentParJour: 4, dureeMoyenneTaff: "4 sec", tempsSessionMoyen: "15 min" },
    vape: { puissance: "4.0V", nicotine: "18 MG/ML" },
    moments: [{ nom: "Réveil", bouffees: 40 }, { nom: "Pause matin", bouffees: 35 }, { nom: "Déjeuner", bouffees: 30 }, { nom: "Soirée", bouffees: 50 }],
  },
  {
    id: 3, prenom: "Mei", nom: "Chen", pseudo: "meichen", email: "mei.chen@mail.fr", genre: "Femme", csp: "Cadre", dateNaissance: "05/11/1993",
    humeurs: [
      { date: "29 mars", emoji: "😊", manque: 3, note: "" },
      { date: "26 mars", emoji: "😄", manque: 1, note: "Super journée !" },
    ],
    substituts: [],
    questionnaires: [
      {
        date: "22 mars 2026", score: 4, niveau: "Moyenne", recent: true,
        fagerstrom: "4 - Moyenne", gad4: "4 - Modérée",
        reponses: [
          { question: "Statut tabagique", reponse: "Vapoteur uniquement" },
          { question: "Fréquence vapotage", reponse: "Régulière" },
          { question: "Concentration nicotine", reponse: "3 mg/ml" },
          { question: "Substituts nicotiniques", reponse: "Non" },
          { question: "Niveau de stress", reponse: "Moyen" },
          { question: "Gestion du stress", reponse: "Méditation" },
        ]
      },
    ],
    historique: [
      { date: "22 mars 2026", type: "Questionnaire", detail: "Score Fagerström : 4 - Moyenne" },
      { date: "10 mars 2026", type: "Paramètres", detail: "Nicotine : 6 MG/ML → 3 MG/ML" },
      { date: "1 mars 2026", type: "Moments", detail: "Suppression moment : Midi" },
    ],
    stats: { momentParJour: 2, dureeMoyenneTaff: "2 sec", tempsSessionMoyen: "6 min" },
    vape: { puissance: "3.5V", nicotine: "3 MG/ML" },
    moments: [{ nom: "Matin", bouffees: 10 }, { nom: "Soir", bouffees: 20 }],
  },
  {
    id: 4, prenom: "Léa", nom: "Martin", pseudo: "leam", email: "lea.martin@mail.fr", genre: "Femme", csp: "Étudiante", dateNaissance: "30/01/2001",
    humeurs: [
      { date: "28 mars", emoji: "😐", manque: 5, note: "Examens stressants" },
      { date: "22 mars", emoji: "😔", manque: 7, note: "Soirée compliquée" },
    ],
    substituts: [
      { heure: "11:00", type: "Inhalateur", contexte: "Stress examen", dosage: "10 mg" },
      { heure: "20:00", type: "Gomme", contexte: "Envie modérée", dosage: "2 mg" },
    ],
    questionnaires: [
      {
        date: "18 mars 2026", score: 5, niveau: "Moyenne", recent: true,
        fagerstrom: "5 - Moyenne", gad4: "7 - Sévère",
        reponses: [
          { question: "Statut tabagique", reponse: "Vapoteur uniquement" },
          { question: "Concentration nicotine", reponse: "9 mg/ml" },
          { question: "Substituts nicotiniques", reponse: "Oui - Inhalateur + Gomme" },
          { question: "Niveau de stress", reponse: "Très élevé" },
          { question: "Gestion du stress", reponse: "Musique" },
        ]
      },
    ],
    historique: [
      { date: "18 mars 2026", type: "Questionnaire", detail: "Score Fagerström : 5 - Moyenne" },
      { date: "10 mars 2026", type: "Moments", detail: "Ajout moment : Nuit (15 bouffées)" },
      { date: "1 mars 2026", type: "Paramètres", detail: "Nicotine : 12 MG/ML → 9 MG/ML" },
    ],
    stats: { momentParJour: 3, dureeMoyenneTaff: "3 sec", tempsSessionMoyen: "10 min" },
    vape: { puissance: "3.2V", nicotine: "9 MG/ML" },
    moments: [{ nom: "Pause cours", bouffees: 25 }, { nom: "Soirée", bouffees: 30 }, { nom: "Nuit", bouffees: 15 }],
  },
  {
    id: 5, prenom: "Sofia", nom: "Rodriguez", pseudo: "sofiar", email: "sofia.rodriguez@mail.fr", genre: "Femme", csp: "Commerçante", dateNaissance: "18/09/1988",
    humeurs: [
      { date: "29 mars", emoji: "😄", manque: 1, note: "" },
      { date: "27 mars", emoji: "😊", manque: 2, note: "Bonne semaine" },
      { date: "23 mars", emoji: "😄", manque: 1, note: "" },
    ],
    substituts: [{ heure: "07:30", type: "Patch", contexte: "Routine matin", dosage: "7 mg" }],
    questionnaires: [
      {
        date: "25 mars 2026", score: 2, niveau: "Faible", recent: true,
        fagerstrom: "2 - Faible", gad4: "2 - Légère",
        reponses: [
          { question: "Statut tabagique", reponse: "En sevrage" },
          { question: "Substituts nicotiniques", reponse: "Oui - Patch 7mg" },
          { question: "Niveau de stress", reponse: "Faible" },
          { question: "Gestion du stress", reponse: "Sport et yoga" },
        ]
      },
    ],
    historique: [
      { date: "25 mars 2026", type: "Questionnaire", detail: "Score Fagerström : 2 - Faible" },
      { date: "15 mars 2026", type: "Paramètres", detail: "Nicotine : 6 MG/ML → 3 MG/ML" },
      { date: "1 mars 2026", type: "Paramètres", detail: "Puissance : 3.2V → 2.8V" },
    ],
    stats: { momentParJour: 2, dureeMoyenneTaff: "2 sec", tempsSessionMoyen: "5 min" },
    vape: { puissance: "2.8V", nicotine: "3 MG/ML" },
    moments: [{ nom: "Réveil", bouffees: 10 }, { nom: "Midi", bouffees: 10 }],
  },
  {
    id: 6, prenom: "Lucas", nom: "Schmidt", pseudo: "lucass", email: "lucas.schmidt@mail.fr", genre: "Homme", csp: "Cadre", dateNaissance: "11/06/1979",
    humeurs: [
      { date: "28 mars", emoji: "😐", manque: 6, note: "" },
      { date: "25 mars", emoji: "😔", manque: 8, note: "Réunion stressante" },
    ],
    substituts: [
      { heure: "08:30", type: "Gomme", contexte: "Avant réunion", dosage: "4 mg" },
      { heure: "12:00", type: "Patch", contexte: "Routine", dosage: "21 mg" },
      { heure: "17:00", type: "Gomme", contexte: "Fin de journée", dosage: "2 mg" },
    ],
    questionnaires: [
      {
        date: "20 mars 2026", score: 6, niveau: "Moyenne", recent: true,
        fagerstrom: "6 - Moyenne", gad4: "6 - Modérée",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur et vapoteur" },
          { question: "Nombre de cigarettes/jour", reponse: "11 à 20" },
          { question: "Concentration nicotine", reponse: "12 mg/ml" },
          { question: "Substituts nicotiniques", reponse: "Oui - Gomme + Patch" },
          { question: "Niveau de stress", reponse: "Élevé" },
          { question: "Gestion du stress", reponse: "Activité sportive" },
        ]
      },
    ],
    historique: [
      { date: "20 mars 2026", type: "Questionnaire", detail: "Score Fagerström : 6 - Moyenne" },
      { date: "12 mars 2026", type: "Paramètres", detail: "Nicotine : 18 MG/ML → 12 MG/ML" },
      { date: "5 mars 2026", type: "Moments", detail: "Ajout moment : Trajet (25 bouffées)" },
      { date: "1 mars 2026", type: "Paramètres", detail: "Puissance : 4.5V → 4.2V" },
    ],
    stats: { momentParJour: 5, dureeMoyenneTaff: "4 sec", tempsSessionMoyen: "18 min" },
    vape: { puissance: "4.2V", nicotine: "12 MG/ML" },
    moments: [{ nom: "Réveil", bouffees: 30 }, { nom: "Trajet", bouffees: 25 }, { nom: "Pause déjeuner", bouffees: 20 }, { nom: "Après-midi", bouffees: 30 }, { nom: "Soirée", bouffees: 40 }],
  },
];

export default function FichePatient() {
  const { id } = useParams();
  const patient = tousLesPatients.find((p) => p.id === parseInt(id)) || tousLesPatients[0];

  const [onglet, setOnglet] = useState("informations");
  const [sousOngletStats, setSousOngletStats] = useState("humeur");
  const [documents, setDocuments] = useState([]);
  const [questOuverts, setQuestOuverts] = useState({});
  const [recommandations, setRecommandations] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [noteTexte, setNoteTexte] = useState("");
  const [showHistorique, setShowHistorique] = useState(false);
  const fileInputRef = useRef(null);

  const handleImport = (e) => {
    const fichiers = Array.from(e.target.files);
    setDocuments([...documents, ...fichiers.map((f) => ({ nom: f.name, type: "import" }))]);
  };

  const toggleQuest = (i) => setQuestOuverts((prev) => ({ ...prev, [i]: !prev[i] }));

  const enregistrerNote = () => {
    if (!noteTexte.trim()) return;
    const date = new Date().toLocaleDateString("fr-FR");
    setDocuments((prev) => [...prev, { nom: `Note consultation ${date}.txt`, type: "note", contenu: noteTexte }]);
    setNoteTexte("");
    setShowNotes(false);
    setOnglet("documents");
  };

  const typeHistoriqueColor = (type) => {
    if (type === "Paramètres") return { bg: "#E8F5EF", color: "#004649" };
    if (type === "Moments") return { bg: "#EEF0FF", color: "#3F51B5" };
    if (type === "Questionnaire") return { bg: "#FDE8C8", color: "#F5A623" };
    return { bg: "#F0F0F0", color: "#888" };
  };

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
          {navItems.map((item) => (
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

        {/* Flèche retour + boutons */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>
            ← {patient.prenom} {patient.nom}
          </Link>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => setShowHistorique(true)} style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
              color: "#1E3A4A", borderRadius: "12px", padding: "10px 20px",
              fontSize: "13px", fontWeight: "600", border: "1.5px solid #B8D8E8", cursor: "pointer",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              🕐 Historique
            </button>
            <button onClick={() => setShowNotes(true)} style={{
              background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)",
              color: "white", borderRadius: "12px", padding: "10px 20px",
              fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer",
              boxShadow: "0 4px 8px rgba(0,70,73,0.3)",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              ✏️ Notes de consultation
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: "2px solid #DFF0EA", marginBottom: "36px", gap: "40px" }}>
          {["informations", "statistiques", "parametres", "recommandations", "documents"].map((o) => {
            const labels = { informations: "Informations", statistiques: "Statistiques", parametres: "Paramètres", recommandations: "Recommandations", documents: "Documents" };
            const actif = onglet === o;
            return (
              <button key={o} onClick={() => setOnglet(o)} style={{
                padding: "12px 0", fontSize: "15px", fontWeight: actif ? "700" : "400",
                color: "#1E3A4A", background: "none", border: "none", cursor: "pointer",
                borderBottom: actif ? "3px solid #004649" : "3px solid transparent", marginBottom: "-2px"
              }}>{labels[o]}</button>
            );
          })}
        </div>

        {/* INFORMATIONS */}
        {onglet === "informations" && (
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "40px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", maxWidth: "700px" }}>
            <p style={{ color: "#004649", fontWeight: "700", fontSize: "17px", marginBottom: "4px" }}>{patient.prenom} {patient.nom}</p>
            <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "24px" }}>Ces informations ne peuvent pas être modifiées</p>
            {[["Prénom", patient.prenom], ["Nom", patient.nom], ["Pseudo", patient.pseudo], ["Email", patient.email], ["Genre", patient.genre], ["Catégorie socio-professionnelle", patient.csp], ["Date de naissance", patient.dateNaissance]].map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F0F0F0" }}>
                <span style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600", minWidth: "220px" }}>{label}</span>
                <span style={{ color: "#1E3A4A", fontSize: "14px" }}>{value}</span>
              </div>
            ))}
            <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginTop: "36px", marginBottom: "16px" }}>📋 Questionnaires</p>
            {patient.questionnaires.map((q, i) => (
              <div key={i} style={{ border: "1.5px solid #F5C842", borderRadius: "16px", padding: "20px", marginBottom: "16px", backgroundColor: "#FFFDF0", boxShadow: "0 2px 8px rgba(245,198,66,0.15)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", cursor: "pointer" }} onClick={() => toggleQuest(i)}>
                  <div style={{ background: "linear-gradient(135deg, #F5A623 0%, #E8920F 100%)", borderRadius: "12px", width: "48px", height: "48px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 8px rgba(245,166,35,0.4)" }}>
                    <span style={{ color: "white", fontWeight: "700", fontSize: "20px" }}>{q.score}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#F5A623", fontWeight: "700", fontSize: "15px" }}>{q.niveau}</span>
                      {q.recent && <span style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "12px" }}>Récent</span>}
                    </div>
                    <p style={{ color: "#aaa", fontSize: "13px" }}>{q.date}</p>
                  </div>
                  <span style={{ color: "#aaa", fontSize: "18px" }}>{questOuverts[i] ? "▲" : "▼"}</span>
                </div>
                {questOuverts[i] && (
                  <div style={{ marginTop: "20px", borderTop: "1px solid #F5E6B0", paddingTop: "20px" }}>
                    <p style={{ fontWeight: "700", color: "#1E3A4A", marginBottom: "12px" }}>📊 Scores</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "14px", color: "#1E3A4A" }}>Fagerström</span>
                      <span style={{ backgroundColor: "#FDE8C8", color: "#F5A623", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600" }}>{q.fagerstrom}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "14px", color: "#1E3A4A" }}>GAD-4 (détresse psy.)</span>
                      <span style={{ backgroundColor: "#EFEFEF", color: "#555", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600" }}>{q.gad4}</span>
                    </div>
                    <p style={{ fontWeight: "700", color: "#1E3A4A", marginBottom: "12px" }}>📝 Réponses</p>
                    {q.reponses.map((r, j) => (
                      <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F5E6B0" }}>
                        <span style={{ fontSize: "13px", color: "#1E3A4A", fontWeight: "500", flex: 1 }}>{r.question}</span>
                        <span style={{ fontSize: "13px", color: "#888", marginLeft: "16px", textAlign: "right" }}>{r.reponse}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* STATISTIQUES */}
        {onglet === "statistiques" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {["Taux de nicotine", "Moments de la semaine", "Nombre de taffs"].map((titre) => (
                <div key={titre} style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#1E3A4A", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>{titre}</p>
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {[
                { label: "Moments par jour", value: patient.stats.momentParJour, icon: "📅" },
                { label: "Durée moyenne d'une taff", value: patient.stats.dureeMoyenneTaff, icon: "⏱️" },
                { label: "Temps de session moyen", value: patient.stats.tempsSessionMoyen, icon: "🕐" },
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
                  {patient.humeurs.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucune entrée d'humeur</p>
                  ) : patient.humeurs.map((h, i) => (
                    <div key={i} style={{ border: "1px solid #F0F0F0", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px" }}>{h.date}</span>
                        <span style={{ fontSize: "28px" }}>{h.emoji}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#E07B39" }}>🔥</span>
                        <span style={{ color: "#888", fontSize: "13px" }}>Manque :</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {Array.from({ length: 10 }, (_, j) => (
                            <div key={j} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: j < h.manque ? "#E07B39" : "#E0E0E0" }} />
                          ))}
                        </div>
                      </div>
                      {h.note && <span style={{ color: "#888", fontSize: "13px", fontStyle: "italic" }}>{h.note}</span>}
                    </div>
                  ))}
                </div>
              )}
              {sousOngletStats === "substituts" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {patient.substituts.length === 0 ? (
                    <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun substitut renseigné</p>
                  ) : patient.substituts.map((s, i) => (
                    <div key={i} style={{ border: "1.5px solid #B8D8E8", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span>🕐</span>
                          <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px" }}>{s.heure}</span>
                        </div>
                        <span style={{ border: "1px solid #B8D8E8", borderRadius: "8px", padding: "4px 14px", fontSize: "13px", color: "#1E3A4A" }}>{s.type}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#888", fontSize: "13px" }}>
                        <span>💬</span><span>{s.contexte}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#1E3A4A", fontSize: "13px", fontWeight: "600" }}>
                        <span>🧪</span><span>{s.dosage}</span>
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
              <div style={{ background: "linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)", borderRadius: "16px", padding: "20px", width: "180px", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <Image src="/vape.png" alt="Vape" width={140} height={200} style={{ objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1, display: "flex", gap: "60px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Puissance</p>
                  <span style={{ fontSize: "28px" }}>⚡</span>
                  <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600" }}>{patient.vape.puissance}</p>
                  <div style={{ width: "8px", height: "120px", background: "linear-gradient(180deg, #004649 0%, #DFF0EA 100%)", borderRadius: "4px" }}></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Nicotine</p>
                  <span style={{ fontSize: "28px" }}>🧪</span>
                  <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600" }}>{patient.vape.nicotine}</p>
                  <div style={{ width: "8px", height: "120px", background: "linear-gradient(180deg, #004649 0%, #DFF0EA 100%)", borderRadius: "4px" }}></div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Plan de sevrage</p>
                  {patient.moments.map((m, i) => (
                    <div key={i} style={{ background: "linear-gradient(135deg, #F5F9F8 0%, #E8F5EF 100%)", border: "1px solid #DFF0EA", borderRadius: "16px", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,70,73,0.08)" }}>
                      <div>
                        <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>{m.nom}</span>
                        <br /><span style={{ color: "#888", fontSize: "13px" }}>Bouffées autorisées</span>
                      </div>
                      <div style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", borderRadius: "12px", padding: "8px 20px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                        <span style={{ color: "white", fontWeight: "700", fontSize: "18px" }}>{m.bouffees}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECOMMANDATIONS */}
        {onglet === "recommandations" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Substituts */}
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "24px" }}>💊 Substituts nicotiniques recommandés</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {[
                  { nom: "Patch", icon: "🩹", doses: ["7 mg", "14 mg", "21 mg"] },
                  { nom: "Gomme", icon: "🟡", doses: ["2 mg", "4 mg"] },
                  { nom: "Pastille", icon: "⚪", doses: ["1 mg", "2 mg"] },
                  { nom: "Inhalateur", icon: "💨", doses: ["10 mg"] },
                  { nom: "Spray nasal", icon: "🌬️", doses: ["0.5 mg"] },
                  { nom: "Comprimé sublingual", icon: "💊", doses: ["2 mg", "4 mg"] },
                ].map((sub) => {
                  const cle = `sub_${sub.nom}`;
                  const selectionne = recommandations[cle];
                  const doseSelectionnee = recommandations[`dose_${sub.nom}`] || "";
                  return (
                    <div key={sub.nom}
                      onClick={() => setRecommandations(prev => ({ ...prev, [cle]: !prev[cle] }))}
                      style={{
                        background: selectionne ? "linear-gradient(135deg, #E8F5EF 0%, #D0EDE0 100%)" : "linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%)",
                        borderRadius: "16px", padding: "20px",
                        border: selectionne ? "2px solid #004649" : "2px solid transparent",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", transition: "all 0.2s ease",
                      }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "22px" }}>{sub.icon}</span>
                        <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>{sub.nom}</span>
                        {selectionne && <span style={{ marginLeft: "auto", color: "#004649", fontSize: "18px" }}>✓</span>}
                      </div>
                      {selectionne && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <p style={{ color: "#888", fontSize: "12px", marginBottom: "8px" }}>Concentration :</p>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {sub.doses.map((dose) => (
                              <button key={dose}
                                onClick={() => setRecommandations(prev => ({ ...prev, [`dose_${sub.nom}`]: dose }))}
                                style={{
                                  padding: "4px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: "600",
                                  border: "none", cursor: "pointer",
                                  background: doseSelectionnee === dose ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)" : "white",
                                  color: doseSelectionnee === dose ? "white" : "#1E3A4A",
                                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}>
                                {dose}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: "24px" }}>
                <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px", marginBottom: "12px" }}>📋 Posologie et instructions</p>
                <textarea
                  value={recommandations.posologie || ""}
                  onChange={(e) => setRecommandations(prev => ({ ...prev, posologie: e.target.value }))}
                  placeholder="Ex: 1 patch 21mg/jour pendant 6 semaines, puis 14mg/jour pendant 2 semaines..."
                  rows={3}
                  style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "none", backgroundColor: "#FAFAFA", boxSizing: "border-box" }}
                />
              </div>
            </div>

            {/* Objectif sevrage */}
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "24px" }}>📅 Objectif de sevrage</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "20px", marginBottom: "20px" }}>
                <div>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", marginBottom: "8px" }}>Date de début souhaitée</p>
                  <input type="date" value={recommandations.dateDebut || ""}
                    onChange={(e) => setRecommandations(prev => ({ ...prev, dateDebut: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#1E3A4A", boxSizing: "border-box" }} />
                </div>
                <div>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", marginBottom: "8px" }}>Durée du programme</p>
                  <select value={recommandations.duree || ""}
                    onChange={(e) => setRecommandations(prev => ({ ...prev, duree: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", outline: "none", color: "#1E3A4A", backgroundColor: "white", boxSizing: "border-box" }}>
                    <option value="">Sélectionner</option>
                    <option value="4 semaines">4 semaines</option>
                    <option value="8 semaines">8 semaines</option>
                    <option value="12 semaines">12 semaines</option>
                    <option value="6 mois">6 mois</option>
                    <option value="1 an">1 an</option>
                  </select>
                </div>
              </div>
              <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "13px", marginBottom: "12px" }}>Objectif de réduction nicotine (mg/ml)</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {["18 → 12", "12 → 9", "9 → 6", "6 → 3", "3 → 0"].map((obj) => (
                  <button key={obj}
                    onClick={() => setRecommandations(prev => ({ ...prev, objectifNicotine: obj }))}
                    style={{
                      padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "600",
                      border: "none", cursor: "pointer",
                      background: recommandations.objectifNicotine === obj
                        ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)"
                        : "linear-gradient(135deg, #f0f4f8 0%, #e8edf2 100%)",
                      color: recommandations.objectifNicotine === obj ? "white" : "#1E3A4A",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}>
                    {obj}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "20px", padding: "32px", boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)" }}>
              <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>📝 Notes et conseils personnalisés</p>
              <textarea
                value={recommandations.notes || ""}
                onChange={(e) => setRecommandations(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Conseils personnalisés, points de vigilance, recommandations complémentaires..."
                rows={4}
                style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "none", backgroundColor: "#FAFAFA", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "12px", padding: "14px 36px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                ✓ Enregistrer les recommandations
              </button>
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        {onglet === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <input type="file" ref={fileInputRef} onChange={handleImport} multiple style={{ display: "none" }} />
              <button onClick={() => fileInputRef.current.click()} style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
                + Importer un document
              </button>
              <button onClick={() => setShowNotes(true)} style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)", color: "#004649", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "1.5px solid #004649", cursor: "pointer" }}>
                ✏️ Nouvelle note
              </button>
            </div>
            {documents.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun document importé</p>
            ) : (
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {documents.map((doc, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "8px", padding: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "28px" }}>{doc.type === "note" ? "📝" : "📄"}</span>
                    </div>
                    <p style={{ color: "#1E3A4A", fontSize: "12px", textAlign: "center", maxWidth: "90px", wordBreak: "break-word" }}>{doc.nom}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal historique */}
      {showHistorique && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "24px", padding: "40px", width: "560px", maxHeight: "80vh", overflow: "auto", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px" }}>🕐 Historique — {patient.prenom} {patient.nom}</h2>
              <button onClick={() => setShowHistorique(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#888" }}>×</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {patient.historique.map((h, i) => {
                const colors = typeHistoriqueColor(h.type);
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "16px", padding: "16px", background: "linear-gradient(135deg, #f8f9fa 0%, #f0f4f8 100%)", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.8)" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: colors.color }} />
                      {i < patient.historique.length - 1 && <div style={{ width: "2px", height: "24px", backgroundColor: "#E0E0E0" }} />}
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
          </div>
        </div>
      )}

      {/* Modal notes */}
      {showNotes && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "24px", padding: "48px", width: "560px", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px" }}>
              ✏️ Notes de consultation — {patient.prenom} {patient.nom}
            </h2>
            <p style={{ color: "#888", fontSize: "13px", marginTop: "-8px" }}>
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            <textarea
              value={noteTexte} onChange={(e) => setNoteTexte(e.target.value)}
              placeholder="Rédigez vos notes de consultation ici..."
              rows={10}
              style={{ border: "1px solid #B8D8E8", borderRadius: "16px", padding: "16px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "none", backgroundColor: "#FAFAFA", lineHeight: "1.6" }}
            />
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
    </div>
  );
}