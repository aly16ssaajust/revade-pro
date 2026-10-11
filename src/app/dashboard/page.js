"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useProProfile } from "@/lib/useProProfile";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";

export default function Dashboard() {
  const { pro } = useProProfile();
  const [patients, setPatients] = useState([]);
  const [recherche, setRecherche] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [codePatient, setCodePatient] = useState("");
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [errorAdd, setErrorAdd] = useState("");
  const [hovered, setHovered] = useState(null);
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    if (!pro) return;
    loadPatients();
  }, [pro]);

  async function loadPatients() {
    setLoadingPatients(true);
    const { data: links } = await supabase
      .from("patient_professional_links")
      .select("patient_id")
      .eq("professional_id", pro.id);

    if (!links || links.length === 0) {
      setPatients([]);
      setLoadingPatients(false);
      return;
    }

    const patientIds = links.map((l) => l.patient_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, prenom, nom, pseudo")
      .in("id", patientIds);

    setPatients(profiles || []);
    setLoadingPatients(false);
  }

  const patientsFiltres = patients
    .filter((p) =>
      `${p.prenom || ""} ${p.nom || ""}`.toLowerCase().includes(recherche.toLowerCase())
    )
    .sort((a, b) => (a.nom || "").localeCompare(b.nom || ""));

  async function ajouterPatient() {
    const uuid = codePatient.trim();
    if (!uuid || !pro) return;
    setLoadingAdd(true);
    setErrorAdd("");

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .eq("id", uuid)
      .single();

    if (profileError || !profile) {
      setErrorAdd("Identifiant patient introuvable.");
      setLoadingAdd(false);
      return;
    }

    const { error: linkError } = await supabase
      .from("patient_professional_links")
      .insert({ professional_id: pro.id, patient_id: uuid });

    if (linkError) {
      setErrorAdd(
        linkError.code === "23505"
          ? "Ce patient est déjà dans votre liste."
          : "Erreur lors de l'ajout du patient."
      );
      setLoadingAdd(false);
      return;
    }

    setPatients((prev) => [...prev, profile]);
    setShowModal(false);
    setCodePatient("");
    setLoadingAdd(false);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />

      <div style={{ padding: "40px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>

        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", flexWrap: "wrap", marginBottom: "28px" }}>
          <div>
            <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "10px" }}>Suivi</p>
            <h1 style={{ color: "#004649", fontWeight: "600", fontSize: "32px", letterSpacing: "-0.02em" }}>
              Fiches patients
              {!loadingPatients && (
                <span style={{ marginLeft: "12px", verticalAlign: "middle", fontSize: "13px", fontWeight: "600", color: "#004649", background: "#FFFFFF", border: "1px solid rgba(0,70,73,0.12)", borderRadius: "50px", padding: "4px 12px" }}>
                  {patientsFiltres.length}
                </span>
              )}
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: "10px", width: "320px",
              background: "#FFFFFF", borderRadius: "50px", padding: "12px 20px",
              border: "1px solid rgba(0,70,73,0.10)", boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A6B72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                type="text" placeholder="Rechercher un patient…"
                value={recherche} onChange={(e) => setRecherche(e.target.value)}
                style={{ flex: 1, outline: "none", border: "none", fontSize: "14px", color: "#2A3F4F", backgroundColor: "transparent" }}
              />
            </div>
            <button onClick={() => setShowModal(true)} style={{
              background: "#004649", color: "#F4EDE4", border: "none", borderRadius: "50px",
              padding: "13px 24px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              boxShadow: "0 10px 26px rgba(0,70,73,0.25)", whiteSpace: "nowrap",
            }}>
              + Nouveau patient
            </button>
          </div>
        </div>

        {loadingPatients ? (
          <p style={{ color: "#5A6B72", fontSize: "14px" }}>Chargement des patients...</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "18px" }}>
            {patientsFiltres.map((p) => {
              const initiales = `${(p.prenom || "")[0] || ""}${(p.nom || "")[0] || ""}`.toUpperCase();
              const h = hovered === p.id;
              return (
                <Link key={p.id} href={`/patients/${p.id}`} style={{ textDecoration: "none" }}>
                  <div
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: "#FFFFFF", borderRadius: "24px", padding: "22px",
                      cursor: "pointer", height: "100%",
                      display: "flex", alignItems: "center", gap: "16px",
                      border: h ? "1px solid rgba(0,70,73,0.22)" : "1px solid rgba(0,70,73,0.08)",
                      boxShadow: h ? "0 24px 50px rgba(0,70,73,0.14)" : "0 8px 24px rgba(0,70,73,0.05)",
                      transform: h ? "translateY(-3px)" : "translateY(0)",
                      transition: "all 0.25s ease",
                    }}>
                    <div style={{
                      width: "52px", height: "52px", borderRadius: "18px", flexShrink: 0,
                      background: "linear-gradient(135deg, #A5C9B9 0%, #B7D7E8 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "#004649", fontWeight: "700", fontSize: "16px" }}>{initiales}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, color: "#004649", fontWeight: "600", fontSize: "15px", lineHeight: 1.35, overflowWrap: "anywhere" }}>{p.prenom} {p.nom}</p>
                      <p style={{ margin: "3px 0 0", color: "#5A6B72", fontSize: "12px" }}>Voir la fiche</p>
                    </div>
                    <div style={{
                      width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                      background: h ? "#004649" : "#EAF3F8", color: h ? "#F4EDE4" : "#004649",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.25s ease", transform: h ? "rotate(-45deg)" : "none",
                    }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </div>
                  </div>
                </Link>
              );
            })}

            <div
              onClick={() => setShowModal(true)}
              onMouseEnter={() => setHovered("add")}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === "add" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)",
                borderRadius: "24px", padding: "22px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "16px",
                border: hovered === "add" ? "1.5px dashed #004649" : "1.5px dashed rgba(0,70,73,0.25)",
                transition: "all 0.25s ease",
              }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "18px", flexShrink: 0, background: "#DCEEE6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#004649", fontSize: "26px", fontWeight: "300", lineHeight: 1 }}>+</span>
              </div>
              <span style={{ color: "#004649", fontSize: "14px", fontWeight: "600" }}>Ajouter une fiche patient</span>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "safe center", justifyContent: "center", zIndex: 400, overflowY: "auto", padding: "24px" }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px", padding: "48px", width: "440px",
            display: "flex", flexDirection: "column", gap: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", textAlign: "center" }}>Nouveau patient</h2>
            <p style={{ color: "#5A6B72", fontSize: "13px", textAlign: "center", margin: "-8px 0 0", lineHeight: "1.5" }}>
              Saisissez l&apos;identifiant unique du patient,<br />visible dans l&apos;application Rêvade → Profil
            </p>
            <input
              type="text"
              placeholder="Identifiant patient (UUID)"
              value={codePatient}
              onChange={(e) => { setCodePatient(e.target.value); setErrorAdd(""); }}
              style={{
                border: "1px solid #B7D7E8", borderRadius: "12px", padding: "12px 20px",
                fontSize: "13px", outline: "none", color: "#2A3F4F",
                fontFamily: "monospace", letterSpacing: "0.5px",
              }}
            />
            {errorAdd && (
              <p style={{ color: "#e53e3e", fontSize: "13px", textAlign: "center", margin: "-8px 0 0" }}>{errorAdd}</p>
            )}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => { setShowModal(false); setCodePatient(""); setErrorAdd(""); }}
                style={{ padding: "12px 32px", borderRadius: "50px", border: "1px solid rgba(0,70,73,0.15)", backgroundColor: "white", color: "#004649", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
              >Annuler</button>
              <button
                onClick={ajouterPatient}
                disabled={loadingAdd || !codePatient.trim()}
                style={{
                  padding: "12px 32px", borderRadius: "50px", border: "none",
                  background: (loadingAdd || !codePatient.trim()) ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                  color: "#F4EDE4", fontWeight: "600",
                  cursor: (loadingAdd || !codePatient.trim()) ? "not-allowed" : "pointer",
                  fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)",
                }}
              >{loadingAdd ? "Vérification..." : "Ajouter"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
