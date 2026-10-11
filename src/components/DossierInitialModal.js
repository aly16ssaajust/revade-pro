"use client";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

const S = { color: "#E65100", fontWeight: "600" }; // style champ obligatoire

const SECTIONS = [
  { id: "tabagisme", label: "1. Tabagisme", icon: "🚬" },
  { id: "medical", label: "2. Données médicales", icon: "⚕️" },
  { id: "dependance", label: "3. Dépendance & Stress", icon: "🧠" },
  { id: "had", label: "4. Test HAD", icon: "📋" },
  { id: "addictions", label: "5. Co-addictions & Fagerström", icon: "📊" },
  { id: "situation", label: "6. Situation actuelle", icon: "📍" },
  { id: "motivation", label: "7. Motivation", icon: "⭐" },
];

const INIT = {
  fumeur_occasionnel: false, fumeur_regulier: false, tentative_arret: false,
  cig_manufacturees: "", cig_roulees: "", cigarillos: "",
  cigare: false, pipe: false, tabac_autre: "",
  date_arret_decide: "", date_arret: "",
  vapoteur: "", vape_concentration: "", vape_quantite: "",
  assoc_alcool: false, assoc_cafe: false, assoc_convivialite: false,
  assoc_repas: false, assoc_aperitif: false, assoc_ennui: false,
  assoc_concentration: false, assoc_stress_anticipe: false,
  assoc_emotion: false, assoc_poids: false,
  poids: "", taille: "",
  patho_aucune: false, patho_coeur: false, patho_coeur_detail: "",
  patho_respi: false, patho_respi_detail: "",
  patho_psy: false, patho_psy_detail: "",
  patho_depression: false, patho_anxiete: false, patho_diabete: false, patho_autre: "",
  grossesse: "", terme: "", tca: "",
  stress_travail: false, stress_famille: false, stress_sentimental: false,
  stress_quotidien: false, stress_autre: "",
  stress_intensite: "",
  stress_physique: false, stress_artistique: false,
  stress_intellectuel: false, stress_relaxation: false, stress_gestion_autre: "",
  outil_minirelax: false, outil_physique: false, outil_etirements: false,
  outil_endroit: false, outil_parler: false, outil_autre: "",
  had_q1: "", had_q2: "", had_q3: "", had_q4: "", had_q5: "",
  had_q6: "", had_q7: "", had_q8: "", had_q9: "", had_q10: "",
  had_q11: "", had_q12: "", had_q13: "", had_q14: "",
  co_alcool: "", co_medicament: "", co_alimentation: "", co_cannabis: "",
  co_drogues: "", co_internet: "", co_autre_addictions: "",
  fag_q1: "", fag_q2: "", fag_q3: "", fag_q4: "", fag_q5: "", fag_q6: "",
  nf_date: "", arret_seul: "", reduction: "",
  tsn_p7_24: false, tsn_p14_24: false, tsn_p21_24: false,
  tsn_p10_16: false, tsn_p15_16: false, tsn_p25_16: false, tsn_patch_autre: "",
  tsn_g2: false, tsn_g4: false,
  tsn_past1: false, tsn_past1_5: false, tsn_past2: false, tsn_past2_5: false,
  tsn_spray: false, med_varenicline: false,
  tcc: "", vape_actuelle: "", vape_nicotine: "", vape_dosage: "",
  alt_homeopathie: false, alt_hypnose: false, alt_acupuncture: false,
  alt_laser: false, alt_autre: "",
  rollnick_confiance: "", rollnick_importance: "",
  bilan_gains: "", bilan_pertes: "",
  motiv_sante: false, motiv_prix: false, motiv_entourage: false, motiv_autre: "",
  craintes: "", difficultes: "", compensation_alimentaire: "",
};

const HAD_QS = [
  { n: 1, t: "A", q: "Je me sens tendu(e) ou énervé(e)", opts: [["La plupart du temps","3"],["Souvent","2"],["De temps en temps","1"],["Jamais","0"]] },
  { n: 2, t: "D", q: "Je prends plaisir aux mêmes choses qu'autrefois", opts: [["Oui, tout autant","0"],["Pas autant","1"],["Un peu seulement","2"],["Presque plus","3"]] },
  { n: 3, t: "A", q: "J'ai une sensation de peur comme si quelque chose d'horrible allait m'arriver", opts: [["Oui, très nettement","3"],["Oui, mais pas trop grave","2"],["Un peu, mais ça ne m'inquiète pas","1"],["Pas du tout","0"]] },
  { n: 4, t: "D", q: "Je ris facilement et vois le bon côté des choses", opts: [["Autant que par le passé","0"],["Plus autant qu'avant","1"],["Vraiment moins qu'avant","2"],["Plus du tout","3"]] },
  { n: 5, t: "A", q: "Je me fais du souci", opts: [["Très souvent","3"],["Assez souvent","2"],["Occasionnellement","1"],["Très occasionnellement","0"]] },
  { n: 6, t: "D", q: "Je suis de bonne humeur", opts: [["Jamais","3"],["Rarement","2"],["Assez souvent","1"],["La plupart du temps","0"]] },
  { n: 7, t: "A", q: "Je peux rester tranquillement assis(e) à ne rien faire et me sentir décontracté(e)", opts: [["Oui, quoi qu'il arrive","0"],["Oui, en général","1"],["Rarement","2"],["Jamais","3"]] },
  { n: 8, t: "D", q: "J'ai l'impression de fonctionner au ralenti", opts: [["Presque toujours","3"],["Très souvent","2"],["Parfois","1"],["Jamais","0"]] },
  { n: 9, t: "A", q: "J'éprouve des sensations de peur et j'ai l'estomac noué", opts: [["Jamais","0"],["Parfois","1"],["Assez souvent","2"],["Très souvent","3"]] },
  { n: 10, t: "D", q: "Je ne m'intéresse plus à mon apparence", opts: [["Plus du tout","3"],["Je n'y accorde pas autant d'attention que je devrais","2"],["Il se peut que je n'y fasse plus autant attention","1"],["J'y prête autant d'attention que par le passé","0"]] },
  { n: 11, t: "A", q: "J'ai la bougeotte et n'arrive pas à tenir en place", opts: [["Oui, c'est tout à fait le cas","3"],["Un peu","2"],["Pas tellement","1"],["Pas du tout","0"]] },
  { n: 12, t: "D", q: "Je me réjouis d'avance à l'idée de faire certaines choses", opts: [["Autant qu'avant","0"],["Un peu moins qu'avant","1"],["Bien moins qu'avant","2"],["Presque jamais","3"]] },
  { n: 13, t: "A", q: "J'éprouve des sensations soudaines de panique", opts: [["Vraiment très souvent","3"],["Assez souvent","2"],["Pas très souvent","1"],["Jamais","0"]] },
  { n: 14, t: "D", q: "Je peux prendre plaisir à un bon livre ou à une bonne émission de radio ou télévision", opts: [["Souvent","0"],["Parfois","1"],["Rarement","2"],["Très rarement","3"]] },
];

