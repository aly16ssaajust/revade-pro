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
  const [hovered, setHovered] = useState(null);

  const patientsFiltres = patients
    .filter((p) => `${p.prenom} ${p.nom}`.toLowerCase().includes(recherche.toLowerCase()))
    .sort((a, b) => a.nom.localeCompare(b.nom));

  const ajouterPatient = () => {
    if (!nouveauNom || !nouveauPrenom || !codePatient) return;
    setPatients([...patients, { id: patients.length + 1, nom: nouveauNom, prenom: nouveauPrenom }]);
    setShowModal(false);
    setCodePatient(""); setNouveauNom(""); setNouveauPrenom("");
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8" }}>

      {/* Navbar 3D */}
      <nav style={{
        background: "linear-gradient(135deg, #C8E6F0 0%, #A8D4E6 100%)",
        padding: "16px 48px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
        borderBottom: "1px solid rgba(255,255,255,0.4)",
      }}>
        <Image src="/logo.png" alt="Rêvade" width={130} height={48} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {[
            { href: "/dashboard", label: "FICHES PATIENTS", actif: true },
            { href: "/forum", label: "FORUM", actif: false },
            { href: "/profil", label: "PROFIL", actif: false },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "10px 20px",
                borderRadius: "10px",
                fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px",
                color: item.actif ? "white" : "#1E3A4A",
                background: item.actif
                  ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)",
                boxShadow: item.actif
                  ? "0 4px 8px rgba(0,70,73,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                  : "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}>
                {item.label}
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Contenu */}
      <div style={{ padding: "40px 60px" }}>

        {/* Barre de recherche */}
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          borderRadius: "16px", padding: "14px 20px", marginBottom: "32px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}>
          <input
            type="text" placeholder="Recherche ..."
            value={recherche} onChange={(e) => setRecherche(e.target.value)}
            style={{ width: "100%", outline: "none", border: "none", fontSize: "14px", color: "#1E3A4A", backgroundColor: "transparent" }}
          />
        </div>

        {/* Grille patients */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "20px" }}>
          {patientsFiltres.map((p) => (
            <Link key={p.id} href={`/patients/${p.id}`} style={{ textDecoration: "none" }}>
              <div
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "linear-gradient(135deg, #E8F5EF 0%, #C8E6D4 100%)",
                  borderRadius: "16px", padding: "32px 16px", textAlign: "center",
                  cursor: "pointer", height: "100px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: hovered === p.id
                    ? "0 8px 20px rgba(0,70,73,0.2), inset 0 1px 0 rgba(255,255,255,0.8)"
                    : "0 4px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  transform: hovered === p.id ? "translateY(-3px)" : "translateY(0)",
                  transition: "all 0.2s ease",
                }}>
                <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>
                  {p.prenom}<br />{p.nom}
                </span>
              </div>
            </Link>
          ))}

          {/* Bouton ajouter */}
          <div
            onClick={() => setShowModal(true)}
            onMouseEnter={() => setHovered("add")}
            onMouseLeave={() => setHovered(null)}
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)",
              borderRadius: "16px", padding: "32px 16px", textAlign: "center",
              cursor: "pointer", height: "100px",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px",
              boxShadow: hovered === "add"
                ? "0 8px 20px rgba(0,70,73,0.15), inset 0 1px 0 rgba(255,255,255,0.9)"
                : "0 4px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
              border: "1px solid rgba(255,255,255,0.6)",
              transform: hovered === "add" ? "translateY(-3px)" : "translateY(0)",
              transition: "all 0.2s ease",
            }}>
            <span style={{ color: "#004649", fontSize: "28px", fontWeight: "300", lineHeight: 1 }}>+</span>
            <span style={{ color: "#004649", fontSize: "12px", fontWeight: "600" }}>Ajouter une<br />fiche patient</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{
            background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
            borderRadius: "24px", padding: "48px", width: "420px",
            display: "flex", flexDirection: "column", gap: "20px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.9)",
          }}>
            <h2 style={{ color: "#004649", fontWeight: "700", fontSize: "20px", textAlign: "center" }}>Nouveau patient</h2>
            {[
              { placeholder: "Prénom", value: nouveauPrenom, onChange: setNouveauPrenom },
              { placeholder: "Nom", value: nouveauNom, onChange: setNouveauNom },
              { placeholder: "Code patient", value: codePatient, onChange: setCodePatient },
            ].map((field) => (
              <input key={field.placeholder} type="text" placeholder={field.placeholder} value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                style={{ border: "1px solid #B8D8E8", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", outline: "none", color: "#1E3A4A" }}
              />
            ))}
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "8px" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 32px", borderRadius: "12px", border: "1px solid #B8D8E8", backgroundColor: "white", color: "#1E3A4A", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>Annuler</button>
              <button onClick={ajouterPatient} style={{ padding: "12px 32px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", fontWeight: "600", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}