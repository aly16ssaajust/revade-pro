"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { showToast } from "@/lib/toast";

const TSN_PRODUCTS = [
  {
    id: "patch_16h", label: "Patch 16h", doses: ["10 mg/16h", "15 mg/16h", "25 mg/16h"],
  },
  {
    id: "patch_24h", label: "Patch 24h", doses: ["7 mg/24h", "14 mg/24h", "21 mg/24h"],
  },
  {
    id: "gomme", label: "Gomme", doses: ["2 mg", "4 mg"],
  },
  {
    id: "comprime_sucer", label: "Comprimés à sucer", doses: ["1 mg", "1,5 mg", "2 mg", "2,5 mg"],
  },
  {
    id: "spray", label: "Spray buccal", doses: ["1 mg"],
  },
  {
    id: "sublingual", label: "Comprimés sublinguaux", doses: ["2 mg", "4 mg"],
  },
];

const inputStyle = {
  width: "100%", border: "1px solid #B7D7E8", borderRadius: "12px",
  padding: "12px 16px", fontSize: "14px", color: "#2A3F4F", outline: "none",
  backgroundColor: "#FAFAFA", boxSizing: "border-box", fontFamily: "inherit",
};

export default function OrdonTSNModal({ open, onClose, patient, pro, patientId, onSaved }) {
  const [selections, setSelections] = useState({});
  const [duree, setDuree] = useState("");
  const [renouvellement, setRenouvellement] = useState("Non autorisé");
  const [notes, setNotes] = useState("");
  const [generating, setGenerating] = useState(false);

  const nomComplet = `${patient?.prenom || ""} ${patient?.nom || ""}`.trim();

  function toggleDose(productId, dose) {
    setSelections(prev => {
      const current = prev[productId] || [];
      const exists = current.includes(dose);
      return { ...prev, [productId]: exists ? current.filter(d => d !== dose) : [...current, dose] };
    });
  }

  function buildPrescription() {
    const lines = [];
    TSN_PRODUCTS.forEach(p => {
      const doses = selections[p.id] || [];
      if (doses.length > 0) lines.push(`- ${p.label} ${doses.join(", ")}`);
    });
    return lines.join("\n");
  }

  async function generer() {
    const prescription = buildPrescription();
    if (!prescription.trim()) { showToast("Veuillez sélectionner au moins un produit TSN", "error"); return; }
    setGenerating(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF({ format: "a4", unit: "mm" });
      const mL = 20, mR = 190;
      const dateStr = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

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
      doc.text(dateStr, mR, 22, { align: "right" });

      const lineY = Math.max(yPro + 5, 42);
      doc.setDrawColor(180, 180, 180); doc.line(mL, lineY, mR, lineY);

      // Patient
      const patY = lineY + 7;
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("Patient :", mL, patY);
      doc.setFont("helvetica", "normal");
      const sexe = patient?.genre ? (patient.genre === "homme" || patient.genre === "masculin" || patient.genre === "M" ? "M." : "Mme") : "";
      doc.text(`${sexe} ${patient?.prenom || ""} ${patient?.nom || ""}`.trim(), mL + 18, patY);
      let patLine = patY;
      if (patient?.date_naissance) { patLine += 5; doc.text(`Né(e) le : ${patient.date_naissance}`, mL, patLine); }
      doc.line(mL, patLine + 5, mR, patLine + 5);

      // Titre
      const titleY = patLine + 16;
      doc.setFont("helvetica", "bold"); doc.setFontSize(13);
      doc.setTextColor(0, 70, 73);
      doc.text("ORDONNANCE — TRAITEMENT DE SUBSTITUTION NICOTINIQUE (TSN)", 105, titleY, { align: "center" });
      doc.setTextColor(0, 0, 0);

      // Prescription
      const rpY = titleY + 10;
      doc.setFont("helvetica", "bold"); doc.setFontSize(10);
      doc.text("Rp.", mL, rpY);
      doc.setFont("helvetica", "normal"); doc.setFontSize(10);
      const prescLines = doc.splitTextToSize(prescription, 148);
      doc.text(prescLines, mL + 14, rpY);
      let y = rpY + prescLines.length * 6 + 6;

      if (duree.trim()) {
        doc.setFont("helvetica", "bold"); doc.text("Durée :", mL + 14, y);
        doc.setFont("helvetica", "normal"); doc.text(duree.trim(), mL + 30, y); y += 7;
      }
      doc.setFont("helvetica", "bold"); doc.text("Renouvellement :", mL + 14, y);
      doc.setFont("helvetica", "normal"); doc.text(renouvellement, mL + 51, y); y += 7;

      if (notes.trim()) {
        y += 4;
        doc.setFont("helvetica", "italic"); doc.setFontSize(10);
        const noteLines = doc.splitTextToSize(notes.trim(), 148);
        doc.text(noteLines, mL + 14, y);
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

      const pdfBlob = doc.output("blob");
      const path = `${patientId}/ordon-tsn-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("patient-documents").upload(path, pdfBlob, { contentType: "application/pdf" });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("patient-documents").getPublicUrl(path);
      const nom = `Ordon TSN - ${new Date().toLocaleDateString("fr-FR")}.pdf`;
      const { data: newDoc, error: docErr } = await supabase.from("patient_documents").insert({
        patient_id: patientId, pro_id: pro.id, nom, type: "ordonnance", file_url: urlData.publicUrl,
      }).select().single();
      if (docErr) throw new Error(docErr.message);

      supabase.functions.invoke("send-push", { body: { user_id: patientId, title: "📄 Nouvelle ordonnance TSN", body: "Votre praticien a partagé une ordonnance", data: { type: "document" } } });
      window.open(urlData.publicUrl, "_blank");
      showToast("Ordonnance TSN générée");
      if (onSaved && newDoc) onSaved({ id: newDoc.id, nom: newDoc.nom, type: newDoc.type, file_url: newDoc.file_url });
      onClose();
      setSelections({}); setDuree(""); setRenouvellement("Non autorisé"); setNotes("");
    } catch (e) {
      const msg = e?.message || JSON.stringify(e);
      if (msg?.includes("Bucket")) showToast("Bucket « patient-documents » introuvable dans Supabase Storage", "error");
      else showToast(`Erreur : ${msg}`, "error");
    } finally {
      setGenerating(false);
    }
  }

  if (!open) return null;

  return (
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", display: "flex", alignItems: "safe center", justifyContent: "center", zIndex: 400, overflowY: "auto", padding: "24px" }}>
      <div style={{ background: "white", borderRadius: "24px", padding: "36px", width: "660px", maxHeight: "92vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: "22px", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", margin: 0 }}>💊 Ordon TSN</h2>
            <p style={{ color: "#90A4AE", fontSize: "13px", margin: "4px 0 0 0" }}>Ordonnance — Substituts nicotiniques · {nomComplet}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#5A6B72" }}>×</button>
        </div>

        {/* Sélection des produits TSN */}
        <div>
          <p style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "14px", marginBottom: "14px" }}>Produits à prescrire <span style={{ color: "#E65100" }}>*</span></p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {TSN_PRODUCTS.map(p => {
              const selected = selections[p.id] || [];
              const active = selected.length > 0;
              return (
                <div key={p.id} style={{ border: `1.5px solid ${active ? "#004649" : "#E4ECF2"}`, borderRadius: "14px", padding: "14px 18px", background: active ? "#E8F5EF" : "white", transition: "all 0.12s" }}>
                  <p style={{ fontWeight: "600", fontSize: "14px", color: "#2A3F4F", margin: "0 0 10px 0" }}>{p.label}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {p.doses.map(dose => {
                      const sel = selected.includes(dose);
                      return (
                        <button key={dose} type="button" onClick={() => toggleDose(p.id, dose)}
                          style={{ padding: "5px 14px", borderRadius: "999px", fontSize: "13px", fontWeight: sel ? "700" : "500", border: "none", cursor: "pointer",
                            background: sel ? "linear-gradient(135deg,#004649, #00363A)" : "#EAF3F8",
                            color: sel ? "white" : "#2A3F4F" }}>
                          {dose}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Aperçu */}
        {buildPrescription() && (
          <div style={{ background: "#EAF3F8", borderRadius: "12px", padding: "14px 18px" }}>
            <p style={{ fontSize: "12px", color: "#90A4AE", fontWeight: "600", marginBottom: "6px" }}>APERÇU PRESCRIPTION</p>
            <pre style={{ fontSize: "13px", color: "#2A3F4F", margin: 0, fontFamily: "inherit", whiteSpace: "pre-wrap" }}>{buildPrescription()}</pre>
          </div>
        )}

        {/* Durée + Renouvellement */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>Durée du traitement</label>
            <input value={duree} onChange={e => setDuree(e.target.value)} placeholder="Ex : 6 semaines" style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>Renouvellement</label>
            <select value={renouvellement} onChange={e => setRenouvellement(e.target.value)}
              style={{ ...inputStyle, backgroundColor: "white" }}>
              <option>Non autorisé</option>
              <option>1 fois</option>
              <option>2 fois</option>
              <option>3 fois</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={{ color: "#2A3F4F", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>
            Notes complémentaires <span style={{ color: "#aaa", fontWeight: "400" }}>(optionnel)</span>
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Instructions particulières, conseils de posologie…" rows={3}
            style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {/* Info signature */}
        <div style={{ background: "#F3F8FF", border: "1px solid #B7D7E8", borderRadius: "12px", padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>🔏</span>
          <p style={{ margin: 0, fontSize: "13px", color: "#2A3F4F" }}>
            Le PDF généré inclut une zone réservée à la <strong>signature électronique e-CPS</strong> ou au cachet du praticien.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ padding: "12px 28px", borderRadius: "12px", border: "1px solid #B7D7E8", background: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
            Annuler
          </button>
          <button onClick={generer} disabled={generating || !buildPrescription().trim()}
            style={{ padding: "12px 28px", borderRadius: "50px", border: "none",
              background: (generating || !buildPrescription().trim()) ? "#90A4AE" : "linear-gradient(135deg,#004649, #00363A)",
              color: "#F4EDE4", fontWeight: "600", cursor: (generating || !buildPrescription().trim()) ? "not-allowed" : "pointer",
              fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
            {generating ? "Génération…" : "📄 Générer le PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}
