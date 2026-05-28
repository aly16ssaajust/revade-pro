"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

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

const HORN_FACTORS = [
  { id: "A", label: "Stimulation", desc: "Fume pour se stimuler / avoir de l'énergie", color: "#1565C0", bg: "#E3F2FD" },
  { id: "B", label: "Manipulation", desc: "Plaisir de tenir et manipuler la cigarette", color: "#6A1B9A", bg: "#F3E5F5" },
  { id: "C", label: "Plaisir / détente", desc: "Plaisir de fumer quand on est détendu(e)", color: "#2E7D32", bg: "#E8F5E9" },
  { id: "D", label: "Béquille", desc: "Fume pour réduire stress, colère ou anxiété", color: "#E65100", bg: "#FFF3E0" },
  { id: "E", label: "Craving psychologique", desc: "Besoin intense, conscience du manque", color: "#C62828", bg: "#FFEBEE" },
  { id: "F", label: "Habitude automatique", desc: "Fume automatiquement, sans y penser", color: "#546E7A", bg: "#ECEFF1" },
];
const HORN_QS = [
  { n: 1, f: "A" }, { n: 2, f: "B" }, { n: 3, f: "C" }, { n: 4, f: "D" }, { n: 5, f: "E" }, { n: 6, f: "F" },
  { n: 7, f: "A" }, { n: 8, f: "B" }, { n: 9, f: "C" }, { n: 10, f: "D" }, { n: 11, f: "E" }, { n: 12, f: "F" },
  { n: 13, f: "A" }, { n: 14, f: "B" }, { n: 15, f: "C" }, { n: 16, f: "D" }, { n: 17, f: "E" }, { n: 18, f: "F" },
];

const BECK_COLS = [
  { id: "situation", label: "1. Situation", icon: "📍" },
  { id: "emotions", label: "2. Émotions", icon: "💭" },
  { id: "pensees", label: "3. Pensées automatiques", icon: "⚡" },
  { id: "reponse", label: "4. Réponse rationnelle", icon: "🔄" },
  { id: "resultat", label: "5. Résultat", icon: "✅" },
];

