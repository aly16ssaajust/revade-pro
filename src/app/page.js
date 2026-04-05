import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #C8E6F0 0%, #A8D4E6 60%, #98CCE0 100%)",
      display: "flex", alignItems: "stretch",
    }}>
      <div style={{ display: "flex", flexDirection: "row", width: "100%" }}>

        {/* Colonne gauche */}
        <div style={{
          flex: "1", display: "flex", flexDirection: "column",
          justifyContent: "center", gap: "32px", py: "64px",
          paddingLeft: "180px", paddingRight: "40px", paddingTop: "64px", paddingBottom: "64px",
        }}>

          {/* Logo */}
          <Image src="/logo.png" alt="Rêvade" width={180} height={65} />

          {/* Titre */}
          <h1 style={{
            fontSize: "48px", fontWeight: "300", lineHeight: "1.2",
            color: "#1E3A4A",
            textShadow: "0 2px 4px rgba(0,0,0,0.08)",
          }}>
            Le logiciel de<br />suivi du sevrage<br />de vos patients
          </h1>

          {/* Sous-titre */}
          <p style={{ fontSize: "16px", color: "#1E3A4A", opacity: 0.8 }}>
            Pensé par des professionnels<br />pour des professionnels
          </p>

          {/* Bouton */}
          <Link href="/connexion" style={{ textDecoration: "none", width: "fit-content" }}>
            <button style={{
              background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)",
              color: "white", fontWeight: "700", fontSize: "15px",
              paddingTop: "16px", paddingBottom: "16px",
              paddingLeft: "48px", paddingRight: "48px",
              borderRadius: "14px", border: "none", cursor: "pointer",
              boxShadow: "0 8px 20px rgba(0,70,73,0.35), 0 4px 8px rgba(0,70,73,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}>
              Connexion
            </button>
          </Link>
        </div>

        {/* Image droite */}
        <div style={{ flex: "0.8", paddingRight: "100px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{
            overflow: "hidden", borderRadius: "140px 140px 0 0",
            width: "460px", height: "90%", position: "relative",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)",
          }}>
            <Image src="/hero.png" alt="Professionnel" fill style={{ objectFit: "cover", objectPosition: "center top" }} />
          </div>
        </div>

      </div>
    </main>
  );
}