const FAG_QS = [
  { id: "q1", q: "Combien de temps après le réveil fumez-vous votre première cigarette ?", opts: [["Plus de 60 minutes","0"],["De 31 à 60 minutes","1"],["De 6 à 30 minutes","2"],["Dans les 5 minutes","3"]] },
  { id: "q2", q: "Trouvez-vous difficile de ne pas fumer dans les endroits interdits ?", opts: [["Non","0"],["Oui","1"]] },
  { id: "q3", q: "À quelle cigarette renonceriez-vous le plus difficilement ?", opts: [["À une au cours de la journée","0"],["À la première de la journée","1"]] },
  { id: "q4", q: "Combien de cigarettes fumez-vous par jour en moyenne ?", opts: [["10 ou moins","0"],["De 11 à 20","1"],["De 21 à 30","2"],["Plus de 30","3"]] },
  { id: "q5", q: "Fumez-vous à intervalles plus rapprochés durant les premières heures de la matinée ?", opts: [["Non","0"],["Oui","1"]] },
  { id: "q6", q: "Fumez-vous lorsque vous êtes malade au point de rester au lit presque toute la journée ?", opts: [["Non","0"],["Oui","1"]] },
];

const CO_ITEMS = [
  { key: "co_alcool", label: "Alcool" },
  { key: "co_medicament", label: "Médicament" },
  { key: "co_alimentation", label: "Alimentation" },
  { key: "co_cannabis", label: "Cannabis/CBD" },
  { key: "co_drogues", label: "Autres drogues illicites" },
  { key: "co_internet", label: "Internet / Jeux vidéos / Jeux d'argent" },
  { key: "co_autre_addictions", label: "Autre" },
];

