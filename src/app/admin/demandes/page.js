"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import PageHeader from "@/components/PageHeader";

// MAQUETTE — page interne de l'équipe Rêvade pour valider les demandes d'accès pro.
// Données fictives : le prestataire branchera la table access_requests et la
// génération des codes dans invitation_codes.

const DEMANDES_DEMO = [
  { id: 1, prenom: "Claire", nom: "Martin", email: "c.martin@cabinet-sante.fr", telephone: "06 12 34 56 78", specialite: "Tabacologue", rpps: "10101234567", structure: "Cabinet des Lilas", ville: "Lyon", message: "Je suis 40 patients en sevrage, dont beaucoup de vapoteurs.", date: "2026-10-11T09:24:00", statut: "en_attente" },
  { id: 2, prenom: "Karim", nom: "Benali", email: "k.benali@chu-exemple.fr", telephone: "", specialite: "Addictologue", rpps: "10109876543", structure: "CHU — Service d'addictologie", ville: "Marseille", message: "", date: "2026-10-10T16:02:00", statut: "en_attente" },
  { id: 3, prenom: "Sophie", nom: "Durand", email: "sophie.durand@mail.fr", telephone: "07 98 76 54 32", specialite: "Infirmier(ère)", rpps: "10105556667", structure: "", ville: "Nantes", message: "Infirmière Asalée.", date: "2026-10-08T11:45:00", statut: "validee", code: "RVD-8K2PQ" },
  { id: 4, prenom: "Marc", nom: "Petit", email: "marc.petit@exemple.com", telephone: "", specialite: "Autre", rpps: "123", structure: "", ville: "Paris", message: "Coach bien-être", date: "2026-10-07T08:10:00", statut: "refusee" },
];

const STATUTS = {
  en_attente: { label: "En attente", bg: "#FFF6EC", color: "#E65100" },
  validee: { label: "Validée", bg: "#DCEEE6", color: "#004649" },
  refusee: { label: "Refusée", bg: "#FDECEC", color: "#C62828" },
};

function genererCode() {
  const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "RVD-" + Array.from({ length: 5 }, () => c[Math.floor(Math.random() * c.length)]).join("");
}

