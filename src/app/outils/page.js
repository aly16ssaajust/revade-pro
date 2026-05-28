"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useProProfile } from "@/lib/useProProfile";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

/* ── HAD ─────────────────────────────────────────────────────────── */
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
function hadLevel(s) { if (s <= 7) return "Absence"; if (s <= 10) return "Cas douteux"; return "Cas certain"; }
function hadColor(s) { if (s <= 7) return "#2E7D32"; if (s <= 10) return "#E65100"; return "#C62828"; }

/* ── HORN ────────────────────────────────────────────────────────── */
const HORN_FACTORS = [
  { id: "A", label: "Stimulation", desc: "Fume pour se stimuler / avoir de l'énergie", color: "#1565C0", bg: "#E3F2FD" },
  { id: "B", label: "Manipulation", desc: "Plaisir de tenir et manipuler la cigarette", color: "#6A1B9A", bg: "#F3E5F5" },
  { id: "C", label: "Plaisir / détente", desc: "Plaisir de fumer quand on est détendu(e)", color: "#2E7D32", bg: "#E8F5E9" },
  { id: "D", label: "Béquille", desc: "Fume pour réduire stress, colère ou anxiété", color: "#E65100", bg: "#FFF3E0" },
  { id: "E", label: "Craving psychologique", desc: "Besoin intense, conscience du manque", color: "#C62828", bg: "#FFEBEE" },
  { id: "F", label: "Habitude automatique", desc: "Fume automatiquement, sans y penser", color: "#546E7A", bg: "#ECEFF1" },
];
const HORN_QS = [
  { n: 1, f: "A", q: "Je fume pour me stimuler, pour me donner de l'énergie" },
  { n: 2, f: "B", q: "Une partie du plaisir de fumer vient des gestes que j'effectue quand j'allume une cigarette" },
  { n: 3, f: "C", q: "Fumer est agréable et me détend" },
  { n: 4, f: "D", q: "J'allume une cigarette lorsque je suis en colère contre quelque chose" },
  { n: 5, f: "E", q: "Quand je n'ai plus de cigarettes, je supporte très mal d'en être privé(e)" },
  { n: 6, f: "F", q: "Je fume automatiquement, sans vraiment m'en rendre compte" },
  { n: 7, f: "A", q: "Je fume pour me sentir mieux, pour « avoir la pêche »" },
  { n: 8, f: "B", q: "Une partie du plaisir de fumer vient de la façon dont je manipule la cigarette" },
  { n: 9, f: "C", q: "Je trouve la cigarette agréable et satisfaisante" },
  { n: 10, f: "D", q: "Je fume une cigarette pour me sentir mieux quand je suis déprimé(e) ou nerveux(se)" },
  { n: 11, f: "E", q: "Je suis bien conscient(e) de ne pas fumer quand je n'ai pas de cigarette" },
  { n: 12, f: "F", q: "J'ai allumé une cigarette sans m'en rendre compte alors que j'en avais déjà une en train de brûler" },
  { n: 13, f: "A", q: "Je fume pour m'exciter, pour me « remonter le moral »" },
  { n: 14, f: "B", q: "Quand je fume, une partie de mon plaisir vient du rituel d'allumage" },
  { n: 15, f: "C", q: "Je veux surtout fumer quand je suis confortablement installé(e) et détendu(e)" },
  { n: 16, f: "D", q: "Je fume quand je me sens mal à l'aise, inquiet(e) ou déprimé(e)" },
  { n: 17, f: "E", q: "Quand je ne fume pas pendant un certain temps, je me sens impatient(e) de recommencer" },
  { n: 18, f: "F", q: "Souvent, j'ai eu une cigarette entre les doigts sans me souvenir de l'avoir allumée" },
];
const HORN_SCALE = [["Toujours","5"],["Souvent","4"],["Parfois","3"],["Rarement","2"],["Jamais","1"]];