const inputStyle = {
  width: "100%", border: "1px solid #B7D7E8", borderRadius: "10px",
  padding: "10px 14px", fontSize: "14px", color: "#2A3F4F", outline: "none",
  backgroundColor: "#FAFAFA", boxSizing: "border-box",
};
const textareaStyle = { ...inputStyle, resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" };
const labelStyle = { color: "#2A3F4F", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "6px" };
const sectionStyle = { display: "flex", flexDirection: "column", gap: "20px" };
const rowStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" };

function CB({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", padding: "8px 12px", borderRadius: "10px", background: checked ? "#E8F5EF" : "#F8FAFC", border: `1.5px solid ${checked ? "#004649" : "#E4ECF2"}`, transition: "all 0.12s" }}>
      <div style={{ width: "18px", height: "18px", borderRadius: "5px", background: checked ? "#004649" : "white", border: `2px solid ${checked ? "#004649" : "#B7D7E8"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span style={{ fontSize: "13px", color: "#2A3F4F", fontWeight: checked ? "600" : "400" }}>{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

function RadioGroup({ value, onChange, options, label, required }) {
  return (
    <div>
      {label && <p style={{ ...labelStyle, marginBottom: "10px" }}>{label}{required && <span style={S}> *</span>}</p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {options.map(([lbl, val]) => (
          <button key={val} type="button" onClick={() => onChange(val)}
            style={{ padding: "7px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer",
              background: value === val ? "linear-gradient(135deg,#004649, #00363A)" : "linear-gradient(135deg,#EAF3F8,#e8edf2)",
              color: value === val ? "white" : "#2A3F4F" }}>
            {lbl}
          </button>
        ))}
      </div>
    </div>
  );
}

function Select({ value, onChange, label, required, children }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}{required && <span style={S}> *</span>}</label>}
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, backgroundColor: "white" }}>
        {children}
      </select>
    </div>
  );
}

function QtySelect({ value, onChange, label }) {
  return (
    <Select value={value} onChange={onChange} label={label}>
      <option value="">— Non concerné</option>
      <option>10 ou moins</option>
      <option>11 à 20</option>
      <option>21 à 30</option>
      <option>31 ou plus</option>
    </Select>
  );
}

function hadLevel(score) {
  if (score === null) return "";
  if (score <= 7) return "Absence de symptomatologie";
  if (score <= 10) return "Symptomatologie douteuse";
  return "Symptomatologie certaine";
}

function fagLevel(score) {
  if (score <= 1) return "Dépendance faible";
  if (score <= 3) return "Dépendance modérée";
  return "Dépendance forte à très forte";
}

// Extrait les données app du dernier questionnaire pour pré-remplissage
function prefillFromQuestionnaire(reponses) {
  if (!reponses) return {};
  const r = typeof reponses === "string" ? JSON.parse(reponses) : reponses;
  const statut = r.statut_tabagique || "";
  return {
    fumeur_occasionnel: statut === "fumeur" && r.fumeur_frequence === "occasionnel",
    fumeur_regulier: statut === "fumeur" && r.fumeur_frequence !== "occasionnel",
    tentative_arret: statut === "ex-fumeur",
    vapoteur: statut === "vapoteur" || statut === "les_deux" ? "oui" : statut === "non-fumeur" ? "non" : "",
    vape_concentration: r.vapoteur_concentration ? String(r.vapoteur_concentration) : "",
    assoc_alcool: !!(r.association_alcool),
    assoc_cafe: !!(r.association_cafe),
    assoc_convivialite: !!(r.association_convivialite),
    assoc_repas: !!(r.association_pause),
    assoc_concentration: !!(r.association_reflexion),
    assoc_stress_anticipe: !!(r.association_stress),
    assoc_emotion: !!(r.association_humeur),
    stress_intensite: r.niveau_stress ? String(parseInt(r.niveau_stress) * 2) : "",
  };
}

export default function DossierInitialModal({ open, onClose, patient, pro, patientId, questionnaires = [], onSaved }) {
  const [section, setSection] = useState("tabagisme");
  const [d, setD] = useState(INIT);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const nomComplet = `${patient?.prenom || ""} ${patient?.nom || ""}`.trim();

  // Données app du dernier questionnaire (lecture seule)
  const appData = useMemo(() => {
    if (!questionnaires?.length) return null;
    const q = questionnaires[0];
    const r = typeof q.reponses === "string" ? JSON.parse(q.reponses) : (q.reponses || {});
    return {
      statut: r.statut_tabagique,
      fag_score: r.score_fagerström_fumeur ?? r.score_fagerström_vapoteur,
      fag_niveau: r.niveau_fagerström_fumeur ?? r.niveau_fagerström_vapoteur,
      gad_score: r.score_gad4,
      gad_niveau: r.niveau_gad4,
      nb_cig: r.fumeur_nb_cigarettes,
      concentration: r.vapoteur_concentration,
      stress: r.niveau_stress,
      date: q.date_completion,
      reponses: r,
    };
  }, [questionnaires]);

  // Charger dossier existant, ou pré-remplir depuis questionnaire
  useEffect(() => {
    if (!open || !patientId || !pro?.id || loaded) return;
    supabase.from("patient_dossiers")
      .select("data")
      .eq("patient_id", patientId)
      .eq("pro_id", pro.id)
      .eq("type", "initial")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.data) {
          setD({ ...INIT, ...data.data });
        } else if (questionnaires?.length) {
          const prefill = prefillFromQuestionnaire(questionnaires[0].reponses);
          setD({ ...INIT, ...prefill });
        }
        setLoaded(true);
      });
  }, [open, patientId, pro, loaded, questionnaires]);

  function upd(key, val) { setD(prev => ({ ...prev, [key]: val })); }
  function tog(key) { setD(prev => ({ ...prev, [key]: !prev[key] })); }

  const imc = useMemo(() => {
    const p = parseFloat(d.poids), t = parseFloat(d.taille) / 100;
    if (!p || !t || t <= 0) return null;
    return (p / (t * t)).toFixed(1);
  }, [d.poids, d.taille]);

  const hadScoreA = useMemo(() => {
    const qs = [d.had_q1, d.had_q3, d.had_q5, d.had_q7, d.had_q9, d.had_q11, d.had_q13];
    if (qs.some(v => v === "")) return null;
    return qs.reduce((s, v) => s + parseInt(v), 0);
  }, [d.had_q1, d.had_q3, d.had_q5, d.had_q7, d.had_q9, d.had_q11, d.had_q13]);

  const hadScoreD = useMemo(() => {
    const qs = [d.had_q2, d.had_q4, d.had_q6, d.had_q8, d.had_q10, d.had_q12, d.had_q14];
    if (qs.some(v => v === "")) return null;
    return qs.reduce((s, v) => s + parseInt(v), 0);
  }, [d.had_q2, d.had_q4, d.had_q6, d.had_q8, d.had_q10, d.had_q12, d.had_q14]);

  const fagScore = useMemo(() => {
    const qs = [d.fag_q1, d.fag_q2, d.fag_q3, d.fag_q4, d.fag_q5, d.fag_q6];
    if (qs.some(v => v === "")) return null;
    return qs.reduce((s, v) => s + parseInt(v), 0);
  }, [d.fag_q1, d.fag_q2, d.fag_q3, d.fag_q4, d.fag_q5, d.fag_q6]);

  async function save() {
    setSaving(true);
    const payload = { ...d };
    if (imc) payload._imc = imc;
    if (hadScoreA !== null) payload._had_A = hadScoreA;
    if (hadScoreD !== null) payload._had_D = hadScoreD;
    if (fagScore !== null) payload._fagerström = fagScore;

    const { error } = await supabase.from("patient_dossiers").upsert(
      { patient_id: patientId, pro_id: pro.id, type: "initial", data: payload, updated_at: new Date().toISOString() },
      { onConflict: "patient_id,pro_id,type" }
    );
    setSaving(false);
    if (error) { showToast("Erreur lors de la sauvegarde", "error"); return; }
    showToast("Dossier enregistré");
    if (onSaved) onSaved();
    onClose();
  }

  const sectionIdx = SECTIONS.findIndex(s => s.id === section);

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", display: "flex", alignItems: "stretch", justifyContent: "center", zIndex: 400, padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", width: "100%", maxWidth: "920px", display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.2)", maxHeight: "100%" }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#004649, #00363A)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div>
            <h2 style={{ color: "white", fontWeight: "700", fontSize: "18px", margin: 0 }}>📋 Dossier consultation initiale de bilan</h2>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px", margin: "4px 0 0 0" }}>{nomComplet} — champs <span style={{ color: "#FFD54F" }}>*</span> obligatoires</p>
          </div>
          <button onClick={onClose} style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", color: "white", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        {/* Section navigation */}
        <div style={{ display: "flex", borderBottom: "2px solid #EAF3F8", overflowX: "auto", flexShrink: 0, backgroundColor: "#FAFBFC" }}>
          {SECTIONS.map((s, i) => {
            const actif = s.id === section;
            return (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{ padding: "12px 16px", fontSize: "12px", fontWeight: actif ? "700" : "500", color: actif ? "#004649" : "#90A4AE",
                  background: "none", border: "none", cursor: "pointer", whiteSpace: "nowrap",
                  borderBottom: actif ? "3px solid #004649" : "3px solid transparent", marginBottom: "-2px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>{s.icon}</span> {s.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", backgroundColor: "#F4F8FB" }}>

          {/* ── SECTION 1 : TABAGISME ── */}
          {section === "tabagisme" && (
            <div style={sectionStyle}>
              {/* Données issues de l'app Rêvade */}
              {appData && (
                <div style={{ background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", borderRadius: "16px", padding: "18px 22px", border: "1.5px solid #A5C9B9" }}>
                  <p style={{ fontWeight: "700", color: "#004649", fontSize: "13px", marginBottom: "10px" }}>📱 Données Rêvade — dernier questionnaire ({appData.date ? new Date(appData.date).toLocaleDateString("fr-FR") : ""})</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {appData.statut && <span style={{ background: "white", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", color: "#2A3F4F", fontWeight: "600" }}>Statut : {appData.statut}</span>}
                    {appData.nb_cig != null && <span style={{ background: "white", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", color: "#2A3F4F" }}>Cig/j : {appData.nb_cig}</span>}
                    {appData.concentration != null && <span style={{ background: "white", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", color: "#2A3F4F" }}>Nicotine vape : {appData.concentration} mg/ml</span>}
                    {appData.fag_score != null && <span style={{ background: "white", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", color: "#2A3F4F" }}>Fagerström app : {appData.fag_score} — {appData.fag_niveau}</span>}
                    {appData.gad_score != null && <span style={{ background: "white", borderRadius: "8px", padding: "4px 12px", fontSize: "13px", color: "#2A3F4F" }}>GAD-4 app : {appData.gad_score} — {appData.gad_niveau}</span>}
                  </div>
                  <p style={{ color: "#5A6B72", fontSize: "12px", marginTop: "8px" }}>Ces données sont pré-remplies automatiquement. Vous pouvez les compléter ou les corriger ci-dessous.</p>
                </div>
              )}
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "14px" }}>Statut tabagique <span style={S}>*</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CB checked={d.fumeur_occasionnel} onChange={() => tog("fumeur_occasionnel")} label="Fumeur occasionnel (moins d'une cigarette/jour)" />
                  <CB checked={d.fumeur_regulier} onChange={() => tog("fumeur_regulier")} label="Fumeur régulier" />
                  <CB checked={d.tentative_arret} onChange={() => tog("tentative_arret")} label="En tentative d'arrêt" />
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Consommation journalière</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <QtySelect value={d.cig_manufacturees} onChange={v => upd("cig_manufacturees", v)} label="Cigarettes manufacturées" />
                  <QtySelect value={d.cig_roulees} onChange={v => upd("cig_roulees", v)} label="Cigarettes roulées ou tubées" />
                  <QtySelect value={d.cigarillos} onChange={v => upd("cigarillos", v)} label="Cigarillos" />
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <label style={labelStyle}>Autres</label>
                    <CB checked={d.cigare} onChange={() => tog("cigare")} label="Cigare" />
                    <CB checked={d.pipe} onChange={() => tog("pipe")} label="Pipe" />
                  </div>
                </div>
                <div style={{ marginTop: "12px" }}>
                  <label style={labelStyle}>Autre (préciser)</label>
                  <input value={d.tabac_autre} onChange={e => upd("tabac_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Date d'arrêt prévue</p>
                <RadioGroup value={d.date_arret_decide} onChange={v => upd("date_arret_decide", v)} label="Avez-vous décidé d'une date d'arrêt ?" required
                  options={[["Oui","oui"],["Non","non"]]} />
                {d.date_arret_decide === "oui" && (
                  <div style={{ marginTop: "14px" }}>
                    <label style={labelStyle}>Date d'arrêt prévue</label>
                    <input type="date" value={d.date_arret} onChange={e => upd("date_arret", e.target.value)} style={inputStyle} />
                  </div>
                )}
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Vapotage</p>
                <RadioGroup value={d.vapoteur} onChange={v => upd("vapoteur", v)} label="Êtes-vous vapoteur ?" required
                  options={[["Oui","oui"],["Non","non"]]} />
                {d.vapoteur === "oui" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
                    <div>
                      <label style={labelStyle}>Concentration en nicotine (mg/ml)</label>
                      <input value={d.vape_concentration} onChange={e => upd("vape_concentration", e.target.value)} placeholder="Ex : 6" style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Quantité / jour (ml)</label>
                      <input value={d.vape_quantite} onChange={e => upd("vape_quantite", e.target.value)} placeholder="Ex : 3" style={inputStyle} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SECTION 2 : DONNÉES MÉDICALES ── */}
          {section === "medical" && (
            <div style={sectionStyle}>
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Données anthropométriques</p>
                <div style={rowStyle}>
                  <div>
                    <label style={labelStyle}>Poids (kg) <span style={S}>*</span></label>
                    <input type="number" value={d.poids} onChange={e => upd("poids", e.target.value)} placeholder="Ex : 70" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Taille (cm) <span style={S}>*</span></label>
                    <input type="number" value={d.taille} onChange={e => upd("taille", e.target.value)} placeholder="Ex : 170" style={inputStyle} />
                  </div>
                </div>
                {imc && (
                  <div style={{ marginTop: "14px", background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ fontSize: "24px", fontWeight: "800", color: "#004649" }}>IMC : {imc}</span>
                    <span style={{ fontSize: "13px", color: "#2E7D32" }}>{parseFloat(imc) < 18.5 ? "Insuffisance pondérale" : parseFloat(imc) < 25 ? "Poids normal" : parseFloat(imc) < 30 ? "Surpoids" : "Obésité"}</span>
                  </div>
                )}
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "14px" }}>Pathologies <span style={S}>*</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <CB checked={d.patho_aucune} onChange={() => tog("patho_aucune")} label="Aucune" />
                  <CB checked={d.patho_coeur} onChange={() => tog("patho_coeur")} label="Maladie du cœur / vaisseaux" />
                  {d.patho_coeur && <input value={d.patho_coeur_detail} onChange={e => upd("patho_coeur_detail", e.target.value)} placeholder="Préciser..." style={{ ...inputStyle, marginLeft: "28px", width: "calc(100% - 28px)" }} />}
                  <CB checked={d.patho_respi} onChange={() => tog("patho_respi")} label="Maladie respiratoire / Asthme" />
                  {d.patho_respi && <input value={d.patho_respi_detail} onChange={e => upd("patho_respi_detail", e.target.value)} placeholder="Préciser..." style={{ ...inputStyle, marginLeft: "28px", width: "calc(100% - 28px)" }} />}
                  <CB checked={d.patho_psy} onChange={() => tog("patho_psy")} label="Pathologies psychiatriques / psychologiques" />
                  {d.patho_psy && <input value={d.patho_psy_detail} onChange={e => upd("patho_psy_detail", e.target.value)} placeholder="Préciser..." style={{ ...inputStyle, marginLeft: "28px", width: "calc(100% - 28px)" }} />}
                  <CB checked={d.patho_depression} onChange={() => tog("patho_depression")} label="Dépression" />
                  <CB checked={d.patho_anxiete} onChange={() => tog("patho_anxiete")} label="Troubles anxieux" />
                  <CB checked={d.patho_diabete} onChange={() => tog("patho_diabete")} label="Diabète" />
                  <div style={{ marginTop: "4px" }}>
                    <label style={labelStyle}>Autre</label>
                    <input value={d.patho_autre} onChange={e => upd("patho_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <RadioGroup value={d.grossesse} onChange={v => upd("grossesse", v)} label="Grossesse en cours ?" required
                    options={[["Oui","oui"],["Non","non"]]} />
                  {d.grossesse === "oui" && (
                    <div>
                      <label style={labelStyle}>Terme (semaines)</label>
                      <input value={d.terme} onChange={e => upd("terme", e.target.value)} placeholder="Ex : 24 SA" style={inputStyle} />
                    </div>
                  )}
                  <RadioGroup value={d.tca} onChange={v => upd("tca", v)} label="Possibilité de TCA ou antécédents de TCA ?" required
                    options={[["Oui","oui"],["Non","non"]]} />
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 3 : DÉPENDANCE & STRESS ── */}
          {section === "dependance" && (
            <div style={sectionStyle}>
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "14px" }}>Dépendance psycho-comportementale <span style={S}>*</span></p>
                <p style={{ color: "#90A4AE", fontSize: "13px", marginBottom: "14px" }}>Fumer / vapoter avec ou pour :</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    ["assoc_alcool","Alcool"], ["assoc_cafe","Café"], ["assoc_convivialite","Convivialité"],
                    ["assoc_repas","Après les repas"], ["assoc_aperitif","Apéritif"], ["assoc_ennui","Gérer l'ennui"],
                    ["assoc_concentration","Concentration / stimulation"], ["assoc_stress_anticipe","Anticipation d'une situation stressante"],
                    ["assoc_emotion","Gestion d'une émotion (positive/négative)"], ["assoc_poids","Gestion du poids"],
                  ].map(([key, label]) => (
                    <CB key={key} checked={d[key]} onChange={() => tog(key)} label={label} />
                  ))}
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "14px" }}>Entretien de stress</p>
                <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", marginBottom: "10px" }}>Qu'est-ce qui déclenche votre stress ? <span style={S}>*</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {[["stress_travail","Le travail"],["stress_famille","La famille"],["stress_sentimental","La vie sentimentale"],["stress_quotidien","La vie quotidienne"]].map(([k,l]) => (
                    <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />
                  ))}
                  <div>
                    <label style={labelStyle}>Autre</label>
                    <input value={d.stress_autre} onChange={e => upd("stress_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Intensité du stress (0 = aucun, 10 = maximal) <span style={S}>*</span></label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input type="range" min="0" max="10" value={d.stress_intensite || 0}
                      onChange={e => upd("stress_intensite", e.target.value)}
                      style={{ flex: 1, accentColor: "#004649" }} />
                    <span style={{ fontWeight: "700", fontSize: "18px", color: "#004649", minWidth: "28px", textAlign: "center" }}>{d.stress_intensite || 0}</span>
                  </div>
                </div>

                <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", marginBottom: "10px" }}>Activités pour gérer le stress <span style={S}>*</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {[["stress_physique","Activité physique"],["stress_artistique","Activité artistique ou manuelle"],["stress_intellectuel","Activité intellectuelle"],["stress_relaxation","Relaxation (yoga, sophrologie...)"]].map(([k,l]) => (
                    <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />
                  ))}
                  <div>
                    <label style={labelStyle}>Autre</label>
                    <input value={d.stress_gestion_autre} onChange={e => upd("stress_gestion_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                  </div>
                </div>

                <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", marginBottom: "10px" }}>Outils de gestion du stress proposés</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[["outil_minirelax","Mini relaxation : cohérence cardiaque, respiration abdominale..."],["outil_physique","Activité physique"],["outil_etirements","Techniques corporelles : étirements"],["outil_endroit","Changer d'endroit"],["outil_parler","Parler à un tiers"]].map(([k,l]) => (
                    <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />
                  ))}
                  <div>
                    <label style={labelStyle}>Autre</label>
                    <input value={d.outil_autre} onChange={e => upd("outil_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 4 : HAD ── */}
          {section === "had" && (
            <div style={sectionStyle}>
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "6px" }}>Évaluation anxiété / dépression — Test HAD <span style={S}>*</span></p>
                <p style={{ color: "#90A4AE", fontSize: "13px", marginBottom: "20px" }}>14 questions — toutes obligatoires pour le calcul automatique des scores</p>

                {HAD_QS.map(({ n, t, q, opts }) => (
                  <div key={n} style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #EAF3F8" }}>
                    <p style={{ color: "#2A3F4F", fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>
                      <span style={{ background: t === "A" ? "#E3F2FD" : "#FFF3E0", color: t === "A" ? "#1565C0" : "#E65100", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "700", marginRight: "8px" }}>{t}</span>
                      {n}. {q}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {opts.map(([lbl, val]) => {
                        const key = `had_q${n}`;
                        const sel = d[key] === val;
                        return (
                          <button key={val} type="button" onClick={() => upd(key, val)}
                            style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: sel ? "700" : "500", border: "none", cursor: "pointer",
                              background: sel ? "linear-gradient(135deg,#004649, #00363A)" : "#EAF3F8", color: sel ? "white" : "#5A6B72" }}>
                            {lbl} ({val})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {(hadScoreA !== null || hadScoreD !== null) && (
                  <div style={{ background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", borderRadius: "12px", padding: "16px 20px" }}>
                    <p style={{ fontWeight: "700", color: "#004649", marginBottom: "10px" }}>Résultats HAD</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {hadScoreA !== null && (
                        <div style={{ background: "#E3F2FD", borderRadius: "10px", padding: "12px" }}>
                          <p style={{ fontSize: "12px", color: "#1565C0", fontWeight: "600" }}>Score A — Anxiété</p>
                          <p style={{ fontSize: "24px", fontWeight: "800", color: "#004649" }}>{hadScoreA}/21</p>
                          <p style={{ fontSize: "12px", color: "#5A6B72" }}>{hadLevel(hadScoreA)}</p>
                        </div>
                      )}
                      {hadScoreD !== null && (
                        <div style={{ background: "#FFF3E0", borderRadius: "10px", padding: "12px" }}>
                          <p style={{ fontSize: "12px", color: "#E65100", fontWeight: "600" }}>Score D — Dépression</p>
                          <p style={{ fontSize: "24px", fontWeight: "800", color: "#004649" }}>{hadScoreD}/21</p>
                          <p style={{ fontSize: "12px", color: "#5A6B72" }}>{hadLevel(hadScoreD)}</p>
                        </div>
                      )}
                    </div>
                    <p style={{ fontSize: "11px", color: "#90A4AE", marginTop: "8px" }}>≤7 : absence • 8-10 : douteuse • ≥11 : certaine</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SECTION 5 : CO-ADDICTIONS & FAGERSTRÖM ── */}
          {section === "addictions" && (
            <div style={sectionStyle}>
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Co-addictions <span style={S}>*</span></p>
                <p style={{ color: "#90A4AE", fontSize: "13px", marginBottom: "14px" }}>Pour chaque item, indiquer si les addictions sont actuelles, passées, ou les deux</p>
                {CO_ITEMS.map(({ key, label }) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "10px 0", borderBottom: "1px solid #EAF3F8" }}>
                    <span style={{ flex: 1, fontSize: "14px", color: "#2A3F4F" }}>{label}</span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {[["Actuelles","actuelles"],["Passées","passees"],["Les deux","les_deux"]].map(([lbl, val]) => {
                        const sel = d[key] === val;
                        return (
                          <button key={val} type="button" onClick={() => upd(key, sel ? "" : val)}
                            style={{ padding: "5px 12px", borderRadius: "999px", fontSize: "12px", fontWeight: sel ? "700" : "500", border: "none", cursor: "pointer",
                              background: sel ? "linear-gradient(135deg,#004649, #00363A)" : "#EAF3F8", color: sel ? "white" : "#5A6B72" }}>
                            {lbl}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "6px" }}>Test de Fagerström</p>
                {appData?.fag_score != null ? (
                  <div>
                    <div style={{ background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
                      <span style={{ fontSize: "28px", fontWeight: "800", color: "#004649" }}>{appData.fag_score}/10</span>
                      <div>
                        <p style={{ fontWeight: "700", color: "#004649", margin: 0 }}>Score issu de l'app Rêvade</p>
                        <p style={{ color: "#5A6B72", fontSize: "13px", margin: 0 }}>{appData.fag_niveau} — {fagLevel(parseInt(appData.fag_score))}</p>
                      </div>
                    </div>
                    <p style={{ color: "#90A4AE", fontSize: "12px" }}>Le patient a déjà complété ce test dans l'application. Passez aux questions ci-dessous si vous souhaitez le refaire en consultation.</p>
                  </div>
                ) : (
                  <p style={{ color: "#90A4AE", fontSize: "13px", marginBottom: "20px" }}>Aucun questionnaire app disponible — saisissez le score manuellement</p>
                )}
                {FAG_QS.map(({ id, q, opts }) => (
                  <div key={id} style={{ marginBottom: "18px", paddingBottom: "18px", borderBottom: "1px solid #EAF3F8" }}>
                    <p style={{ color: "#2A3F4F", fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>{FAG_QS.findIndex(x => x.id === id) + 1}. {q}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {opts.map(([lbl, val]) => {
                        const key = `fag_${id}`;
                        const sel = d[key] === val;
                        return (
                          <button key={val} type="button" onClick={() => upd(key, val)}
                            style={{ padding: "6px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: sel ? "700" : "500", border: "none", cursor: "pointer",
                              background: sel ? "linear-gradient(135deg,#004649, #00363A)" : "#EAF3F8", color: sel ? "white" : "#5A6B72" }}>
                            {lbl} ({val})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {fagScore !== null && (
                  <div style={{ background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "28px", fontWeight: "800", color: "#004649" }}>{fagScore}/10</span>
                    <div>
                      <p style={{ fontWeight: "700", color: "#004649", margin: 0 }}>Score Fagerström (consultation)</p>
                      <p style={{ color: "#5A6B72", fontSize: "13px", margin: 0 }}>{fagLevel(fagScore)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── SECTION 6 : SITUATION ACTUELLE ── */}
          {section === "situation" && (
            <div style={sectionStyle}>
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>À ce jour</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Date d'arrêt (NF)</label>
                    <input type="date" value={d.nf_date} onChange={e => upd("nf_date", e.target.value)} style={inputStyle} />
                  </div>
                  <RadioGroup value={d.arret_seul} onChange={v => upd("arret_seul", v)} label="Comment avez-vous arrêté ? — Seul" required options={[["Oui","oui"],["Non","non"]]} />
                  <RadioGroup value={d.reduction} onChange={v => upd("reduction", v)} label="Réduction" required options={[["Oui","oui"],["Non","non"]]} />
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Substituts nicotiniques</p>
                <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", marginBottom: "10px" }}>Patch</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                  {[["tsn_p7_24","7 mg/24h"],["tsn_p14_24","14 mg/24h"],["tsn_p21_24","21 mg/24h"],["tsn_p10_16","10 mg/16h"],["tsn_p15_16","15 mg/16h"],["tsn_p25_16","25 mg/16h"]].map(([k,l]) => (
                    <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />
                  ))}
                </div>
                <input value={d.tsn_patch_autre} onChange={e => upd("tsn_patch_autre", e.target.value)} placeholder="Préciser (autre dosage patch)..." style={{ ...inputStyle, marginTop: "8px" }} />

                <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", marginTop: "16px", marginBottom: "10px" }}>Formes orales</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#5A6B72", alignSelf: "center", minWidth: "60px" }}>Gommes :</span>
                    {[["tsn_g2","2 mg"],["tsn_g4","4 mg"]].map(([k,l]) => <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />)}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    <span style={{ fontSize: "13px", color: "#5A6B72", alignSelf: "center", minWidth: "60px" }}>Pastilles :</span>
                    {[["tsn_past1","1 mg"],["tsn_past1_5","1,5 mg"],["tsn_past2","2 mg"],["tsn_past2_5","2,5 mg"]].map(([k,l]) => <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />)}
                  </div>
                  <CB checked={d.tsn_spray} onChange={() => tog("tsn_spray")} label="Spray buccal" />
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Médicaments & Autres</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <CB checked={d.med_varenicline} onChange={() => tog("med_varenicline")} label="Varénicline (Champix)" />
                  <RadioGroup value={d.tcc} onChange={v => upd("tcc", v)} label="TCC" required options={[["Oui","oui"],["Non","non"]]} />

                  <div style={{ paddingTop: "8px", borderTop: "1px solid #EAF3F8" }}>
                    <RadioGroup value={d.vape_actuelle} onChange={v => upd("vape_actuelle", v)} label="Vapoteuse" required options={[["Oui","oui"],["Non","non"]]} />
                    {d.vape_actuelle === "oui" && (
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <RadioGroup value={d.vape_nicotine} onChange={v => upd("vape_nicotine", v)} label="Avec nicotine" options={[["Oui","oui"],["Non","non"]]} />
                        {d.vape_nicotine === "oui" && (
                          <div>
                            <label style={labelStyle}>Dosage nicotine</label>
                            <input value={d.vape_dosage} onChange={e => upd("vape_dosage", e.target.value)} placeholder="Ex : 6 mg/ml" style={inputStyle} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: "8px", borderTop: "1px solid #EAF3F8" }}>
                    <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", marginBottom: "10px" }}>Alternatives</p>
                    {[["alt_homeopathie","Homéopathie"],["alt_hypnose","Hypnose"],["alt_acupuncture","Acupuncture"],["alt_laser","Laser"]].map(([k,l]) => (
                      <div key={k} style={{ marginBottom: "6px" }}><CB checked={d[k]} onChange={() => tog(k)} label={l} /></div>
                    ))}
                    <div style={{ marginTop: "8px" }}>
                      <label style={labelStyle}>Autre</label>
                      <input value={d.alt_autre} onChange={e => upd("alt_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECTION 7 : MOTIVATION ── */}
          {section === "motivation" && (
            <div style={sectionStyle}>
              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Test de Rollnick <span style={S}>*</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  {[
                    ["rollnick_confiance", "Pouvez-vous donner une note sur 10 à la confiance en vous-même pour arrêter de fumer ?"],
                    ["rollnick_importance", "Pouvez-vous donner une note sur 10 à l'importance que revêt pour vous l'arrêt du tabac / vapoteuse ?"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label style={labelStyle}>{label}</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input type="range" min="0" max="10" value={d[key] || 0}
                          onChange={e => upd(key, e.target.value)}
                          style={{ flex: 1, accentColor: "#004649" }} />
                        <span style={{ fontWeight: "700", fontSize: "20px", color: "#004649", minWidth: "32px", textAlign: "center" }}>{d[key] || 0}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "16px" }}>Balance motivationnelle — Si je consomme</p>
                <div style={rowStyle}>
                  <div>
                    <label style={labelStyle}>Ce que j'ai à y gagner <span style={S}>*</span></label>
                    <textarea value={d.bilan_gains} onChange={e => upd("bilan_gains", e.target.value)}
                      placeholder="Texte libre..." rows={4} style={textareaStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Ce que j'ai à y perdre <span style={S}>*</span></label>
                    <textarea value={d.bilan_pertes} onChange={e => upd("bilan_pertes", e.target.value)}
                      placeholder="Texte libre..." rows={4} style={textareaStyle} />
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "14px" }}>Motivations à l'arrêt <span style={S}>*</span></p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                  {[["motiv_sante","Santé"],["motiv_prix","Prix"],["motiv_entourage","Entourage"]].map(([k,l]) => (
                    <CB key={k} checked={d[k]} onChange={() => tog(k)} label={l} />
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>Autre</label>
                  <input value={d.motiv_autre} onChange={e => upd("motiv_autre", e.target.value)} placeholder="Préciser..." style={inputStyle} />
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Craintes de l'arrêt <span style={S}>*</span></label>
                    <textarea value={d.craintes} onChange={e => upd("craintes", e.target.value)}
                      placeholder="Texte libre..." rows={3} style={textareaStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Difficultés rencontrées (arrêt ou réduction)</label>
                    <textarea value={d.difficultes} onChange={e => upd("difficultes", e.target.value)}
                      placeholder="Texte libre..." rows={3} style={textareaStyle} />
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "24px", padding: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)" }}>
                <p style={{ fontWeight: "700", color: "#004649", marginBottom: "14px" }}>Suivi poids</p>
                <RadioGroup value={d.compensation_alimentaire} onChange={v => upd("compensation_alimentaire", v)}
                  label="Compensation alimentaire" required options={[["Oui","oui"],["Non","non"]]} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 28px", background: "white", borderTop: "1px solid #EAF3F8", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: "8px" }}>
            {sectionIdx > 0 && (
              <button type="button" onClick={() => setSection(SECTIONS[sectionIdx - 1].id)}
                style={{ padding: "10px 20px", borderRadius: "12px", border: "1.5px solid #B7D7E8", background: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                ← Précédent
              </button>
            )}
            {sectionIdx < SECTIONS.length - 1 && (
              <button type="button" onClick={() => setSection(SECTIONS[sectionIdx + 1].id)}
                style={{ padding: "10px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", color: "#004649", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Suivant →
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button type="button" onClick={onClose}
              style={{ padding: "10px 24px", borderRadius: "12px", border: "1.5px solid #B7D7E8", background: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
              Annuler
            </button>
            <button type="button" onClick={save} disabled={saving}
              style={{ padding: "10px 28px", borderRadius: "50px", border: "none", background: saving ? "#90A4AE" : "linear-gradient(135deg,#004649, #00363A)", color: "#F4EDE4", fontWeight: "600", cursor: saving ? "not-allowed" : "pointer", fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
              {saving ? "Enregistrement..." : "✓ Enregistrer le dossier"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
