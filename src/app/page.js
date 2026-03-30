import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex items-stretch" style={{ backgroundColor: "#B8D8E8" }}>
      <div className="flex flex-row w-full">

        {/* Colonne gauche */}
        <div className="flex flex-col justify-center gap-8 py-16" style={{ flex: "1", paddingLeft: "180px", paddingRight: "40px" }}>

          {/* Logo */}
          <Image src="/logo.png" alt="Rêvade" width={180} height={65} />

          {/* Titre */}
          <h1 className="text-5xl font-light leading-snug" style={{ color: "#1E3A4A" }}>
            Le logiciel de<br />suivi du sevrage<br />de vos patients
          </h1>

          {/* Sous-titre */}
          <p className="text-base" style={{ color: "#1E3A4A" }}>
            Pensé par des professionnels<br />pour des professionnels
          </p>

          {/* Bouton */}
          <Link href="/connexion">
            <button
              className="rounded-xl text-white font-semibold text-base w-fit"
              style={{ backgroundColor: "#004649", padding: "14px 36px" }}
            >
              Connexion
            </button>
          </Link>
        </div>

        {/* Colonne droite - Image */}
        <div className="self-stretch flex items-end justify-center" style={{ flex: "0.8", paddingRight: "100px" }}>
          <div className="overflow-hidden" style={{ borderRadius: "120px 120px 0 0", width: "460px", height: "90%", position: "relative" }}>
            <Image
              src="/hero.png"
              alt="Professionnel"
              fill
              style={{ objectFit: "cover", objectPosition: "center top" }}
            />
          </div>
        </div>

      </div>
    </main>
  );
}