/* ── BECK ────────────────────────────────────────────────────────── */
const BECK_COLS = [
  { id: "situation", label: "1. Situation", placeholder: "Quand ? Où ? Avec qui ? Qu'est-ce qui s'est passé ?", icon: "📍" },
  { id: "emotions", label: "2. Émotions", placeholder: "Quelles émotions ressentez-vous ? (tristesse, peur, colère…)\nIntensité de 0 à 100%", icon: "💭" },
  { id: "pensees", label: "3. Pensées automatiques", placeholder: "Qu'est-ce que vous vous êtes dit à ce moment-là ?\nQuelle image ou croyance ? (0-100% de conviction)", icon: "⚡" },
  { id: "reponse", label: "4. Réponse rationnelle", placeholder: "Y a-t-il une autre façon de voir les choses ?\nQuelle preuve va contre cette pensée ?", icon: "🔄" },
  { id: "resultat", label: "5. Résultat", placeholder: "Comment vous sentez-vous maintenant ?\nIntensité de l'émotion après cet exercice ? (0-100%)", icon: "✅" },
];

const inputStyle = {
  width: "100%", border: "1px solid #B8D8E8", borderRadius: "10px",
  padding: "10px 14px", fontSize: "14px", color: "#1E3A4A", outline: "none",
  backgroundColor: "#FAFAFA", boxSizing: "border-box", fontFamily: "inherit",
};

