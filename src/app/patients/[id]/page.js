"use client";
import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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
          { question: "Temps avant 1ère session", reponse: "6-30 minutes" },
          { question: "Difficulté lieux interdits", reponse: "Non" },
          { question: "Session la plus importante", reponse: "Une autre" },
          { question: "Nombre sessions/jour", reponse: "11-20" },
          { question: "Vapote plus le matin", reponse: "Non" },
          { question: "Vapote même malade", reponse: "Non" },
          { question: "Substituts nicotiniques", reponse: "Non" },
          { question: "GAD - Nervosité/anxiété", reponse: "Plusieurs jours" },
          { question: "GAD - Inquiétudes", reponse: "Plusieurs jours" },
          { question: "GAD - Peu d'intérêt", reponse: "Jamais" },
          { question: "GAD - Tristesse", reponse: "Jamais" },
          { question: "Autres addictions", reponse: "Aucune" },
          { question: "Niveau de stress", reponse: "Moyen" },
          { question: "Gestion du stress", reponse: "Méditation" },
        ]
      },
      {
        date: "5 février 2026", score: 6, niveau: "Moyenne", recent: false,
        fagerstrom: "6 - Moyenne", gad4: "5 - Modérée",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur et vapoteur" },
          { question: "Substituts nicotiniques", reponse: "Oui" },
          { question: "Niveau de stress", reponse: "Élevé" },
          { question: "Gestion du stress", reponse: "Activité sportive" },
        ]
      },
      {
        date: "1 novembre 2025", score: 8, niveau: "Élevée", recent: false,
        fagerstrom: "8 - Élevée", gad4: "7 - Sévère",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur uniquement" },
          { question: "Substituts nicotiniques", reponse: "Non" },
          { question: "Niveau de stress", reponse: "Très élevé" },
          { question: "Gestion du stress", reponse: "Aucune" },
        ]
      },
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
          { question: "Fréquence vapotage", reponse: "Régulière" },
          { question: "Concentration nicotine", reponse: "9 mg/ml" },
          { question: "Substituts nicotiniques", reponse: "Oui - Inhalateur + Gomme" },
          { question: "GAD - Nervosité/anxiété", reponse: "Presque tous les jours" },
          { question: "GAD - Inquiétudes", reponse: "Plus de sept jours" },
          { question: "GAD - Peu d'intérêt", reponse: "Plusieurs jours" },
          { question: "GAD - Tristesse", reponse: "Plusieurs jours" },
          { question: "Autres addictions", reponse: "Aucune" },
          { question: "Niveau de stress", reponse: "Très élevé" },
          { question: "Association stress", reponse: "Oui" },
          { question: "Association pauses", reponse: "Oui" },
          { question: "Gestion du stress", reponse: "Musique" },
        ]
      },
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
          { question: "GAD - Nervosité/anxiété", reponse: "Jamais" },
          { question: "GAD - Inquiétudes", reponse: "Jamais" },
          { question: "GAD - Peu d'intérêt", reponse: "Plusieurs jours" },
          { question: "GAD - Tristesse", reponse: "Jamais" },
          { question: "Autres addictions", reponse: "Aucune" },
          { question: "Niveau de stress", reponse: "Faible" },
          { question: "Gestion du stress", reponse: "Sport et yoga" },
        ]
      },
      {
        date: "10 mars 2026", score: 4, niveau: "Moyenne", recent: false,
        fagerstrom: "4 - Moyenne", gad4: "3 - Légère",
        reponses: [
          { question: "Statut tabagique", reponse: "Vapoteur uniquement" },
          { question: "Substituts nicotiniques", reponse: "Oui" },
          { question: "Niveau de stress", reponse: "Moyen" },
          { question: "Gestion du stress", reponse: "Marche" },
        ]
      },
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
          { question: "GAD - Nervosité/anxiété", reponse: "Plus de sept jours" },
          { question: "GAD - Inquiétudes", reponse: "Plusieurs jours" },
          { question: "GAD - Peu d'intérêt", reponse: "Plusieurs jours" },
          { question: "GAD - Tristesse", reponse: "Plusieurs jours" },
          { question: "Autres addictions", reponse: "Aucune" },
          { question: "Niveau de stress", reponse: "Élevé" },
          { question: "Association stress", reponse: "Oui" },
          { question: "Association pauses", reponse: "Oui" },
          { question: "Association café", reponse: "Oui" },
          { question: "Gestion du stress", reponse: "Activité sportive" },
        ]
      },
      {
        date: "15 février 2026", score: 7, niveau: "Élevée", recent: false,
        fagerstrom: "7 - Élevée", gad4: "7 - Sévère",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur uniquement" },
          { question: "Substituts nicotiniques", reponse: "Non" },
          { question: "Niveau de stress", reponse: "Très élevé" },
          { question: "Gestion du stress", reponse: "Aucune" },
        ]
      },
      {
        date: "5 décembre 2025", score: 9, niveau: "Très élevée", recent: false,
        fagerstrom: "9 - Très élevée", gad4: "10 - Sévère",
        reponses: [
          { question: "Statut tabagique", reponse: "Fumeur uniquement" },
          { question: "Autres addictions", reponse: "Alcool" },
          { question: "Niveau de stress", reponse: "Très élevé" },
          { question: "Gestion du stress", reponse: "Aucune" },
        ]
      },
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
  const fileInputRef = useRef(null);

  const handleImport = (e) => {
    const fichiers = Array.from(e.target.files);
    setDocuments([...documents, ...fichiers.map((f) => ({ nom: f.name }))]);
  };

  const toggleQuest = (i) => {
    setQuestOuverts((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const navStyle = {
    background: "linear-gradient(135deg, #C8E6F0 0%, #A8D4E6 100%)",
    padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8" }}>

      {/* Navbar 3D */}
      <nav style={navStyle}>
        <Image src="/logo.png" alt="Rêvade" width={130} height={48} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {[
            { href: "/dashboard", label: "FICHES PATIENTS", actif: true },
            { href: "/forum", label: "FORUM", actif: false },
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

        {/* Flèche retour */}
        <Link href="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px", color: "#1E3A4A", fontWeight: "600", fontSize: "15px", marginBottom: "24px" }}>
          ← {patient.prenom} {patient.nom}
        </Link>

        {/* Onglets */}
        <div style={{ display: "flex", borderBottom: "2px solid #DFF0EA", marginBottom: "36px", gap: "48px" }}>
          {["informations", "statistiques", "parametres", "documents"].map((o) => {
            const labels = { informations: "Informations", statistiques: "Statistiques", parametres: "Paramètres", documents: "Documents" };
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
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "20px", padding: "40px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
            maxWidth: "700px"
          }}>
            <p style={{ color: "#004649", fontWeight: "700", fontSize: "17px", marginBottom: "4px" }}>{patient.prenom} {patient.nom}</p>
            <p style={{ color: "#aaa", fontSize: "13px", marginBottom: "24px" }}>Ces informations ne peuvent pas être modifiées</p>

            {[["Prénom", patient.prenom], ["Nom", patient.nom], ["Pseudo", patient.pseudo], ["Email", patient.email], ["Genre", patient.genre], ["Catégorie socio-professionnelle", patient.csp], ["Date de naissance", patient.dateNaissance]].map(([label, value]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F0F0F0" }}>
                <span style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600", minWidth: "220px" }}>{label}</span>
                <span style={{ color: "#1E3A4A", fontSize: "14px" }}>{value}</span>
              </div>
            ))}

            {/* Questionnaires */}
            <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", marginTop: "36px", marginBottom: "16px" }}>📋 Questionnaires</p>
            {patient.questionnaires.map((q, i) => (
              <div key={i} style={{ border: "1.5px solid #F5C842", borderRadius: "16px", padding: "20px", marginBottom: "16px", backgroundColor: "#FFFDF0", boxShadow: "0 2px 8px rgba(245,198,66,0.15)" }}>

                {/* En-tête questionnaire — toujours replié par défaut */}
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

                {/* Contenu déplié */}
                {questOuverts[i] && (
                  <div style={{ marginTop: "20px", borderTop: "1px solid #F5E6B0", paddingTop: "20px" }}>

                    {/* Scores */}
                    <p style={{ fontWeight: "700", color: "#1E3A4A", marginBottom: "12px" }}>📊 Scores</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <span style={{ fontSize: "14px", color: "#1E3A4A" }}>Fagerström</span>
                      <span style={{ backgroundColor: "#FDE8C8", color: "#F5A623", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600" }}>{q.fagerstrom}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                      <span style={{ fontSize: "14px", color: "#1E3A4A" }}>GAD-4 (détresse psy.)</span>
                      <span style={{ backgroundColor: "#EFEFEF", color: "#555", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", fontWeight: "600" }}>{q.gad4}</span>
                    </div>

                    {/* Toutes les réponses */}
                    <p style={{ fontWeight: "700", color: "#1E3A4A", marginBottom: "12px" }}>📝 Réponses au questionnaire</p>
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

            {/* Graphiques */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
              {["Taux de nicotine", "Moments de la semaine", "Nombre de taffs"].map((titre) => (
                <div key={titre} style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", minHeight: "160px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <p style={{ color: "#1E3A4A", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>{titre}</p>
                </div>
              ))}
            </div>

            {/* Stats chiffrées */}
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

            {/* Journal de bord */}
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
                    <div key={i} style={{ border: "1.5px solid #B8D8E8", borderRadius: "16px", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "16px" }}>🕐</span>
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
              <div style={{ background: "linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%)", borderRadius: "16px", padding: "20px", width: "180px", minHeight: "220px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
                <Image src="/vape.png" alt="Vape" width={140} height={200} style={{ objectFit: "contain" }} />
              </div>
              <div style={{ flex: 1, display: "flex", gap: "60px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Puissance</p>
                  <span style={{ fontSize: "28px" }}>⚡</span>
                  <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600" }}>{patient.vape.puissance}</p>
                  <div style={{ width: "8px", height: "120px", background: "linear-gradient(180deg, #004649 0%, #DFF0EA 100%)", borderRadius: "4px", boxShadow: "0 2px 6px rgba(0,70,73,0.2)" }}></div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Nicotine</p>
                  <span style={{ fontSize: "28px" }}>🧪</span>
                  <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600" }}>{patient.vape.nicotine}</p>
                  <div style={{ width: "8px", height: "120px", background: "linear-gradient(180deg, #004649 0%, #DFF0EA 100%)", borderRadius: "4px", boxShadow: "0 2px 6px rgba(0,70,73,0.2)" }}></div>
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
                  <p style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px" }}>Plan de sevrage</p>
                  {patient.moments.map((m, i) => (
                    <div key={i} style={{ background: "linear-gradient(135deg, #F5F9F8 0%, #E8F5EF 100%)", border: "1px solid #DFF0EA", borderRadius: "16px", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 8px rgba(0,70,73,0.08), inset 0 1px 0 rgba(255,255,255,0.8)" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>{m.nom}</span>
                        <span style={{ color: "#888", fontSize: "13px" }}>Bouffées autorisées</span>
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

        {/* DOCUMENTS */}
        {onglet === "documents" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <input type="file" ref={fileInputRef} onChange={handleImport} multiple style={{ display: "none" }} />
            <button onClick={() => fileInputRef.current.click()} style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "10px 24px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", width: "fit-content", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
              + Importer un document
            </button>
            {documents.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: "14px", fontStyle: "italic" }}>Aucun document importé</p>
            ) : (
              <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                {documents.map((doc, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                    <div style={{ background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)", borderRadius: "8px", padding: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", width: "80px", height: "80px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "#E53935", fontWeight: "700", fontSize: "14px" }}>PDF</span>
                    </div>
                    <p style={{ color: "#1E3A4A", fontSize: "12px", textAlign: "center", maxWidth: "90px", wordBreak: "break-word" }}>{doc.nom}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}