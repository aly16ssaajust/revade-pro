import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #B7D7E8 0%, #D3E7F1 55%, #EAF3F8 100%)",
      display: "flex", alignItems: "stretch",
    }}>
      <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>

        {/* Colonne gauche */}
        <div style={{
          flex: "1", display: "flex", flexDirection: "column",
          justifyContent: "center", gap: "28px",
          paddingLeft: "180px", paddingRight: "40px", paddingTop: "64px", paddingBottom: "64px",
        }}>

          {/* Logo */}
          <Image src="/logo.png" alt="Rêvade" width={180} height={65} />

          {/* Sur-titre */}
          <p style={{
            fontWeight: "300", textTransform: "uppercase", letterSpacing: "0.18em",
            fontSize: "13px", color: "#004649", marginBottom: "-12px",
          }}>
            Rêvade Pro · Professionnels de santé
          </p>

          {/* Titre */}
          <h1 style={{
            fontSize: "clamp(38px, 5vw, 56px)", fontWeight: "300", lineHeight: "1.15",
            letterSpacing: "-0.02em", color: "#004649",
          }}>
            Le logiciel de<br />suivi du sevrage<br /><span style={{ fontWeight: "600" }}>de vos patients</span>
          </h1>

          {/* Sous-titre */}
          <p style={{ fontSize: "17px", fontWeight: "300", color: "#2A3F4F", lineHeight: "1.6" }}>
            Pensé par des professionnels<br />pour des professionnels
          </p>

          {/* Boutons */}
          <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/connexion" style={{
              display: "inline-block", textDecoration: "none",
              background: "#004649", color: "#F4EDE4",
              fontWeight: "600", fontSize: "16px",
              padding: "16px 40px", borderRadius: "50px",
              boxShadow: "0 14px 38px rgba(0,70,73,0.3)",
            }}>
              Connexion
            </Link>
            <Link href="/inscription" style={{
              display: "inline-block", textDecoration: "none",
              background: "rgba(255,255,255,0.6)", color: "#004649",
              fontWeight: "600", fontSize: "16px",
              padding: "15px 34px", borderRadius: "50px",
              border: "1px solid rgba(0,70,73,0.2)",
            }}>
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Image droite */}
        <div style={{ flex: "0.8", paddingRight: "100px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{
            overflow: "hidden", borderRadius: "140px 140px 0 0",
            width: "460px", height: "90%", position: "relative",
            boxShadow: "0 20px 60px rgba(0,70,73,0.15)",
          }}>
            <Image src="/hero.png" alt="Professionnel" fill style={{ objectFit: "cover", objectPosition: "center top" }} />
          </div>
        </div>

      </div>
    </main>
  );
}
