"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const patientsInitiaux = [
  { id: 1, nom: "Diallo", prenom: "Amina" },
  { id: 2, nom: "Benouli", prenom: "Karim" },
  { id: 3, nom: "Chen", prenom: "Mei" },
  { id: 4, nom: "Martin", prenom: "Léa" },
  { id: 5, nom: "Rodriguez", prenom: "Sofia" },
  { id: 6, nom: "Schmidt", prenom: "Lucas" },
];

export default function Dashboard() {
  const [recherche, setRecherche] = useState("");
  const [patients, setPatients] = useState(patientsInitiaux);
  const [showModal, setShowModal] = useState(false);
  const [codePatient, setCodePatient] = useState("");
  const [nouveauNom, setNouveauNom] = useState("");
  const [nouveauPrenom, setNouveauPrenom] = useState("");

  const patientsFiltres = patients
    .filter((p) =>
      `${p.prenom} ${p.nom}`.toLowerCase().includes(recherche.toLowerCase())
    )
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const ajouterPatient = () => {
    if (!nouveauNom || !nouveauPrenom || !codePatient) return;
    const nouveau = {
      id: patients.length + 1,
      nom: nouveauNom,
      prenom: nouveauPrenom,
    };
    setPatients([...patients, nouveau]);
    setShowModal(false);
    setCodePatient("");
    setNouveauNom("");
    setNouveauPrenom("");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F5F5F5" }}>

      {/* Navbar */}
      <nav style={{ backgroundColor: "#B8D8E8", padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Image src="/logo.png" alt="Rêvade" width={130} height={48} />
        <div style={{ display: "flex", gap: "60px", alignItems: "center" }}>
          <Link href="/dashboard" style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "14px", letterSpacing: "1px", textDecoration: "none", borderBottom: "2px solid #1E3A4A", paddingBottom: "2px" }}>FICHES PATIENTS</Link>
          <Link href="/forum" style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px", letterSpacing: "1px", textDecoration: "none" }}>FORUM</Link>
          <Link href="/profil" style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "14px", letterSpacing: "1px", textDecoration: "none" }}>PROFIL</Link>
        </div>
      </nav>

      {/* Contenu */}
      <div style={{ padding: "40px 60px" }}>

        {/* Barre de recherche */}
        <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "14px 20px", marginBottom: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <input
            type="text"
            placeholder="Recherche ..."
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            style={{ width: "100%", outline: "none", border: "none", fontSize: "14px", color: "#1E3A4A", backgroundColor: "transparent" }}
          />
        </div>

        {/* Grille patients */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" }}>
          {patientsFiltres.map((p) => (
            <Link key={p.id} href={`/patients/${p.id}`} style={{ textDecoration: "none" }}>
              <div style={{ backgroundColor: "#DFF0EA", borderRadius: "16px", padding: "32px 16px", textAlign: "center", cursor: "pointer", height: "100px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#1E3A4A", fontWeight: "500", fontSize: "15px" }}>
                  {p.prenom}<br />{p.nom}
                </span>
              </div>
            </Link>
          ))}

          {/* Bouton ajouter */}
          <div
            onClick={() => setShowModal(true)}
            style={{ backgroundColor: "white", borderRadius: "16px", padding: "32px 16px", textAlign: "center", cursor: "pointer", height: "100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}
          >
            <span style={{ color: "#004649", fontSize: "32px", fontWeight: "300", lineHeight: 1 }}>+</span>
            <span style={{ color: "#004649", fontSize: "13px", fontWeight: "500" }}>Ajouter une<br />fiche patient</span>
          </div>
        </div>
      </div>

      {/* Modal ajout patient */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ backgroundColor: "white", borderRadius: "24px", padding: "48px", width: "420px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", textAlign: "center" }}>Nouveau patient</h2>

            <input
              type="text"
              placeholder="Prénom"
              value={nouveauPrenom}
              onChange={(e) => setNouveauPrenom(e.target.value)}
              style={{ border: "1px solid #B8D8E8", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", outline: "none", color: "#1E3A4A" }}
            />
            <input
              type="text"
              placeholder="Nom"
              value={nouveauNom}
              onChange={(e) => setNouveauNom(e.target.value)}
              style={{ border: "1px solid #B8D8E8", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", outline: "none", color: "#1E3A4A" }}
            />
            <input
              type="text"
              placeholder="Code patient"
              value={codePatient}
              onChange={(e) => setCodePatient(e.target.value)}
              style={{ border: "1px solid #B8D8E8", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", outline: "none", color: "#1E3A4A" }}
            />

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: "12px 32px", borderRadius: "12px", border: "1px solid #B8D8E8", backgroundColor: "white", color: "#1E3A4A", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
              >
                Annuler
              </button>
              <button
                onClick={ajouterPatient}
                style={{ padding: "12px 32px", borderRadius: "12px", border: "none", backgroundColor: "#004649", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}