/* ════════════════════════════════════════════════════════════════════ */
export default function Outils() {
  const { pro } = useProProfile();
  const [modal, setModal] = useState(null);

  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedTest, setSavedTest] = useState(false);

  useEffect(() => {
    if (!pro) return;
    async function load() {
      const { data: links } = await supabase.from("patient_professional_links").select("patient_id").eq("professional_id", pro.id);
      const ids = (links || []).map(l => l.patient_id);
      if (!ids.length) return;
      const { data } = await supabase.from("profiles").select("id, prenom, nom").in("id", ids).order("nom");
      setPatients(data || []);
    }
    load();
  }, [pro]);

  function openModal(name, resetFn) {
    resetFn(); setSelectedPatient(""); setSavedTest(false); setModal(name);
  }

  const patientObj = patients.find(p => p.id === selectedPatient) || null;

  async function saveTest(type, data, scores) {
    if (!selectedPatient) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("patient_tests").insert({
        patient_id: selectedPatient,
        pro_id: pro.id,
        type,
        data,
        scores,
      });
      if (error) throw error;
      setSavedTest(true);
      showToast(`Test enregistré pour ${patientObj?.prenom} ${patientObj?.nom}`);
    } catch (e) {
      showToast(`Erreur : ${e.message}`, "error");
    }
    setSaving(false);
  }

  /* HAD state */
  const [hadRep, setHadRep] = useState({});
  function hadScore(t) {
    const vals = HAD_QS.filter(q => q.t === t).map(q => parseInt(hadRep[q.n] ?? "X"));
    return vals.some(isNaN) ? null : vals.reduce((a, b) => a + b, 0);
  }
  const scoreA = hadScore("A"), scoreD = hadScore("D");
  const hadComplete = scoreA !== null && scoreD !== null;

  /* Horn state */
  const [hornRep, setHornRep] = useState({});
  function hornScore(fId) { return HORN_QS.filter(q => q.f === fId).reduce((s, q) => s + parseInt(hornRep[q.n] || "0"), 0); }
  const hornComplete = Object.keys(hornRep).length === 18;

  /* Beck state */
  const BECK_INIT = { situation: "", emotions: "", pensees: "", reponse: "", resultat: "" };
  const [beckData, setBeckData] = useState(BECK_INIT);
  const [beckHistory, setBeckHistory] = useState([]);
  function addBeckEntry() {
    if (!beckData.situation.trim()) return;
    setBeckHistory(prev => [{ ...beckData, date: new Date().toLocaleString("fr-FR") }, ...prev]);
    setBeckData(BECK_INIT);
  }

  /* ── Save bar ── */
  function SaveBar({ canSave, onSave }) {
    return (
      <div style={{ background: "#F8FAFC", border: "1.5px solid #E4ECF2", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "13px", color: "#546E7A", fontWeight: "600", flexShrink: 0 }}>👤 Enregistrer pour :</span>
        <select value={selectedPatient} onChange={e => { setSelectedPatient(e.target.value); setSavedTest(false); }}
          style={{ flex: 1, minWidth: "180px", border: "1px solid #B8D8E8", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", color: "#1E3A4A", outline: "none", backgroundColor: "white" }}>
          <option value="">— Sélectionner un patient —</option>
          {patients.map(p => <option key={p.id} value={p.id}>{p.prenom} {p.nom}</option>)}
        </select>
        {!savedTest ? (
          <button onClick={onSave} disabled={saving || !canSave || !selectedPatient}
            style={{ padding: "9px 22px", borderRadius: "10px", border: "none", fontSize: "13px", fontWeight: "700", whiteSpace: "nowrap",
              cursor: (saving || !canSave || !selectedPatient) ? "not-allowed" : "pointer",
              background: (saving || !canSave || !selectedPatient) ? "#90A4AE" : "linear-gradient(135deg,#004649,#006B6F)",
              color: "white", boxShadow: (saving || !canSave || !selectedPatient) ? "none" : "0 4px 8px rgba(0,70,73,0.3)" }}>
            {saving ? "Enregistrement…" : "💾 Enregistrer dans les documents"}
          </button>
        ) : (
          <span style={{ background: "#E8F5EF", color: "#2E7D32", borderRadius: "10px", padding: "9px 16px", fontSize: "13px", fontWeight: "700" }}>✓ Enregistré dans les documents</span>
        )}
        {!selectedPatient && <span style={{ fontSize: "12px", color: "#90A4AE" }}>Sélectionnez un patient pour enregistrer</span>}
        {selectedPatient && !canSave && <span style={{ fontSize: "12px", color: "#E65100" }}>Complétez le test pour pouvoir l'enregistrer</span>}
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8" }}>
      <Navbar proId={pro?.id} />
      <div style={{ padding: "40px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "36px" }}>
          <h1 style={{ color: "#004649", fontWeight: "700", fontSize: "24px", marginBottom: "6px" }}>🛠 Outils cliniques</h1>
          <p style={{ color: "#888", fontSize: "14px" }}>Tests validés et ressources de formation pour vos consultations</p>
        </div>

        <h2 style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>📋 Tests & Évaluations</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: "16px", marginBottom: "48px" }}>
          <TestCard icon="🧠" title="Test HAD" subtitle="Hospital Anxiety and Depression Scale"
            desc="Évalue l'anxiété et la dépression — 14 questions, scores A et D de 0 à 21"
            tags={["Anxiété", "Dépression"]} onOpen={() => openModal("had", () => setHadRep({}))} />
          <TestCard icon="📝" title="Colonnes de Beck" subtitle="Restructuration cognitive (TCC)"
            desc="Outil de restructuration cognitive en 5 colonnes — identifie et recadre les pensées automatiques négatives"
            tags={["TCC", "Pensées automatiques"]} onOpen={() => openModal("beck", () => { setBeckData(BECK_INIT); setBeckHistory([]); })} />
          <TestCard icon="🚬" title="Test de Horn" subtitle="Motivations pour fumer"
            desc="Identifie les 6 raisons qui poussent à fumer — 18 questions, profil motivationnel personnalisé"
            tags={["Tabac", "Motivation"]} onOpen={() => openModal("horn", () => setHornRep({}))} />
        </div>

        <h2 style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "16px", marginBottom: "16px" }}>🎓 Formations gratuites</h2>
        <a href="https://www.fun-mooc.fr/courses/course-v1:u-paris+37021+session03/about" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          <div style={{ background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", border: "1.5px solid #A5C9B9", borderRadius: "20px", padding: "28px 32px", display: "flex", gap: "20px", alignItems: "flex-start", boxShadow: "0 4px 16px rgba(0,70,73,0.08)", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
            <div style={{ fontSize: "40px", flexShrink: 0 }}>🎓</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "6px" }}>
                <p style={{ color: "#004649", fontWeight: "700", fontSize: "16px", margin: 0 }}>MOOC — Aide à l'arrêt du tabac</p>
                <span style={{ background: "#004649", color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: "700" }}>GRATUIT</span>
              </div>
              <p style={{ color: "#1E3A4A", fontSize: "13px", marginBottom: "10px", lineHeight: "1.6" }}>La Société Francophone de Tabacologie met à disposition ce MOOC pour vous aider à prendre en charge le sevrage tabagique. Déjà <strong>8 000 inscrits</strong>.</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["#MOOC","#SevrageTabagique","SFT","Université de Paris"].map(t => (
                  <span key={t} style={{ background: "rgba(0,70,73,0.1)", color: "#004649", borderRadius: "999px", padding: "3px 10px", fontSize: "12px", fontWeight: "600" }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "linear-gradient(135deg,#004649,#006B6F)", color: "white", borderRadius: "12px", padding: "10px 18px", fontSize: "13px", fontWeight: "700", flexShrink: 0, alignSelf: "center" }}>Accéder →</div>
          </div>
        </a>
      </div>

      {/* ══ MODAL HAD ══ */}
      {modal === "had" && (
        <Modal title="🧠 Test HAD" subtitle="Hospital Anxiety and Depression Scale — 14 questions" onClose={() => setModal(null)}>
          {HAD_QS.map(({ n, t, q, opts }) => (
            <div key={n} style={{ paddingBottom: "18px", borderBottom: "1px solid #F0F4F8" }}>
              <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: t === "A" ? "#E3F2FD" : "#FFF3E0", color: t === "A" ? "#1565C0" : "#E65100", borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                  {t === "A" ? "Anxiété" : "Dépression"}
                </span>
                {n}. {q}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {opts.map(([lbl, val]) => {
                  const sel = hadRep[n] === val;
                  return (
                    <button key={val} type="button" onClick={() => { setHadRep(p => ({ ...p, [n]: val })); setSavedTest(false); }}
                      style={{ padding: "7px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: sel ? "700" : "500", border: "none", cursor: "pointer",
                        background: sel ? "linear-gradient(135deg,#004649,#006B6F)" : "#F0F4F8", color: sel ? "white" : "#546E7A" }}>
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {hadComplete ? (
            <div style={{ background: "linear-gradient(135deg,#E8F5EF,#D0EDE0)", borderRadius: "14px", padding: "20px 24px" }}>
              <p style={{ fontWeight: "700", color: "#004649", marginBottom: "12px" }}>Résultats HAD</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "10px" }}>
                <div style={{ background: "#E3F2FD", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#1565C0", fontWeight: "700", marginBottom: "4px" }}>Score A — Anxiété</p>
                  <p style={{ fontSize: "32px", fontWeight: "800", color: hadColor(scoreA), margin: "0 0 4px 0" }}>{scoreA}<span style={{ fontSize: "16px", color: "#90A4AE" }}>/21</span></p>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: hadColor(scoreA) }}>{hadLevel(scoreA)}</p>
                </div>
                <div style={{ background: "#FFF3E0", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                  <p style={{ fontSize: "12px", color: "#E65100", fontWeight: "700", marginBottom: "4px" }}>Score D — Dépression</p>
                  <p style={{ fontSize: "32px", fontWeight: "800", color: hadColor(scoreD), margin: "0 0 4px 0" }}>{scoreD}<span style={{ fontSize: "16px", color: "#90A4AE" }}>/21</span></p>
                  <p style={{ fontSize: "13px", fontWeight: "600", color: hadColor(scoreD) }}>{hadLevel(scoreD)}</p>
                </div>
              </div>
              <p style={{ fontSize: "11px", color: "#90A4AE" }}>≤ 7 : absence &nbsp;•&nbsp; 8-10 : cas douteux &nbsp;•&nbsp; ≥ 11 : cas certain</p>
            </div>
          ) : (
            <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center" }}>{Object.keys(hadRep).length}/14 réponses — les scores s'affichent automatiquement</p>
          )}

          <SaveBar canSave={hadComplete} onSave={() => saveTest("had", hadRep, { scoreA, scoreD })} />
        </Modal>
      )}

      {/* ══ MODAL BECK ══ */}
      {modal === "beck" && (
        <Modal title="📝 Colonnes de Beck" subtitle="Restructuration cognitive — 5 colonnes" onClose={() => setModal(null)}>
          <div style={{ background: "#F0F4F8", borderRadius: "12px", padding: "14px 18px" }}>
            <p style={{ color: "#1E3A4A", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
              Outil de thérapie cognitive-comportementale. Complétez les 5 colonnes pour identifier et recadrer les pensées automatiques négatives.
            </p>
          </div>
          {BECK_COLS.map(col => (
            <div key={col.id}>
              <label style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px", display: "block", marginBottom: "8px" }}>{col.icon} {col.label}</label>
              <textarea value={beckData[col.id]} onChange={e => setBeckData(p => ({ ...p, [col.id]: e.target.value }))}
                placeholder={col.placeholder} rows={3} style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }} />
            </div>
          ))}
          <button onClick={addBeckEntry} disabled={!beckData.situation.trim()}
            style={{ padding: "10px 20px", borderRadius: "10px", border: "none", fontWeight: "600", fontSize: "13px", cursor: beckData.situation.trim() ? "pointer" : "not-allowed",
              background: beckData.situation.trim() ? "#E8F5EF" : "#F0F4F8", color: beckData.situation.trim() ? "#004649" : "#90A4AE" }}>
            + Ajouter à l'historique de session
          </button>
          {beckHistory.length > 0 && (
            <div>
              <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "14px", marginBottom: "10px" }}>Historique ({beckHistory.length} entrée{beckHistory.length > 1 ? "s" : ""})</p>
              {beckHistory.map((entry, i) => (
                <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E4ECF2", borderRadius: "12px", padding: "14px", marginBottom: "8px" }}>
                  <p style={{ color: "#90A4AE", fontSize: "11px", marginBottom: "8px" }}>{entry.date}</p>
                  {BECK_COLS.map(col => entry[col.id] && (
                    <div key={col.id} style={{ marginBottom: "6px" }}>
                      <p style={{ color: "#546E7A", fontSize: "11px", fontWeight: "700", marginBottom: "2px" }}>{col.label}</p>
                      <p style={{ color: "#1E3A4A", fontSize: "13px", whiteSpace: "pre-wrap" }}>{entry[col.id]}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          <SaveBar canSave={beckHistory.length > 0} onSave={() => saveTest("beck", { entries: beckHistory }, null)} />
        </Modal>
      )}

      {/* ══ MODAL HORN ══ */}
      {modal === "horn" && (
        <Modal title="🚬 Test de Horn" subtitle="Motivations pour fumer — 18 questions" onClose={() => setModal(null)}>
          <div style={{ background: "#F0F4F8", borderRadius: "12px", padding: "14px 18px" }}>
            <p style={{ color: "#1E3A4A", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>Pour chaque affirmation, indiquez ce qui correspond le mieux aux habitudes actuelles du patient fumeur.</p>
          </div>
          {HORN_QS.map(({ n, f, q }) => {
            const factor = HORN_FACTORS.find(x => x.id === f);
            return (
              <div key={n} style={{ paddingBottom: "16px", borderBottom: "1px solid #F0F4F8" }}>
                <p style={{ color: "#1E3A4A", fontSize: "14px", fontWeight: "600", marginBottom: "10px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ background: factor.bg, color: factor.color, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>{factor.label}</span>
                  {n}. {q}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {HORN_SCALE.map(([lbl, val]) => {
                    const sel = hornRep[n] === val;
                    return (
                      <button key={val} type="button" onClick={() => { setHornRep(p => ({ ...p, [n]: val })); setSavedTest(false); }}
                        style={{ padding: "7px 14px", borderRadius: "999px", fontSize: "12px", fontWeight: sel ? "700" : "500", border: "none", cursor: "pointer",
                          background: sel ? "linear-gradient(135deg,#004649,#006B6F)" : "#F0F4F8", color: sel ? "white" : "#546E7A" }}>
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {hornComplete ? (
            <div>
              <p style={{ fontWeight: "700", color: "#004649", marginBottom: "12px" }}>Profil motivationnel</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {HORN_FACTORS.map(factor => {
                  const score = hornScore(factor.id);
                  const pct = ((score - 3) / 12) * 100;
                  return (
                    <div key={factor.id} style={{ background: factor.bg, borderRadius: "12px", padding: "14px 18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div>
                          <span style={{ color: factor.color, fontWeight: "700", fontSize: "14px" }}>{factor.label}</span>
                          <span style={{ color: "#90A4AE", fontSize: "12px", marginLeft: "8px" }}>{factor.desc}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontWeight: "800", fontSize: "18px", color: factor.color }}>{score}<span style={{ fontSize: "12px", color: "#90A4AE" }}>/15</span></span>
                          {score >= 9 && <span style={{ background: factor.color, color: "white", borderRadius: "999px", padding: "2px 8px", fontSize: "11px", fontWeight: "700" }}>Significatif</span>}
                        </div>
                      </div>
                      <div style={{ height: "6px", background: "rgba(0,0,0,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: factor.color, borderRadius: "999px" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: "11px", color: "#90A4AE", marginTop: "8px" }}>Score ≥ 9/15 = motivation significative dans ce registre</p>
            </div>
          ) : (
            <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center" }}>{Object.keys(hornRep).length}/18 réponses — le profil s'affiche automatiquement</p>
          )}

          <SaveBar canSave={hornComplete} onSave={() => saveTest("horn", hornRep, Object.fromEntries(HORN_FACTORS.map(f => [f.id, hornScore(f.id)])))} />
        </Modal>
      )}
    </div>
  );
}

function TestCard({ icon, title, subtitle, desc, tags, onOpen }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "linear-gradient(135deg,#ffffff,#f8f9fa)", borderRadius: "20px", padding: "28px", boxShadow: hovered ? "0 12px 32px rgba(0,0,0,0.12)" : "0 4px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(255,255,255,0.7)", transform: hovered ? "translateY(-3px)" : "translateY(0)", transition: "all 0.2s ease", display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "36px" }}>{icon}</div>
      <div>
        <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "16px", marginBottom: "3px" }}>{title}</p>
        <p style={{ color: "#90A4AE", fontSize: "12px" }}>{subtitle}</p>
      </div>
      <p style={{ color: "#546E7A", fontSize: "13px", lineHeight: "1.6", flex: 1 }}>{desc}</p>
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {tags.map(t => <span key={t} style={{ background: "#E8F5EF", color: "#004649", borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: "600" }}>{t}</span>)}
      </div>
      <button onClick={onOpen} style={{ padding: "11px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#004649,#006B6F)", color: "white", fontWeight: "700", fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
        Lancer le test →
      </button>
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "36px", width: "720px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "22px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", margin: "0 0 4px 0" }}>{title}</h2>
            <p style={{ color: "#90A4AE", fontSize: "13px", margin: 0 }}>{subtitle}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
