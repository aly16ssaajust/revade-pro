'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// MODE_DEMO : site vitrine. Les formulaires affichent directement l'écran de succès,
// sans rien enregistrer. Le prestataire passera à false une fois le backend branché
// (table access_requests pour les demandes, invitation_codes pour les codes).
const MODE_DEMO = true;

const SPECIALITES = [
  "Tabacologue", "Addictologue", "Médecin généraliste", "Infirmier(ère)", "Sage-femme",
  "Pharmacien(ne)", "Psychologue", "Psychiatre", "Cardiologue", "Pneumologue", "Autre",
];

const field = {
  width: "100%", border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px",
  padding: "13px 16px", fontSize: "14px", color: "#2A3F4F", outline: "none",
  background: "#F7FAFC", boxSizing: "border-box", fontFamily: "inherit",
};

const label = { display: "block", color: "#2A3F4F", fontSize: "13px", fontWeight: "600", marginBottom: "6px" };

const sectionLabel = {
  color: "#004649", fontSize: "12px", fontWeight: "500",
  letterSpacing: "0.18em", textTransform: "uppercase", margin: "10px 0 2px",
};

function Champ({ titre, requis, children }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <span style={label}>{titre}{requis && <span style={{ color: "#E65100" }}> *</span>}</span>
      {children}
    </div>
  );
}

const btnPrincipal = (off) => ({
  width: "100%", background: off ? "#90A4AE" : "#004649", color: "#F4EDE4",
  fontWeight: "600", fontSize: "16px", padding: "16px", borderRadius: "50px", border: "none",
  cursor: off ? "not-allowed" : "pointer", boxShadow: off ? "none" : "0 14px 38px rgba(0,70,73,0.28)",
});