function HADView({ data, scores }) {
  const sA = scores?.scoreA ?? null;
  const sD = scores?.scoreD ?? null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {sA !== null && sD !== null && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <div style={{ background: "#E3F2FD", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#1565C0", fontWeight: "700", marginBottom: "6px" }}>Score A — Anxiété</p>
            <p style={{ fontSize: "36px", fontWeight: "800", color: hadColor(sA), margin: "0 0 4px 0" }}>{sA}<span style={{ fontSize: "16px", color: "#90A4AE" }}>/21</span></p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: hadColor(sA) }}>{hadLevel(sA)}</p>
          </div>
          <div style={{ background: "#FFF3E0", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
            <p style={{ fontSize: "12px", color: "#E65100", fontWeight: "700", marginBottom: "6px" }}>Score D — Dépression</p>
            <p style={{ fontSize: "36px", fontWeight: "800", color: hadColor(sD), margin: "0 0 4px 0" }}>{sD}<span style={{ fontSize: "16px", color: "#90A4AE" }}>/21</span></p>
            <p style={{ fontSize: "13px", fontWeight: "600", color: hadColor(sD) }}>{hadLevel(sD)}</p>
          </div>
        </div>
      )}
      <p style={{ fontSize: "11px", color: "#90A4AE" }}>≤ 7 : absence &nbsp;•&nbsp; 8-10 : cas douteux &nbsp;•&nbsp; ≥ 11 : cas certain</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {HAD_QS.map(({ n, t, q, opts }) => {
          const val = String(data?.[n] ?? data?.[String(n)] ?? "");
          const lbl = opts.find(o => String(o[1]) === val)?.[0] ?? "—";
          return (
            <div key={n} style={{ padding: "12px 16px", background: "#F8FAFC", borderRadius: "10px", borderLeft: `3px solid ${t === "A" ? "#1565C0" : "#E65100"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div style={{ flex: 1 }}>
                  <span style={{ background: t === "A" ? "#E3F2FD" : "#FFF3E0", color: t === "A" ? "#1565C0" : "#E65100", borderRadius: "4px", padding: "1px 6px", fontSize: "10px", fontWeight: "700", marginRight: "6px" }}>
                    Q{n} {t === "A" ? "Anxiété" : "Dépression"}
                  </span>
                  <span style={{ color: "#546E7A", fontSize: "13px" }}>{q}</span>
                </div>
                <span style={{ color: lbl === "—" ? "#ccc" : "#004649", fontWeight: "700", fontSize: "13px", flexShrink: 0 }}>→ {lbl}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HornView({ data, scores }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "14px" }}>Profil motivationnel</p>
      {HORN_FACTORS.map(factor => {
        const score = scores?.[factor.id] != null
          ? Number(scores[factor.id])
          : HORN_QS.filter(q => q.f === factor.id).reduce((s, q) => {
              const v = data?.[q.n] ?? data?.[String(q.n)];
              return s + (v != null ? parseInt(String(v), 10) : 0);
            }, 0);
        const pct = Math.max(0, Math.min(100, ((score - 3) / 12) * 100));
        return (
          <div key={factor.id} style={{ background: factor.bg, borderRadius: "12px", padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
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
      <p style={{ fontSize: "11px", color: "#90A4AE" }}>Score ≥ 9/15 = motivation significative dans ce registre</p>
    </div>
  );
}

function BeckView({ data }) {
  const entries = data?.entries ?? [];
  if (!entries.length) return <p style={{ color: "#90A4AE", fontSize: "13px" }}>Aucune entrée enregistrée.</p>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {entries.map((entry, i) => (
        <div key={i} style={{ background: "#F8FAFC", border: "1px solid #E4ECF2", borderRadius: "14px", padding: "18px" }}>
          {entry.date && <p style={{ color: "#90A4AE", fontSize: "11px", marginBottom: "12px" }}>{entry.date}</p>}
          {BECK_COLS.map(col => entry[col.id] ? (
            <div key={col.id} style={{ marginBottom: "10px" }}>
              <p style={{ color: "#546E7A", fontSize: "12px", fontWeight: "700", marginBottom: "4px" }}>{col.icon} {col.label}</p>
              <p style={{ color: "#1E3A4A", fontSize: "13px", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>{entry[col.id]}</p>
            </div>
          ) : null)}
        </div>
      ))}
    </div>
  );
}

const TITLES = { had: "🧠 Test HAD", horn: "🚬 Test de Horn", beck: "📝 Colonnes de Beck" };
const SUBTITLES = { had: "Hospital Anxiety and Depression Scale", horn: "Motivations pour fumer — 18 questions", beck: "Restructuration cognitive — 5 colonnes" };

export default function TestResultModal({ test, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [scores, setScores] = useState(null);

  useEffect(() => {
    async function fetchTest() {
      setLoading(true);
      const { data: row } = await supabase
        .from("patient_tests")
        .select("data, scores")
        .eq("id", test.id)
        .single();
      if (row) {
        setData(row.data);
        setScores(row.scores);
      }
      setLoading(false);
    }
    fetchTest();
  }, [test.id]);

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "20px" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "36px", width: "680px", maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "20px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", margin: "0 0 4px 0" }}>{TITLES[test.type] ?? "Test"}</h2>
            <p style={{ color: "#90A4AE", fontSize: "13px", margin: 0 }}>{test.nom} &nbsp;•&nbsp; {SUBTITLES[test.type]}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#888" }}>×</button>
        </div>

        {loading ? (
          <p style={{ color: "#90A4AE", textAlign: "center", fontSize: "14px" }}>Chargement…</p>
        ) : !data ? (
          <p style={{ color: "#C62828", textAlign: "center", fontSize: "14px" }}>Impossible de charger les données du test.</p>
        ) : (
          <>
            {test.type === "had" && <HADView data={data} scores={scores} />}
            {test.type === "horn" && <HornView data={data} scores={scores} />}
            {test.type === "beck" && <BeckView data={data} />}
          </>
        )}
      </div>
    </div>
  );
}
