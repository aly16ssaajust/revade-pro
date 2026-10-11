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

      <div style={{ padding: "40px 60px" }}>
        <div style={{
          background: "#FFFFFF",
          borderRadius: "16px", padding: "14px 20px", marginBottom: "32px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}>
          <input
            type="text" placeholder="Recherche ..."
            value={recherche} onChange={(e) => setRecherche(e.target.value)}
            style={{ width: "100%", outline: "none", border: "none", fontSize: "14px", color: "#2A3F4F", backgroundColor: "transparent" }}
          />
        </div>

        {loadingPatients ? (
          <p style={{ color: "#888", fontSize: "14px" }}>Chargement des patients...</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {patientsFiltres.map((p) => {
              const initiales = `${(p.prenom || "")[0] || ""}${(p.nom || "")[0] || ""}`.toUpperCase();
              return (
                <Link key={p.id} href={`/patients/${p.id}`} style={{ textDecoration: "none" }}>
                  <div
                    onMouseEnter={() => setHovered(p.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      background: "white",
                      borderRadius: "14px", padding: "14px 20px",
                      cursor: "pointer",
                      display: "flex", alignItems: "center", gap: "16px",
                      boxShadow: hovered === p.id
                        ? "0 6px 20px rgba(0,70,73,0.12)"
                        : "0 2px 8px rgba(0,0,0,0.06)",
                      border: hovered === p.id ? "1.5px solid #A5C9B9" : "1.5px solid #EEF2F5",
                      transform: hovered === p.id ? "translateX(4px)" : "translateX(0)",
                      transition: "all 0.18s ease",
                    }}>
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>{initiales}</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: "#2A3F4F", fontWeight: "700", fontSize: "15px" }}>{p.prenom} {p.nom}</p>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#90A4AE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </Link>
              );
            })}

            <div
              onClick={() => setShowModal(true)}
              onMouseEnter={() => setHovered("add")}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === "add" ? "#F0F9F7" : "white",
                borderRadius: "14px", padding: "14px 20px",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: "16px",
                boxShadow: hovered === "add" ? "0 6px 20px rgba(0,70,73,0.1)" : "0 2px 8px rgba(0,0,0,0.06)",
                border: hovered === "add" ? "1.5px dashed #004649" : "1.5px dashed #B7D7E8",
                transition: "all 0.18s ease",
              }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", flexShrink: 0, background: "#E8F5EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#004649", fontSize: "24px", fontWeight: "300", lineHeight: 1 }}>+</span>
              </div>
              <span style={{ color: "#004649", fontSize: "14px", fontWeight: "600" }}>Ajouter une fiche patient</span>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: "24px", padding: "48px", width: "440px",
            display: "flex", flexDirection: "column", gap: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", textAlign: "center" }}>Nouveau patient</h2>
            <p style={{ color: "#888", fontSize: "13px", textAlign: "center", margin: "-8px 0 0", lineHeight: "1.5" }}>
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
                style={{ padding: "12px 32px", borderRadius: "12px", border: "1px solid #B7D7E8", backgroundColor: "white", color: "#2A3F4F", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
              >Annuler</button>
              <button
                onClick={ajouterPatient}
                disabled={loadingAdd || !codePatient.trim()}
                style={{
                  padding: "12px 32px", borderRadius: "12px", border: "none",
                  background: (loadingAdd || !codePatient.trim()) ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                  color: "white", fontWeight: "600",
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