export default function AdminDemandes() {
  const [demandes, setDemandes] = useState(DEMANDES_DEMO);
  const [filtre, setFiltre] = useState("en_attente");
  const [sel, setSel] = useState(DEMANDES_DEMO[0]);
  const [copie, setCopie] = useState(false);

  const liste = useMemo(() => demandes.filter((d) => filtre === "toutes" || d.statut === filtre), [demandes, filtre]);
  const compte = (s) => demandes.filter((d) => d.statut === s).length;

  function maj(id, patch) {
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
    setSel((s) => (s?.id === id ? { ...s, ...patch } : s));
  }

  const lien = sel?.code && typeof window !== "undefined" ? `${window.location.origin}/inscription?code=${sel.code}` : "";
  const message = sel?.code
    ? `Bonjour ${sel.prenom},\n\nVotre profil a bien été vérifié : bienvenue dans le réseau Rêvade !\n\nVotre code d'accès personnel : ${sel.code}\nCréez votre compte en cliquant ici : ${lien}\n\nÀ très vite,\nL'équipe Rêvade`
    : "";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "#004649" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "14px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <Image src="/logo-white.svg" alt="Rêvade" width={100} height={36} />
            <span style={{ color: "#004649", background: "#A5C9B9", borderRadius: "50px", padding: "4px 12px", fontSize: "12px", fontWeight: "700" }}>Admin</span>
          </div>
          <span style={{ color: "rgba(244,237,228,0.7)", fontSize: "13px" }}>Espace interne équipe Rêvade · maquette</span>
        </div>
      </nav>

      <div style={{ padding: "40px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>
        <PageHeader eyebrow="Administration" title="Demandes d'accès pro" subtitle="Vérifiez le profil de chaque professionnel, puis envoyez-lui son code d'accès." />

        {/* Compteurs / filtres */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
          {[["en_attente", "À traiter"], ["validee", "Validées"], ["refusee", "Refusées"], ["toutes", "Toutes"]].map(([id, txt]) => {
            const on = filtre === id;
            return (
              <button key={id} onClick={() => setFiltre(id)} style={{
                display: "inline-flex", alignItems: "center", gap: "8px", padding: "9px 16px", borderRadius: "50px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                background: on ? "#004649" : "#FFFFFF", color: on ? "#F4EDE4" : "#004649", border: on ? "1px solid #004649" : "1px solid rgba(0,70,73,0.12)",
              }}>
                {txt}
                <span style={{ background: on ? "rgba(244,237,228,0.18)" : "#EAF3F8", borderRadius: "50px", padding: "1px 8px", fontSize: "12px" }}>
                  {id === "toutes" ? demandes.length : compte(id)}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1fr) minmax(380px, 1.4fr)", gap: "24px", alignItems: "start" }}>

          {/* Liste */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {liste.length === 0 && (
              <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "32px", textAlign: "center", color: "#5A6B72", fontSize: "14px" }}>Aucune demande ici 🎉</div>
            )}
            {liste.map((d) => {
              const on = sel?.id === d.id;
              const st = STATUTS[d.statut];
              return (
                <button key={d.id} onClick={() => { setSel(d); setCopie(false); }} style={{
                  textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "14px",
                  background: "#FFFFFF", borderRadius: "20px", padding: "16px 18px",
                  border: on ? "1px solid #004649" : "1px solid rgba(0,70,73,0.08)",
                  boxShadow: on ? "0 12px 30px rgba(0,70,73,0.12)" : "0 8px 24px rgba(0,70,73,0.04)",
                }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "16px", flexShrink: 0, background: "linear-gradient(135deg, #A5C9B9, #B7D7E8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#004649", fontWeight: "700", fontSize: "14px" }}>
                    {d.prenom[0]}{d.nom[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#004649", fontWeight: "600", fontSize: "15px" }}>{d.prenom} {d.nom}</p>
                    <p style={{ color: "#5A6B72", fontSize: "12px" }}>{d.specialite} · {d.ville || "—"}</p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    <span style={{ background: st.bg, color: st.color, borderRadius: "50px", padding: "3px 10px", fontSize: "11px", fontWeight: "700" }}>{st.label}</span>
                    <span style={{ color: "#90A4AE", fontSize: "11px" }}>{new Date(d.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Détail */}
          {sel && (
            <div style={{ background: "#FFFFFF", borderRadius: "24px", padding: "28px", border: "1px solid rgba(0,70,73,0.08)", boxShadow: "0 8px 24px rgba(0,70,73,0.05)", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "6px" }}>Demande d&apos;accès</p>
                  <h2 style={{ color: "#004649", fontWeight: "600", fontSize: "24px" }}>{sel.prenom} {sel.nom}</h2>
                  <p style={{ color: "#5A6B72", fontSize: "13px" }}>Reçue le {new Date(sel.date).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span style={{ background: STATUTS[sel.statut].bg, color: STATUTS[sel.statut].color, borderRadius: "50px", padding: "5px 12px", fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap" }}>{STATUTS[sel.statut].label}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
                {[["Spécialité", sel.specialite], ["RPPS", sel.rpps], ["Email", sel.email], ["Téléphone", sel.telephone], ["Structure", sel.structure], ["Ville", sel.ville]].map(([k, v]) => (
                  <div key={k} style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,70,73,0.08)", minWidth: 0 }}>
                    <p style={{ color: "#5A6B72", fontSize: "12px" }}>{k}</p>
                    <p style={{ color: "#004649", fontSize: "14px", fontWeight: "600", overflowWrap: "anywhere" }}>{v || "—"}</p>
                  </div>
                ))}
              </div>

              {sel.message && (
                <div style={{ background: "#F7FAFC", borderRadius: "18px", padding: "14px 18px" }}>
                  <p style={{ color: "#5A6B72", fontSize: "12px", marginBottom: "4px" }}>Message</p>
                  <p style={{ color: "#2A3F4F", fontSize: "14px", lineHeight: 1.6 }}>{sel.message}</p>
                </div>
              )}

              <a href="https://annuaire.sante.fr" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", background: "#EAF3F8", borderRadius: "18px", padding: "14px 18px" }}>
                <span style={{ fontSize: "20px" }}>🔎</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", color: "#004649", fontWeight: "600", fontSize: "14px" }}>Vérifier le RPPS {sel.rpps}</span>
                  <span style={{ display: "block", color: "#5A6B72", fontSize: "12px" }}>Annuaire Santé (annuaire.sante.fr)</span>
                </span>
                <span style={{ color: "#004649", fontWeight: "600", fontSize: "13px" }}>Ouvrir ↗</span>
              </a>

              {sel.statut === "en_attente" && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button onClick={() => maj(sel.id, { statut: "validee", code: genererCode() })} style={{ flex: 1, background: "#004649", color: "#F4EDE4", border: "none", borderRadius: "50px", padding: "14px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer", boxShadow: "0 10px 26px rgba(0,70,73,0.25)" }}>
                    ✓ Valider et générer le code
                  </button>
                  <button onClick={() => maj(sel.id, { statut: "refusee" })} style={{ background: "#FFFFFF", color: "#C62828", border: "1px solid #FFCDD2", borderRadius: "50px", padding: "14px 20px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                    Refuser
                  </button>
                </div>
              )}

              {sel.statut === "validee" && sel.code && (
                <div style={{ background: "#F1F8F5", border: "1px solid #A5C9B9", borderRadius: "20px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <span style={{ color: "#5A6B72", fontSize: "13px" }}>Code d&apos;accès</span>
                    <span style={{ color: "#004649", fontWeight: "700", fontSize: "20px", letterSpacing: "3px" }}>{sel.code}</span>
                  </div>
                  <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "13px", color: "#2A3F4F", background: "#FFFFFF", borderRadius: "14px", padding: "14px 16px", lineHeight: 1.6, margin: 0 }}>{message}</pre>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => { navigator.clipboard.writeText(message); setCopie(true); setTimeout(() => setCopie(false), 1800); }} style={{ background: "#004649", color: "#F4EDE4", border: "none", borderRadius: "50px", padding: "11px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                      {copie ? "✓ Message copié" : "Copier le message"}
                    </button>
                    <a href={`mailto:${sel.email}?subject=${encodeURIComponent("Votre accès Rêvade Pro")}&body=${encodeURIComponent(message)}`} style={{ textDecoration: "none", background: "#FFFFFF", color: "#004649", border: "1px solid rgba(0,70,73,0.20)", borderRadius: "50px", padding: "11px 20px", fontSize: "13px", fontWeight: "600" }}>
                      Ouvrir dans ma messagerie ✉️
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
