import Image from "next/image";
import Link from "next/link";

export default function Connexion() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #C8E6F0 0%, #A8D4E6 50%, #B8D8E8 100%)",
      display: "flex", flexDirection: "column",
    }}>

      {/* Header */}
      <div style={{ paddingLeft: "48px", paddingTop: "24px", paddingBottom: "24px" }}>
        <Image src="/logo.png" alt="Rêvade" width={150} height={55} />
      </div>

      {/* Carte */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", paddingBottom: "40px" }}>
        <div style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          borderRadius: "28px", width: "540px",
          paddingTop: "52px", paddingBottom: "52px",
          paddingLeft: "68px", paddingRight: "68px",
          display: "flex", flexDirection: "column", gap: "22px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "1px solid rgba(255,255,255,0.8)",
        }}>

          {/* Titre */}
          <h1 style={{ color: "#004649", fontSize: "28px", fontWeight: "700", textAlign: "center", marginBottom: "8px" }}>
            Connexion
          </h1>

          {/* Champ identifiant */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            border: "1.5px solid #B8D8E8", borderRadius: "999px",
            paddingTop: "14px", paddingBottom: "14px",
            paddingLeft: "20px", paddingRight: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fdff 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
          }}>
            <span style={{ color: "#004649" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </span>
            <input type="text" placeholder="Identifiant"
              style={{ flex: 1, outline: "none", fontSize: "14px", backgroundColor: "transparent", color: "#1E3A4A", border: "none" }}
            />
          </div>

          {/* Champ mot de passe */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            border: "1.5px solid #B8D8E8", borderRadius: "999px",
            paddingTop: "14px", paddingBottom: "14px",
            paddingLeft: "20px", paddingRight: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fdff 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
          }}>
            <span style={{ color: "#004649" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>
            <input type="password" placeholder="Mot de passe"
              style={{ flex: 1, outline: "none", fontSize: "14px", backgroundColor: "transparent", color: "#1E3A4A", border: "none" }}
            />
          </div>

          {/* Champ code d'accès */}
          <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            border: "1.5px solid #B8D8E8", borderRadius: "999px",
            paddingTop: "14px", paddingBottom: "14px",
            paddingLeft: "20px", paddingRight: "20px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fdff 100%)",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.04)",
          }}>
            <span style={{ color: "#004649" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </span>
            <input type="password" placeholder="Code d'accès"
              style={{ flex: 1, outline: "none", fontSize: "14px", backgroundColor: "transparent", color: "#1E3A4A", border: "none" }}
            />
          </div>

          {/* Bouton */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
            <Link href="/accueil" style={{ textDecoration: "none" }}>
              <button style={{
                background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)",
                color: "white", fontWeight: "700", fontSize: "15px",
                paddingTop: "16px", paddingBottom: "16px",
                paddingLeft: "64px", paddingRight: "64px",
                borderRadius: "14px", border: "none", cursor: "pointer",
                boxShadow: "0 8px 20px rgba(0,70,73,0.35), 0 4px 8px rgba(0,70,73,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}>
                Se connecter
              </button>
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}