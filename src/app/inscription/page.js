'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const inputStyle = {
  display: "flex", alignItems: "center", gap: "12px",
  border: "1.5px solid #B7D7E8", borderRadius: "14px",
  paddingTop: "13px", paddingBottom: "13px",
  paddingLeft: "18px", paddingRight: "18px",
  background: "#ffffff",
  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)",
};

const fieldStyle = {
  flex: 1, outline: "none", fontSize: "14px",
  backgroundColor: "transparent", color: "#2A3F4F", border: "none",
};

const sectionLabel = {
  color: "#004649", fontSize: "12px", fontWeight: "500",
  letterSpacing: "0.18em", textTransform: "uppercase",
  margin: "8px 0 4px 4px",
};

function Icon({ d }) {
  return (
    <span style={{ color: "#5A6B72", flexShrink: 0 }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d={d} />
      </svg>
    </span>
  );
}

export default function Inscription() {
  const router = useRouter();
  const [form, setForm] = useState({
    prenom: '', nom: '', specialite: '', rpps: '',
    telephone: '', cabinet: '', adresse: '',
    email: '', password: '', confirmPassword: '',
    inviteCode: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  async function handleRegister(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setLoading(true);

    // 1. Vérifier le code d'invitation
    const { data: invite, error: inviteError } = await supabase
      .from('invitation_codes')
      .select('id, used')
      .eq('code', form.inviteCode.trim().toUpperCase())
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
      setError(authError.message === 'User already registered'
        ? 'Un compte existe déjà avec cet email.'
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
      .from('professionals')
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
      .from('invitation_codes')
      .update({ used: true, used_by: userId, used_at: new Date().toISOString() })
      .eq('id', invite.id);

    router.push('/accueil');
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #B7D7E8 0%, #D3E7F1 55%, #EAF3F8 100%)",
      display: "flex", flexDirection: "column",
    }}>

      <div style={{ paddingLeft: "48px", paddingTop: "24px", paddingBottom: "16px" }}>
        <Image src="/logo.png" alt="Rêvade" width={150} height={55} />
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingBottom: "48px" }}>
        <form onSubmit={handleRegister} style={{
          background: "#FFFFFF",
          borderRadius: "24px", width: "560px",
          paddingTop: "44px", paddingBottom: "44px",
          paddingLeft: "64px", paddingRight: "64px",
          display: "flex", flexDirection: "column", gap: "12px",
          boxShadow: "0 20px 60px rgba(0,70,73,0.10)",
          border: "1px solid rgba(0,70,73,0.12)",
        }}>

          <p style={{ color: "#5A6B72", fontSize: "12px", fontWeight: "400", letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", margin: "0 0 -6px" }}>
            Espace professionnels de santé
          </p>
          <h1 style={{ color: "#004649", fontSize: "24px", fontWeight: "600", textAlign: "center", marginBottom: "2px" }}>
            Créer un compte
          </h1>
          <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center", marginBottom: "8px" }}>
            Réservé aux professionnels de santé partenaires Rêvade
          </p>

          {/* ── IDENTITÉ ── */}
          <p style={sectionLabel}>Identité</p>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ ...inputStyle, flex: 1 }}>
              <input type="text" placeholder="Prénom *" value={form.prenom}
                onChange={set('prenom')} required style={fieldStyle} />
            </div>
            <div style={{ ...inputStyle, flex: 1 }}>
              <input type="text" placeholder="Nom *" value={form.nom}
                onChange={set('nom')} required style={fieldStyle} />
            </div>
          </div>

          {/* ── INFORMATIONS PROFESSIONNELLES ── */}
          <p style={{ ...sectionLabel, marginTop: "8px" }}>Informations professionnelles</p>

          <div style={inputStyle}>
            <Icon d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
            <input type="text" placeholder="Spécialité (ex : Tabacologue, Addictologue) *"
              value={form.specialite} onChange={set('specialite')} required style={fieldStyle} />
          </div>

          <div style={inputStyle}>
            <Icon d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
            <input type="text" placeholder="Numéro RPPS"
              value={form.rpps} onChange={set('rpps')} style={fieldStyle} />
          </div>

          <div style={inputStyle}>
            <Icon d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            <input type="text" placeholder="Nom du cabinet / structure"
              value={form.cabinet} onChange={set('cabinet')} style={fieldStyle} />
          </div>

          <div style={inputStyle}>
            <Icon d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            <input type="text" placeholder="Adresse du cabinet"
              value={form.adresse} onChange={set('adresse')} style={fieldStyle} />
          </div>

          <div style={inputStyle}>
            <Icon d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
            <input type="tel" placeholder="Téléphone professionnel"
              value={form.telephone} onChange={set('telephone')} style={fieldStyle} />
          </div>

          {/* ── COMPTE ── */}
          <p style={{ ...sectionLabel, marginTop: "8px" }}>Compte</p>

          <div style={inputStyle}>
            <Icon d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            <input type="email" placeholder="Email professionnel *"
              value={form.email} onChange={set('email')} required style={fieldStyle} />
          </div>

          <div style={inputStyle}>
            <Icon d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            <input type="password" placeholder="Mot de passe (8 caractères min.) *"
              value={form.password} onChange={set('password')} required style={fieldStyle} />
          </div>

          <div style={inputStyle}>
            <Icon d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            <input type="password" placeholder="Confirmer le mot de passe *"
              value={form.confirmPassword} onChange={set('confirmPassword')} required style={fieldStyle} />
          </div>

          {/* ── CODE D'INVITATION ── */}
          <p style={{ ...sectionLabel, marginTop: "8px" }}>Code d&apos;invitation</p>
          <div style={{ ...inputStyle, border: "1.5px solid #A5C9B9", background: "#f0faf5" }}>
            <Icon d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
            <input type="text" placeholder="Code fourni par Rêvade *"
              value={form.inviteCode} onChange={set('inviteCode')} required
              style={{ ...fieldStyle, letterSpacing: "2px", fontWeight: "600", textTransform: "uppercase" }} />
          </div>

          {error && (
            <p style={{ color: "#e53e3e", fontSize: "13px", textAlign: "center", margin: "4px 0 0" }}>
              {error}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
            <button type="submit" disabled={loading} style={{
              background: loading ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
              color: "#F4EDE4", fontWeight: "600", fontSize: "16px",
              paddingTop: "16px", paddingBottom: "16px",
              paddingLeft: "64px", paddingRight: "64px",
              borderRadius: "50px", border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: "0 14px 38px rgba(0,70,73,0.3)",
            }}>
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#5A6B72", margin: 0 }}>
            Déjà un compte ?{" "}
            <Link href="/connexion" style={{ color: "#004649", fontWeight: "600", textDecoration: "none" }}>
              Se connecter
            </Link>
          </p>

        </form>
      </div>
    </main>
  );
}
