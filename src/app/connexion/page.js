'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Connexion() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState(null); // 'sent' | 'error' | null
  const [resetLoading, setResetLoading] = useState(false);

  function parseAuthError(msg) {
    if (!msg) return 'Erreur de connexion.';
    if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
    if (msg.includes('Email not confirmed')) return 'Veuillez confirmer votre email avant de vous connecter.';
    if (msg.includes('Too many requests')) return 'Trop de tentatives. Attendez quelques minutes.';
    if (msg.includes('User not found')) return 'Aucun compte associé à cet email.';
    return 'Email ou mot de passe incorrect.';
  }

  async function handleLogin(e) {
    e.preventDefault();
    // Accès libre : on entre directement, identifiants facultatifs
    router.push('/accueil');
  }

  async function handleReset(e) {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetStatus(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
      redirectTo: `${window.location.origin}/connexion`,
    });
    setResetLoading(false);
    setResetStatus(error ? 'error' : 'sent');
  }

  const inputStyle = {
    display: "flex", alignItems: "center", gap: "12px",
    border: "1px solid rgba(0,70,73,0.14)", borderRadius: "999px",
    paddingTop: "14px", paddingBottom: "14px",
    paddingLeft: "20px", paddingRight: "20px",
    background: "#F7FAFC",
  };

  return (
    <main className="login-wrap" style={{ minHeight: "100vh", display: "flex", background: "#EAF3F8" }}>
      <style>{`
        .login-left, .login-right { flex: 1 1 0; min-width: 0; min-height: 100vh; }
        @media (max-width: 900px) {
          .login-wrap { flex-direction: column; }
          .login-left, .login-right { min-height: auto; }
          .login-right { order: 1; padding: 32px 16px !important; }
          .login-left { order: 2; }
          .login-pitch { padding: 32px 0 !important; }
        }
      `}</style>

      {/* ── Panneau gauche : continuité avec revade.fr ── */}
      <section className="login-left" style={{
        position: "relative", overflow: "hidden",
        background: "#004649", color: "#F4EDE4",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "36px clamp(28px, 5vw, 72px)",
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 50% 45% at 15% 10%, rgba(183,215,232,0.20), transparent 70%), radial-gradient(ellipse 45% 50% at 90% 90%, rgba(165,201,185,0.16), transparent 70%)" }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <a href="https://revade.fr" style={{ display: "flex" }}>
            <Image src="/logo-white.svg" alt="Rêvade" width={112} height={40} priority />
          </a>
          <a href="https://revade.fr" style={{ color: "rgba(244,237,228,0.75)", fontSize: "13px", fontWeight: "500", textDecoration: "none", border: "1px solid rgba(244,237,228,0.22)", borderRadius: "50px", padding: "8px 16px" }}>
            ← Retour sur revade.fr
          </a>
        </div>

        <div className="login-pitch" style={{ position: "relative", maxWidth: "520px", padding: "48px 0" }}>
          <p style={{ color: "#A5C9B9", fontWeight: "300", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px" }}>
            Espace professionnels de santé
          </p>
          <h1 style={{ fontWeight: "700", fontSize: "clamp(32px, 3.6vw, 48px)", lineHeight: 1.12, letterSpacing: "-0.02em", color: "#F4EDE4", marginBottom: "18px" }}>
            Accompagnez le sevrage de vos patients, au quotidien.
          </h1>
          <p style={{ color: "rgba(244,237,228,0.78)", fontSize: "16px", fontWeight: "300", lineHeight: 1.7, marginBottom: "28px" }}>
            Retrouvez les données de vos patients issues de l&apos;app Rêvade, vos rendez-vous, vos échanges et vos outils cliniques.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              ["👥", "Suivi des consommations et de l'évolution de vos patients"],
              ["📅", "Agenda et demandes de rendez-vous"],
              ["🔒", "Messagerie privée et sécurisée"],
            ].map(([icon, txt]) => (
              <div key={txt} style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "14px", flexShrink: 0, background: "rgba(244,237,228,0.10)", border: "1px solid rgba(244,237,228,0.16)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px" }}>{icon}</span>
                <span style={{ color: "rgba(244,237,228,0.88)", fontSize: "14px" }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: "relative", color: "rgba(244,237,228,0.6)", fontSize: "13px" }}>
          Vous êtes un particulier ?{" "}
          <a href="https://revade.fr" style={{ color: "#A5C9B9", fontWeight: "600", textDecoration: "none" }}>Votre espace est sur l&apos;app Rêvade →</a>
        </p>
      </section>

      {/* ── Panneau droit : connexion ── */}
      <section className="login-right" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", background: "linear-gradient(160deg, #B7D7E8 0%, #D3E7F1 50%, #EAF3F8 100%)" }}>

        {showReset ? (
          /* ── Formulaire de réinitialisation ── */
          <form onSubmit={handleReset} style={{
            background: "#FFFFFF",
            borderRadius: "28px", width: "100%", maxWidth: "460px",
            paddingTop: "44px", paddingBottom: "44px",
            paddingLeft: "44px", paddingRight: "44px",
            display: "flex", flexDirection: "column", gap: "22px",
            boxShadow: "0 30px 70px rgba(0,70,73,0.14)",
            border: "1px solid rgba(0,70,73,0.12)",
          }}>
            <button type="button" onClick={() => { setShowReset(false); setResetStatus(null); setResetEmail(''); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#004649", fontSize: "13px", fontWeight: "600", textAlign: "left", padding: 0, display: "flex", alignItems: "center", gap: "6px" }}>
              ← Retour
            </button>
            <h2 style={{ color: "#004649", fontSize: "24px", fontWeight: "600", textAlign: "center", margin: 0 }}>
              Mot de passe oublié
            </h2>
            <p style={{ color: "#5A6B72", fontSize: "13px", textAlign: "center", margin: 0, lineHeight: "1.6" }}>
              Saisissez votre email professionnel. Un lien de réinitialisation vous sera envoyé.
            </p>

            {resetStatus !== 'sent' && (
              <div style={inputStyle}>
                <span style={{ color: "#004649" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </span>
                <input
                  type="email" placeholder="Email professionnel"
                  value={resetEmail} onChange={e => setResetEmail(e.target.value)} required
                  style={{ flex: 1, outline: "none", fontSize: "14px", backgroundColor: "transparent", color: "#2A3F4F", border: "none" }}
                />
              </div>
            )}

            {resetStatus === 'sent' && (
              <div style={{ background: "#E8F5EF", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
                <p style={{ fontSize: "28px", marginBottom: "8px" }}>✉️</p>
                <p style={{ color: "#004649", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>Email envoyé !</p>
                <p style={{ color: "#5A6B72", fontSize: "13px", lineHeight: "1.6" }}>
                  Vérifiez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
                </p>
              </div>
            )}

            {resetStatus === 'error' && (
              <p style={{ color: "#e53e3e", fontSize: "13px", textAlign: "center", margin: 0 }}>
                Impossible d&apos;envoyer l&apos;email. Vérifiez l&apos;adresse saisie.
              </p>
            )}

            {resetStatus !== 'sent' && (
              <div style={{ display: "flex", justifyContent: "center" }}>
                <button type="submit" disabled={resetLoading} style={{
                  background: resetLoading ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                  color: "#F4EDE4", fontWeight: "600", fontSize: "16px",
                  paddingTop: "16px", paddingBottom: "16px",
                  paddingLeft: "48px", paddingRight: "48px",
                  borderRadius: "50px", border: "none",
                  cursor: resetLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 14px 38px rgba(0,70,73,0.3)",
                }}>
                  {resetLoading ? "Envoi en cours…" : "Envoyer le lien"}
                </button>
              </div>
            )}
          </form>
        ) : (
          /* ── Formulaire de connexion ── */
          <form onSubmit={handleLogin} noValidate style={{
            background: "#FFFFFF",
            borderRadius: "28px", width: "100%", maxWidth: "460px",
            paddingTop: "44px", paddingBottom: "44px",
            paddingLeft: "44px", paddingRight: "44px",
            display: "flex", flexDirection: "column", gap: "22px",
            boxShadow: "0 30px 70px rgba(0,70,73,0.14)",
            border: "1px solid rgba(0,70,73,0.12)",
          }}>
            <p style={{ color: "#5A6B72", fontSize: "12px", fontWeight: "400", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", margin: "0 0 -14px" }}>
              Espace adhérent pro
            </p>
            <h2 style={{ color: "#004649", fontSize: "28px", fontWeight: "600", textAlign: "center", marginBottom: "8px", letterSpacing: "-0.01em" }}>
              Connexion
            </h2>

            <div style={inputStyle}>
              <span style={{ color: "#004649" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
              </span>
              <input
                type="email" placeholder="Email professionnel"
                value={email} onChange={e => setEmail(e.target.value)} required
                style={{ flex: 1, outline: "none", fontSize: "14px", backgroundColor: "transparent", color: "#2A3F4F", border: "none" }}
              />
            </div>

            <div style={inputStyle}>
              <span style={{ color: "#004649" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              </span>
              <input
                type="password" placeholder="Mot de passe"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={{ flex: 1, outline: "none", fontSize: "14px", backgroundColor: "transparent", color: "#2A3F4F", border: "none" }}
              />
            </div>

            <div style={{ textAlign: "right", marginTop: "-12px" }}>
              <button type="button" onClick={() => { setShowReset(true); setResetEmail(email); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#004649", fontSize: "13px", fontWeight: "600", textDecoration: "underline", padding: 0 }}>
                Mot de passe oublié ?
              </button>
            </div>

            {error && (
              <p style={{ color: "#e53e3e", fontSize: "13px", textAlign: "center", margin: 0, background: "#FFF5F5", borderRadius: "10px", padding: "10px 16px", border: "1px solid #FED7D7" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "center", marginTop: "4px" }}>
              <button type="submit" disabled={loading} style={{
                background: loading ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                color: "#F4EDE4", fontWeight: "600", fontSize: "16px",
                paddingTop: "16px", paddingBottom: "16px",
                paddingLeft: "64px", paddingRight: "64px",
                borderRadius: "50px", border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 14px 38px rgba(0,70,73,0.3)",
              }}>
                {loading ? "Connexion…" : "Se connecter"}
              </button>
            </div>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#5A6B72", margin: 0 }}>
              Pas encore de compte pro ?{" "}
              <Link href="/inscription" style={{ color: "#004649", fontWeight: "600", textDecoration: "none" }}>
                Demander un accès
              </Link>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