export default function Inscription() {
  const router = useRouter();
  const [onglet, setOnglet] = useState("demande"); // "demande" | "code"
  const [demandeEnvoyee, setDemandeEnvoyee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [demande, setDemande] = useState({
    prenom: "", nom: "", email: "", telephone: "", specialite: "", rpps: "", structure: "", ville: "", message: "", consentement: false,
  });
  const [form, setForm] = useState({
    prenom: "", nom: "", specialite: "", rpps: "",
    telephone: "", cabinet: "", adresse: "",
    email: "", password: "", confirmPassword: "",
    inviteCode: "",
  });

  // Lien envoyé au pro : /inscription?code=XXXX → onglet code pré-rempli
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      setForm((f) => ({ ...f, inviteCode: code.toUpperCase() }));
      setOnglet("code");
    }
  }, []);

  const setD = (k) => (e) => setDemande((d) => ({ ...d, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function envoyerDemande(e) {
    e.preventDefault();
    setError("");
    if (!demande.consentement) {
      setError("Merci d'accepter que Rêvade vérifie votre profil professionnel.");
      return;
    }
    setLoading(true);
    if (!MODE_DEMO) {
      const { error: err } = await supabase.from("access_requests").insert({
        prenom: demande.prenom.trim(), nom: demande.nom.trim(), email: demande.email.trim(),
        telephone: demande.telephone.trim() || null, specialite: demande.specialite || null,
        rpps: demande.rpps.trim() || null, structure: demande.structure.trim() || null,
        ville: demande.ville.trim() || null, message: demande.message.trim() || null,
      });
      if (err) {
        setError("Impossible d'envoyer la demande. Réessayez dans quelques instants.");
        setLoading(false);
        return;
      }
    }
    setLoading(false);
    setDemandeEnvoyee(true);
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (MODE_DEMO) {
      router.push("/accueil");
      return;
    }

    setLoading(true);

    // 1. Vérifier le code d'invitation
    const { data: invite, error: inviteError } = await supabase
      .from("invitation_codes")
      .select("id, used")
      .eq("code", form.inviteCode.trim().toUpperCase())
      .single();

    if (inviteError || !invite) {
      setError("Code d'invitation invalide.");
      setLoading(false);
      return;
    }
    if (invite.used) {
      setError("Ce code d'invitation a déjà été utilisé.");
      setLoading(false);
      return;
    }

    // 2. Créer le compte Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    if (authError) {
      setError(authError.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : "Erreur lors de la création du compte.");
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setError("Erreur inattendue. Réessayez.");
      setLoading(false);
      return;
    }

    // 3. Créer le profil professionnel complet
    const { error: proError } = await supabase
      .from("professionals")
      .insert({
        id: userId,
        nom: form.nom.trim(),
        prenom: form.prenom.trim(),
        email: form.email.trim(),
        specialite: form.specialite.trim() || null,
        rpps: form.rpps.trim() || null,
        telephone: form.telephone.trim() || null,
        cabinet: form.cabinet.trim() || null,
        adresse: form.adresse.trim() || null,
      });

    if (proError) {
      setError("Erreur lors de la création du profil.");
      setLoading(false);
      return;
    }

    // 4. Marquer le code comme utilisé
    await supabase
      .from("invitation_codes")
      .update({ used: true, used_by: userId, used_at: new Date().toISOString() })
      .eq("id", invite.id);

    router.push("/accueil");
  }

  const etapes = [
    ["📝", "Vous faites votre demande", "Quelques informations sur votre exercice, en 2 minutes."],
    ["🔎", "Nous vérifions votre profil", "Notre équipe contrôle votre numéro RPPS et votre activité."],
    ["✉️", "Vous recevez votre code", "Un email avec votre code d'accès personnel, sous 48 h ouvrées."],
    ["✅", "Vous créez votre compte", "Saisissez votre code et accédez à Rêvade Pro."],
  ];

  return (
    <main className="login-wrap" style={{ minHeight: "100vh", display: "flex", background: "#EAF3F8" }}>
      <style>{`
        .login-left, .login-right { flex: 1 1 0; min-width: 0; min-height: 100vh; }
        .login-right { overflow-y: auto; }
        @media (max-width: 900px) {
          .login-wrap { flex-direction: column; }
          .login-left, .login-right { min-height: auto; }
          .login-right { order: 1; padding: 32px 16px !important; }
          .login-left { order: 2; }
          .login-pitch { padding: 32px 0 !important; }
        }
      `}</style>

      {/* ── Panneau gauche : comment ça marche ── */}
      <section className="login-left" style={{
        position: "relative", overflow: "hidden", background: "#004649", color: "#F4EDE4",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "36px clamp(28px, 5vw, 72px)",
      }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 50% 45% at 15% 10%, rgba(183,215,232,0.20), transparent 70%), radial-gradient(ellipse 45% 50% at 90% 90%, rgba(165,201,185,0.16), transparent 70%)" }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <a href="https://revade.fr" style={{ display: "flex" }}>
            <Image src="/logo-white.svg" alt="Rêvade" width={112} height={40} priority />
          </a>
          <Link href="/connexion" style={{ color: "rgba(244,237,228,0.75)", fontSize: "13px", fontWeight: "500", textDecoration: "none", border: "1px solid rgba(244,237,228,0.22)", borderRadius: "50px", padding: "8px 16px" }}>
            ← Retour à la connexion
          </Link>
        </div>

        <div className="login-pitch" style={{ position: "relative", maxWidth: "520px", padding: "48px 0" }}>
          <p style={{ color: "#A5C9B9", fontWeight: "300", fontSize: "13px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "18px" }}>
            Rejoindre le réseau Rêvade
          </p>
          <h1 style={{ fontWeight: "700", fontSize: "clamp(30px, 3.2vw, 44px)", lineHeight: 1.12, letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Un accès réservé aux professionnels de santé.
          </h1>
          <p style={{ color: "rgba(244,237,228,0.78)", fontSize: "15px", fontWeight: "300", lineHeight: 1.7, marginBottom: "32px" }}>
            Pour protéger les données de santé des patients, chaque compte est vérifié par notre équipe avant d&apos;être activé.
          </p>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {etapes.map(([icon, titre, desc], i) => (
              <div key={titre} style={{ display: "flex", gap: "16px" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: "44px", height: "44px", borderRadius: "16px", flexShrink: 0, background: "rgba(244,237,228,0.10)", border: "1px solid rgba(244,237,228,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "19px" }}>{icon}</span>
                  {i < etapes.length - 1 && <span style={{ width: "1px", flex: 1, minHeight: "18px", background: "rgba(244,237,228,0.20)", margin: "6px 0" }} />}
                </div>
                <div style={{ paddingBottom: i < etapes.length - 1 ? "18px" : 0 }}>
                  <p style={{ color: "#F4EDE4", fontWeight: "600", fontSize: "15px", marginTop: "2px" }}>
                    <span style={{ color: "#A5C9B9", marginRight: "8px" }}>{i + 1}.</span>{titre}
                  </p>
                  <p style={{ color: "rgba(244,237,228,0.7)", fontSize: "13px", lineHeight: 1.6, marginTop: "2px" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: "relative", color: "rgba(244,237,228,0.6)", fontSize: "13px" }}>
          Vous êtes un particulier ?{" "}
          <a href="https://revade.fr" style={{ color: "#A5C9B9", fontWeight: "600", textDecoration: "none" }}>Votre espace est sur l&apos;app Rêvade →</a>
        </p>
      </section>

      {/* ── Panneau droit ── */}
      <section className="login-right" style={{ display: "flex", alignItems: "safe center", justifyContent: "center", padding: "40px 24px", background: "linear-gradient(160deg, #B7D7E8 0%, #D3E7F1 50%, #EAF3F8 100%)" }}>
        <div style={{
          background: "#FFFFFF", borderRadius: "28px", width: "100%", maxWidth: "520px",
          padding: "40px clamp(24px, 4vw, 44px)", display: "flex", flexDirection: "column", gap: "18px",
          boxShadow: "0 30px 70px rgba(0,70,73,0.14)", border: "1px solid rgba(0,70,73,0.10)",
        }}>

          {demandeEnvoyee ? (
            /* ── Demande envoyée ── */
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", padding: "12px 0" }}>
              <div style={{ width: "76px", height: "76px", borderRadius: "26px", background: "#DCEEE6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "34px" }}>✓</div>
              <p style={{ color: "#5A6B72", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" }}>Demande envoyée</p>
              <h2 style={{ color: "#004649", fontSize: "26px", fontWeight: "600", letterSpacing: "-0.01em" }}>Merci {demande.prenom || ""} !</h2>
              <p style={{ color: "#5A6B72", fontSize: "14px", lineHeight: 1.7, maxWidth: "380px" }}>
                Notre équipe vérifie votre profil. Vous recevrez votre <strong style={{ color: "#004649" }}>code d&apos;accès personnel</strong> à l&apos;adresse <strong style={{ color: "#004649" }}>{demande.email || "indiquée"}</strong> sous 48 h ouvrées.
              </p>
              <div style={{ width: "100%", background: "#EAF3F8", borderRadius: "20px", padding: "16px 20px", textAlign: "left", display: "flex", gap: "12px" }}>
                <span>💡</span>
                <p style={{ color: "#2A3F4F", fontSize: "13px", lineHeight: 1.6 }}>
                  Pensez à vérifier vos courriers indésirables. L&apos;email contiendra un lien qui pré-remplit votre code.
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginTop: "6px" }}>
                <Link href="/connexion" style={{ textDecoration: "none", background: "#004649", color: "#F4EDE4", borderRadius: "50px", padding: "13px 26px", fontSize: "14px", fontWeight: "600" }}>
                  Retour à la connexion
                </Link>
                <button onClick={() => { setDemandeEnvoyee(false); setOnglet("code"); }} style={{ background: "#FFFFFF", color: "#004649", border: "1px solid rgba(0,70,73,0.20)", borderRadius: "50px", padding: "13px 22px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}>
                  J&apos;ai déjà mon code
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center" }}>
                <p style={{ color: "#5A6B72", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "8px" }}>Espace adhérent pro</p>
                <h2 style={{ color: "#004649", fontSize: "26px", fontWeight: "600", letterSpacing: "-0.01em" }}>
                  {onglet === "demande" ? "Demander un accès" : "Créer mon compte"}
                </h2>
              </div>

              {/* Onglets */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", padding: "5px", background: "#EAF3F8", borderRadius: "50px" }}>
                {[["demande", "Je n'ai pas de code"], ["code", "J'ai reçu mon code"]].map(([id, txt]) => (
                  <button key={id} type="button" onClick={() => { setOnglet(id); setError(""); }} style={{
                    padding: "11px 12px", borderRadius: "50px", border: "none", cursor: "pointer", fontSize: "13px",
                    fontWeight: onglet === id ? "600" : "500",
                    background: onglet === id ? "#004649" : "transparent", color: onglet === id ? "#F4EDE4" : "#5A6B72",
                  }}>{txt}</button>
                ))}
              </div>

              {onglet === "demande" ? (
                /* ── Demande d'accès ── */
                <form onSubmit={envoyerDemande} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <p style={{ color: "#5A6B72", fontSize: "13px", lineHeight: 1.6, textAlign: "center" }}>
                    Laissez-nous vos coordonnées : nous vérifions votre profil et vous envoyons votre code d&apos;accès.
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Champ titre="Prénom" requis><input required value={demande.prenom} onChange={setD("prenom")} style={field} /></Champ>
                    <Champ titre="Nom" requis><input required value={demande.nom} onChange={setD("nom")} style={field} /></Champ>
                  </div>
                  <Champ titre="Email professionnel" requis><input type="email" required value={demande.email} onChange={setD("email")} placeholder="vous@cabinet.fr" style={field} /></Champ>
                  <Champ titre="Téléphone"><input type="tel" value={demande.telephone} onChange={setD("telephone")} placeholder="Pour vous joindre si besoin" style={field} /></Champ>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Champ titre="Spécialité" requis>
                      <select required value={demande.specialite} onChange={setD("specialite")} style={{ ...field, cursor: "pointer" }}>
                        <option value="">Sélectionner…</option>
                        {SPECIALITES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Champ>
                    <Champ titre="Numéro RPPS" requis><input required inputMode="numeric" value={demande.rpps} onChange={setD("rpps")} placeholder="11 chiffres" style={field} /></Champ>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Champ titre="Cabinet / structure"><input value={demande.structure} onChange={setD("structure")} style={field} /></Champ>
                    <Champ titre="Ville"><input value={demande.ville} onChange={setD("ville")} style={field} /></Champ>
                  </div>
                  <Champ titre="Message (optionnel)">
                    <textarea rows={3} value={demande.message} onChange={setD("message")} placeholder="Comment souhaitez-vous utiliser Rêvade Pro ?" style={{ ...field, resize: "vertical", lineHeight: 1.6 }} />
                  </Champ>
                  <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer" }}>
                    <input type="checkbox" checked={demande.consentement} onChange={setD("consentement")} style={{ width: "18px", height: "18px", accentColor: "#004649", marginTop: "2px", flexShrink: 0 }} />
                    <span style={{ color: "#5A6B72", fontSize: "12px", lineHeight: 1.6 }}>
                      J&apos;accepte que Rêvade vérifie mon identité professionnelle (RPPS) et me recontacte au sujet de ma demande.
                    </span>
                  </label>

                  {error && <p style={{ color: "#C62828", fontSize: "13px", textAlign: "center", background: "#FFF5F5", borderRadius: "14px", padding: "10px 14px" }}>{error}</p>}

                  <button type="submit" disabled={loading} style={btnPrincipal(loading)}>
                    {loading ? "Envoi…" : "Envoyer ma demande"}
                  </button>
                  <p style={{ color: "#90A4AE", fontSize: "12px", textAlign: "center" }}>Réponse sous 48 h ouvrées · Sans engagement</p>
                </form>
              ) : (
                /* ── Création du compte avec code ── */
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ background: "#F1F8F5", border: "1px solid #A5C9B9", borderRadius: "20px", padding: "16px 18px" }}>
                    <Champ titre="Code d'accès reçu par email" requis>
                      <input required value={form.inviteCode} onChange={setF("inviteCode")} placeholder="EX : RVD-4F7K2"
                        style={{ ...field, background: "#FFFFFF", letterSpacing: "3px", fontWeight: "700", fontSize: "16px", textTransform: "uppercase", color: "#004649" }} />
                    </Champ>
                  </div>

                  <p style={sectionLabel}>Identité</p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Champ titre="Prénom" requis><input required value={form.prenom} onChange={setF("prenom")} style={field} /></Champ>
                    <Champ titre="Nom" requis><input required value={form.nom} onChange={setF("nom")} style={field} /></Champ>
                  </div>

                  <p style={sectionLabel}>Exercice</p>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Champ titre="Spécialité" requis>
                      <select required value={form.specialite} onChange={setF("specialite")} style={{ ...field, cursor: "pointer" }}>
                        <option value="">Sélectionner…</option>
                        {SPECIALITES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </Champ>
                    <Champ titre="Numéro RPPS"><input value={form.rpps} onChange={setF("rpps")} style={field} /></Champ>
                  </div>
                  <Champ titre="Cabinet / structure"><input value={form.cabinet} onChange={setF("cabinet")} style={field} /></Champ>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Champ titre="Adresse du cabinet"><input value={form.adresse} onChange={setF("adresse")} style={field} /></Champ>
                    <Champ titre="Téléphone"><input type="tel" value={form.telephone} onChange={setF("telephone")} style={field} /></Champ>
                  </div>

                  <p style={sectionLabel}>Compte</p>
                  <Champ titre="Email professionnel" requis><input type="email" required value={form.email} onChange={setF("email")} style={field} /></Champ>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Champ titre="Mot de passe" requis><input type="password" required value={form.password} onChange={setF("password")} placeholder="8 caractères min." style={field} /></Champ>
                    <Champ titre="Confirmation" requis><input type="password" required value={form.confirmPassword} onChange={setF("confirmPassword")} style={field} /></Champ>
                  </div>

                  {error && <p style={{ color: "#C62828", fontSize: "13px", textAlign: "center", background: "#FFF5F5", borderRadius: "14px", padding: "10px 14px" }}>{error}</p>}

                  <button type="submit" disabled={loading} style={btnPrincipal(loading)}>
                    {loading ? "Création en cours…" : "Créer mon compte"}
                  </button>
                  <p style={{ color: "#90A4AE", fontSize: "12px", textAlign: "center" }}>
                    Pas encore de code ?{" "}
                    <button type="button" onClick={() => setOnglet("demande")} style={{ background: "none", border: "none", color: "#004649", fontWeight: "600", cursor: "pointer", fontSize: "12px", padding: 0 }}>Faire une demande d&apos;accès</button>
                  </p>
                </form>
              )}

              <p style={{ textAlign: "center", fontSize: "13px", color: "#5A6B72", borderTop: "1px solid rgba(0,70,73,0.08)", paddingTop: "16px" }}>
                Déjà un compte ?{" "}
                <Link href="/connexion" style={{ color: "#004649", fontWeight: "600", textDecoration: "none" }}>Se connecter</Link>
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
