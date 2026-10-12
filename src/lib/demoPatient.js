// Patient fictif pour présenter le logiciel (aucune donnée réelle, rien n'est lu ni écrit en base).
// Ouvrir /patients/demo, ou la carte « Démo » de la page Fiches patients.

export const DEMO_PATIENT_ID = "demo";

export const isDemoPatient = (id) => id === DEMO_PATIENT_ID;

const jour = 24 * 3600 * 1000;
const ilYa = (j, h = 10, m = 0) => {
  const d = new Date(Date.now() - j * jour);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const DEMO_PATIENT = {
  id: DEMO_PATIENT_ID,
  prenom: "Camille",
  nom: "Dupont",
  pseudo: "camille.d",
  genre: "Femme",
  date_naissance: "14/03/1989",
  categorie_socio_pro: "Cadre et profession intellectuelle supérieure",
};

// Plan de sevrage : bouffées autorisées par moment
export const DEMO_MOMENTS = [
  { name: "Réveil", puffs: 8 },
  { name: "Pause café", puffs: 6 },
  { name: "Après le déjeuner", puffs: 6 },
  { name: "Trajet du soir", puffs: 4 },
  { name: "Soirée", puffs: 10 },
];

export const DEMO_QUESTIONNAIRES = [
  {
    id: "q2", date_completion: ilYa(3, 9, 12), score: 4, niveau: "Moyenne",
    reponses: {
      statut_tabagique: "vapoteur",
      vapoteur_concentration: "12", vapoteur_nb_sessions: "1", vapoteur_temps_premiere_session: "2",
      vapoteur_difficulte_lieux_interdits: "0", vapoteur_session_importante: "1", vapoteur_plus_matin: "1", vapoteur_meme_malade: "0",
      score_fagerström_vapoteur: 4, niveau_fagerström_vapoteur: "Moyenne",
      "gad_nervosité": "1", gad_inquietudes: "1", gad_interet: "0", gad_tristesse: "0",
      score_gad4: 2, niveau_gad4: "Légère",
      niveau_stress: "3", association_cafe: "oui", association_stress: "oui",
    },
  },
  {
    id: "q1", date_completion: ilYa(31, 18, 40), score: 7, niveau: "Forte",
    reponses: {
      statut_tabagique: "les_deux",
      fumeur_frequence: "moins_10_jour", fumeur_temps_premiere_cig: "3", fumeur_cig_importante: "1",
      fumeur_plus_matin: "1", fumeur_meme_malade: "1", fumeur_difficulte_lieux_interdits: "1",
      score_fagerström_fumeur: 7, niveau_fagerström_fumeur: "Forte",
      vapoteur_concentration: "18", vapoteur_nb_sessions: "2",
      "gad_nervosité": "2", gad_inquietudes: "2", gad_interet: "1", gad_tristesse: "1",
      score_gad4: 6, niveau_gad4: "Modérée",
      niveau_stress: "4", association_cafe: "oui", association_alcool: "oui", association_stress: "oui", association_pause: "oui",
    },
  },
];

// 14 jours de sessions, en baisse progressive (sevrage en cours)
export const DEMO_SESSIONS = Array.from({ length: 14 }).flatMap((_, j) => {
  const nb = Math.max(4, 11 - Math.floor((13 - j) / 2));
  return Array.from({ length: nb }, (_, k) => ({
    date_debut: ilYa(j, 7 + Math.floor((k * 15) / nb), (k * 17) % 60),
    duree_secondes: 240 + ((j * 37 + k * 53) % 180),
    nombre_bouffees: 6 + ((j + k) % 6),
    nicotine: j < 7 ? 9 : 12,
  }));
}).sort((a, b) => new Date(b.date_debut) - new Date(a.date_debut));

export const DEMO_PUFFS = DEMO_SESSIONS.slice(0, 60).map((s, i) => ({
  date_time: s.date_debut,
  duration_ms: 2100 + ((i * 137) % 1400),
  nicotine: s.nicotine,
}));

export const DEMO_JOURNAL = [
  { date: ilYa(0), mood: "🙂", craving: 3, notes: "Bonne journée, j'ai tenu le plan au réveil." },
  { date: ilYa(1), mood: "😐", craving: 5, notes: "Réunion stressante, envie forte vers 16 h." },
  { date: ilYa(2), mood: "🙂", craving: 4 },
  { date: ilYa(4), mood: "😣", craving: 7, notes: "Soirée entre amis, difficile de ne pas dépasser." },
  { date: ilYa(6), mood: "😊", craving: 2, notes: "Première journée sous les 6 sessions !" },
];

export const DEMO_SUBSTITUTS = [
  { date: ilYa(0, 8, 15), forme: "Patch 24h", moment: "Matin", dosage: 14 },
  { date: ilYa(1, 16, 5), forme: "Gomme", moment: "Pause café", dosage: 2 },
  { date: ilYa(1, 8, 10), forme: "Patch 24h", moment: "Matin", dosage: 14 },
  { date: ilYa(2, 21, 30), forme: "Pastilles", moment: "Soirée", dosage: 1 },
];

export const DEMO_APPOINTMENTS = [
  { id: "r1", date_rdv: ilYa(-7, 14, 30), statut: "confirme", notes: "Point d'étape à 1 mois" },
  { id: "r2", date_rdv: ilYa(17, 10, 0), statut: "confirme", notes: "Consultation initiale" },
];

export const DEMO_RECOMMANDATIONS = {
  objectif_sevrage: "Réduction progressive",
  motivations_arret: ["sante", "finances", "sport"],
  barrieres_arret: "Stress professionnel, association forte café / vape le matin, soirées entre amis.",
  notes: "Poursuivre la réduction de 1 session par semaine. Abaisser la nicotine à 6 mg/ml dans 3 semaines. Travailler la gestion du stress (cohérence cardiaque) pour les envies de l'après-midi.",
  tsn_patch_24h: true, tsn_dose_patch_24h: "14 mg/24h",
  tsn_gomme: true, tsn_dose_gomme: "2 mg",
  posologie: "1 patch 14 mg/24h le matin + gomme 2 mg à la demande (max 10/jour) pendant 8 semaines, puis réévaluation.",
  duree: "12 semaines",
  dateControle: new Date(Date.now() + 7 * jour).toISOString().slice(0, 10),
};

export const DEMO_DOCUMENTS = [
  { id: "demo_doc_1", nom: `Ordonnance TSN — ${new Date(Date.now() - 17 * jour).toLocaleDateString("fr-FR")}`, type: "ordonnance", file_url: null },
  { id: "demo_doc_2", nom: `Note de consultation — ${new Date(Date.now() - 17 * jour).toLocaleDateString("fr-FR")}`, type: "note", file_url: null },
  { id: "demo_doc_3", nom: `Note de consultation — ${new Date(Date.now() - 3 * jour).toLocaleDateString("fr-FR")}`, type: "note", file_url: null },
];

export const DEMO_MESSAGES = [
  { id: "m1", sender_type: "pro", content: "Bonjour Camille, comment se passe cette première semaine avec le nouveau plan ?", created_at: ilYa(5, 9, 2) },
  { id: "m2", sender_type: "patient", content: "Bonjour ! Plutôt bien, le matin c'est encore compliqué avec le café mais je tiens les 8 bouffées.", created_at: ilYa(5, 12, 41) },
  { id: "m3", sender_type: "pro", content: "C'est très encourageant 👏 Essayez de décaler la première session après le café, on en reparle à notre prochain rendez-vous.", created_at: ilYa(5, 13, 5) },
  { id: "m4", sender_type: "patient", content: "Ok je vais essayer, merci !", created_at: ilYa(4, 8, 30) },
];
