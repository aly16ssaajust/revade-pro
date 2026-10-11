import Image from "next/image";
import Link from "next/link";
import NightSky from "@/components/NightSky";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      background: "#0B2F4B",
      display: "flex", flexDirection: "column",
    }}>
      <NightSky />

      {/* Barre du haut */}
      <nav style={{
        position: "relative", zIndex: 2, maxWidth: "1280px", width: "100%", margin: "0 auto",
        padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Image src="/logo-white.svg" alt="Rêvade" width={110} height={40} priority />
        <Link href="/connexion" style={{
          textDecoration: "none", fontWeight: "600", fontSize: "14px", color: "#0B2F4B",
          background: "linear-gradient(135deg, #A5C9B9, #B7D7E8)",
          padding: "10px 24px", borderRadius: "50px", boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
        }}>
          Connexion
        </Link>
      </nav>

      <div style={{
        position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "stretch",
        maxWidth: "1280px", width: "100%", margin: "0 auto",
      }}>

        {/* Colonne gauche */}
        <div style={{
          flex: "1", display: "flex", flexDirection: "column", justifyContent: "center",
          gap: "28px", padding: "64px 40px 64px 48px",
        }}>
          <p style={{
            fontWeight: "300", textTransform: "uppercase", letterSpacing: "0.18em",
            fontSize: "13px", color: "#A5C9B9", marginBottom: "-8px",
          }}>
            Rêvade Pro · Professionnels de santé
          </p>

          <h1 style={{
            fontStyle: "italic", fontWeight: "700",
            fontSize: "clamp(40px, 5.4vw, 68px)", lineHeight: "1.08",
            letterSpacing: "-0.02em", color: "#F4EDE4",
          }}>
            Le logiciel de suivi du sevrage de vos patients
          </h1>

          <p style={{ fontSize: "18px", fontWeight: "300", color: "rgba(244,237,228,0.82)", lineHeight: "1.6", maxWidth: "520px" }}>
            Pensé par des professionnels de santé, pour des professionnels de santé.
            Suivez vos patients, leurs consommations et leurs progrès au même endroit.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "flex-start" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/connexion" style={{
                display: "inline-block", textDecoration: "none",
                background: "linear-gradient(135deg, #A5C9B9, #B7D7E8)", color: "#0B2F4B",
                fontWeight: "600", fontSize: "17px",
                padding: "16px 40px", borderRadius: "50px",
                boxShadow: "0 14px 38px rgba(0,0,0,0.3)",
              }}>
                Accéder à mon espace
              </Link>
              <Link href="/inscription" style={{
                display: "inline-block", textDecoration: "none",
                color: "#F4EDE4", fontWeight: "500", fontSize: "16px",
                padding: "15px 30px", borderRadius: "50px",
                border: "1px solid rgba(244,237,228,0.3)",
              }}>
                Créer un compte
              </Link>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(244,237,228,0.55)" }}>
              Réservé aux professionnels de santé partenaires · Données sécurisées
            </p>
          </div>
        </div>

        {/* Image droite */}
        <div style={{ flex: "0.8", paddingRight: "48px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{
            overflow: "hidden", borderRadius: "200px 200px 0 0",
            width: "440px", height: "86%", position: "relative",
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
            border: "1px solid rgba(244,237,228,0.12)", borderBottom: "none",
          }}>
            <Image src="/hero.png" alt="Professionnel" fill style={{ objectFit: "cover", objectPosition: "center top" }} />
          </div>
        </div>

      </div>
    </main>
  );
}
