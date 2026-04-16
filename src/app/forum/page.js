"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const categoriesData = [
  {
    id: 1, nom: "Témoignages", icon: "💬", nbSujets: 3,
    discussions: [
      { id: 101, titre: "Ce n'est pas linéaire... et c'est OK", auteur: "Yannis", date: "2 août à 21h02", contenu: "Cette semaine était plus difficile que la précédente. Je sens que je progresse, mais c'est irrégulier. J'apprends à l'accepter.", likes: 28, reponses: 12, epingle: true, messages: [{ auteur: "Dr. Martin", date: "3 août à 09h15", contenu: "C'est tout à fait normal Yannis, le sevrage n'est jamais une ligne droite. Continuez ainsi !", certifie: true }, { auteur: "Lucie", date: "3 août à 10h30", contenu: "Je ressens exactement la même chose. On est ensemble !", certifie: false }] },
      { id: 102, titre: "J'ai réussi à ne pas vapoter pendant mon anxiété !", auteur: "Lucie", date: "6 août à 22h14", contenu: "Ce soir, j'ai eu une montée d'angoisse... mais j'ai respiré à la place. Rêvade m'a aidée à me recentrer.", likes: 12, reponses: 8, epingle: true, messages: [{ auteur: "Dr. Martin", date: "7 août à 08h00", contenu: "Bravo Lucie ! C'est une victoire importante.", certifie: true }] },
      { id: 103, titre: "100 jours sans cigarette !", auteur: "Marc", date: "15 août à 10h00", contenu: "Je n'aurais jamais cru y arriver. Merci à toute la communauté Rêvade.", likes: 45, reponses: 20, epingle: false, messages: [] },
    ]
  },
  {
    id: 2, nom: "Conseils sevrage", icon: "🌿", nbSujets: 2,
    discussions: [
      { id: 201, titre: "Mes 5 astuces pour résister aux envies", auteur: "Dr. Martin", date: "1 août à 14h00", contenu: "Après des années d'accompagnement, voici les techniques qui fonctionnent le mieux : respiration, distraction, hydratation, marche et méditation.", likes: 52, reponses: 15, epingle: true, messages: [{ auteur: "Thomas", date: "2 août à 09h00", contenu: "Merci docteur, la respiration m'a vraiment aidé !", certifie: false }] },
      { id: 202, titre: "Quand réduire le taux de nicotine ?", auteur: "Sophie", date: "5 août à 16h30", contenu: "Mon médecin m'a dit d'attendre 3 semaines avant de baisser. Qu'est-ce que vous en pensez ?", likes: 18, reponses: 9, epingle: false, messages: [{ auteur: "Dr. Martin", date: "5 août à 18h00", contenu: "3 semaines c'est une bonne règle générale. Mais écoutez votre corps avant tout.", certifie: true }] },
    ]
  },
  {
    id: 3, nom: "Gestion du stress", icon: "🧘", nbSujets: 2,
    discussions: [
      { id: 301, titre: "La méditation m'a changé la vie", auteur: "Emma", date: "8 août à 20h00", contenu: "Depuis que je médite 10 minutes par jour, mes envies de vapoter ont vraiment diminué.", likes: 33, reponses: 11, epingle: false, messages: [] },
      { id: 302, titre: "Le sport comme alternative à la vape", auteur: "Julien", date: "11 août à 17h45", contenu: "J'ai remplacé mes pauses vape par des tours de marche rapide. Ça m'aide énormément.", likes: 27, reponses: 6, epingle: false, messages: [{ auteur: "Dr. Martin", date: "12 août à 08h30", contenu: "Excellent Julien ! L'activité physique libère des endorphines qui compensent naturellement le manque.", certifie: true }] },
    ]
  },
  {
    id: 4, nom: "Substituts nicotiniques", icon: "🧪", nbSujets: 1,
    discussions: [
      { id: 401, titre: "Gomme ou patch : lequel choisir ?", auteur: "Amina", date: "3 août à 11h00", contenu: "J'hésite entre les deux. Mon médecin m'a dit que ça dépend de mon mode de vie. Vos retours ?", likes: 21, reponses: 14, epingle: false, messages: [{ auteur: "Dr. Martin", date: "3 août à 13h00", contenu: "Le patch est idéal pour un fond constant, la gomme pour les envies ponctuelles. Les deux peuvent se combiner.", certifie: true }] },
    ]
  },
  {
    id: 5, nom: "Rechutes & reprises", icon: "🔄", nbSujets: 2,
    discussions: [
      { id: 501, titre: "J'ai rechuté... et je recommence", auteur: "Kevin", date: "9 août à 23h00", contenu: "J'ai tenu 3 semaines puis craqué lors d'une soirée. Je me sens nul. Mais je reprends demain.", likes: 38, reponses: 22, epingle: true, messages: [{ auteur: "Dr. Martin", date: "10 août à 07h30", contenu: "Kevin, une rechute ne signifie pas un échec. C'est une étape normale du sevrage. Vous avez le courage de recommencer, c'est l'essentiel.", certifie: true }, { auteur: "Yannis", date: "10 août à 09h00", contenu: "On est tous passés par là. Courage !", certifie: false }] },
      { id: 502, titre: "Après 2 rechutes, j'y arrive enfin", auteur: "Nadia", date: "14 août à 15h20", contenu: "Troisième tentative. Cette fois j'utilise Rêvade depuis le début et ça fait vraiment la différence.", likes: 29, reponses: 10, epingle: false, messages: [] },
    ]
  },
];

const tousLesMessages = categoriesData.flatMap((c) => c.discussions);

const navItems = [
  { href: "/accueil", label: "ACCUEIL", id: "accueil" },
  { href: "/dashboard", label: "FICHES PATIENTS", id: "dashboard" },
  { href: "/forum", label: "FORUM", id: "forum" },
  { href: "/annuaire", label: "ANNUAIRE", id: "annuaire" },
  { href: "/profil", label: "PROFIL", id: "profil" },
];

const NavBar = ({ actif }) => (
  <nav style={{
    background: "linear-gradient(135deg, #C8E6F0 0%, #A8D4E6 100%)",
    padding: "16px 48px", display: "flex", alignItems: "center", justifyContent: "space-between",
    boxShadow: "0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
  }}>
    <Link href="/accueil" style={{ textDecoration: "none" }}>
      <Image src="/logo.png" alt="Rêvade" width={130} height={48} />
    </Link>
    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
          <div style={{
            padding: "10px 20px", borderRadius: "10px",
            fontSize: "13px", fontWeight: "700", letterSpacing: "0.5px",
            color: actif === item.id ? "white" : "#1E3A4A",
            background: actif === item.id
              ? "linear-gradient(135deg, #004649 0%, #006B6F 100%)"
              : "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.2) 100%)",
            boxShadow: actif === item.id
              ? "0 4px 8px rgba(0,70,73,0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
              : "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.3)",
          }}>{item.label}</div>
        </Link>
      ))}
    </div>
  </nav>
);

export default function Forum() {
  const [onglet, setOnglet] = useState("messages");
  const [categorieOuverte, setCategorieOuverte] = useState(null);
  const [discussionOuverte, setDiscussionOuverte] = useState(null);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [discussions, setDiscussions] = useState(
    categoriesData.reduce((acc, cat) => {
      cat.discussions.forEach((d) => { acc[d.id] = d; });
      return acc;
    }, {})
  );

  const envoyerMessage = (discussionId) => {
    if (!nouveauMessage.trim()) return;
    setDiscussions((prev) => ({
      ...prev,
      [discussionId]: {
        ...prev[discussionId],
        reponses: prev[discussionId].reponses + 1,
        messages: [...prev[discussionId].messages, {
          auteur: "Dr. Martin", date: "À l'instant", contenu: nouveauMessage, certifie: true,
        }],
      },
    }));
    setNouveauMessage("");
  };

  const cardStyle = {
    background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
    borderRadius: "20px", padding: "32px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
    marginBottom: "20px",
  };

  const renderDiscussion = (disc, retourAction) => (
    <div>
      <button onClick={retourAction} style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)", border: "1px solid rgba(255,255,255,0.8)", color: "#1E3A4A", fontWeight: "600", fontSize: "15px", cursor: "pointer", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        ← Retour
      </button>
      <div style={cardStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          {disc.epingle && <span>📌</span>}
          <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "17px" }}>{disc.titre}</p>
        </div>
        <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>par {disc.auteur}, le {disc.date}</p>
        <p style={{ color: "#1E3A4A", fontSize: "14px", lineHeight: "1.6", fontStyle: "italic" }}>« {disc.contenu} »</p>
        <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
          <span style={{ color: "#E07B39", fontSize: "13px" }}>❤️ {disc.likes}</span>
          <span style={{ color: "#888", fontSize: "13px" }}>💬 {disc.reponses} réponses</span>
        </div>
      </div>

      {discussions[disc.id].messages.map((msg, i) => (
        <div key={i} style={{
          background: msg.certifie ? "linear-gradient(135deg, #F0F9F7 0%, #E4F5F1 100%)" : "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          borderRadius: "16px", padding: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
          marginBottom: "12px",
          borderLeft: msg.certifie ? "4px solid #004649" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "14px" }}>{msg.auteur}</span>
            {msg.certifie && <span style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: "600" }}>✓ Professionnel certifié</span>}
            <span style={{ color: "#aaa", fontSize: "12px", marginLeft: "auto" }}>{msg.date}</span>
          </div>
          <p style={{ color: "#1E3A4A", fontSize: "14px", lineHeight: "1.6" }}>{msg.contenu}</p>
        </div>
      ))}

      <div style={{ ...cardStyle, marginTop: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <span style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "14px" }}>Dr. Martin</span>
          <span style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "999px", padding: "2px 10px", fontSize: "11px", fontWeight: "600" }}>✓ Professionnel certifié</span>
        </div>
        <textarea
          value={nouveauMessage} onChange={(e) => setNouveauMessage(e.target.value)}
          placeholder="Écrire un message..." rows={4}
          style={{ width: "100%", border: "1px solid #B8D8E8", borderRadius: "12px", padding: "14px", fontSize: "14px", color: "#1E3A4A", outline: "none", resize: "none", backgroundColor: "#FAFAFA", boxSizing: "border-box" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
          <button onClick={() => envoyerMessage(disc.id)} style={{ background: "linear-gradient(135deg, #004649 0%, #006B6F 100%)", color: "white", borderRadius: "12px", padding: "12px 32px", fontSize: "14px", fontWeight: "600", border: "none", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,70,73,0.3)" }}>
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );

  const renderListeDiscussions = (liste, retourAction) => (
    <div>
      <button onClick={retourAction} style={{ background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)", border: "1px solid rgba(255,255,255,0.8)", color: "#1E3A4A", fontWeight: "600", fontSize: "15px", cursor: "pointer", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      ← Retour aux catégories
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {liste.map((msg) => (
          <div key={msg.id} onClick={() => setDiscussionOuverte(msg.id)} style={{
            background: "linear-gradient(135deg, #FDFAF4 0%, #F5F0E8 100%)",
            borderRadius: "16px", padding: "24px 28px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
            cursor: "pointer", border: "1px solid rgba(255,255,255,0.6)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              {msg.epingle && <span style={{ fontSize: "14px" }}>📌</span>}
              <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px" }}>{msg.titre}</p>
            </div>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>par {msg.auteur}, le {msg.date}</p>
            <p style={{ color: "#555", fontSize: "13px", fontStyle: "italic", lineHeight: "1.5", marginBottom: "16px" }}>« {msg.contenu} »</p>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ color: "#E07B39", fontSize: "13px" }}>❤️ {msg.likes}</span>
              <span style={{ color: "#888", fontSize: "13px" }}>💬 {msg.reponses} réponses</span>
              <span style={{ color: "#004649", fontSize: "13px", fontWeight: "600" }}>✨ Ajouter une réponse</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F0F4F8" }}>
      <NavBar actif="forum" />
      <div style={{ padding: "40px 80px", maxWidth: "1000px", margin: "0 auto" }}>
        {discussionOuverte !== null ? (
          renderDiscussion(tousLesMessages.find((m) => m.id === discussionOuverte), () => setDiscussionOuverte(null))
        ) : categorieOuverte !== null ? (
          renderListeDiscussions(categoriesData.find((c) => c.id === categorieOuverte).discussions, () => setCategorieOuverte(null))
        ) : (
          <div>
            <div style={{ display: "flex", borderBottom: "2px solid #DFF0EA", marginBottom: "32px", gap: "40px" }}>
              {["categories", "messages"].map((o) => {
                const labels = { categories: "Catégories", messages: "Derniers messages" };
                const actif = onglet === o;
                return (
                  <button key={o} onClick={() => setOnglet(o)} style={{ padding: "12px 0", fontSize: "15px", fontWeight: actif ? "700" : "400", color: "#1E3A4A", background: "none", border: "none", cursor: "pointer", borderBottom: actif ? "3px solid #004649" : "3px solid transparent", marginBottom: "-2px" }}>
                    {labels[o]}
                  </button>
                );
              })}
            </div>

            {onglet === "categories" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {categoriesData.map((cat) => (
                  <div key={cat.id} onClick={() => setCategorieOuverte(cat.id)} style={{
                    background: "linear-gradient(135deg, #ffffff 0%, #f0f4f8 100%)",
                    borderRadius: "16px", padding: "24px 32px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    cursor: "pointer", border: "1px solid rgba(255,255,255,0.6)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                      <span style={{ fontSize: "28px" }}>{cat.icon}</span>
                      <span style={{ color: "#1E3A4A", fontWeight: "600", fontSize: "15px" }}>{cat.nom}</span>
                    </div>
                    <span style={{ color: "#888", fontSize: "13px" }}>{cat.nbSujets} sujets →</span>
                  </div>
                ))}
              </div>
            )}

            {onglet === "messages" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {tousLesMessages.map((msg) => (
                  <div key={msg.id} onClick={() => setDiscussionOuverte(msg.id)} style={{
                    background: "linear-gradient(135deg, #FDFAF4 0%, #F5F0E8 100%)",
                    borderRadius: "16px", padding: "24px 28px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                    cursor: "pointer", border: "1px solid rgba(255,255,255,0.6)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      {msg.epingle && <span style={{ fontSize: "14px" }}>📌</span>}
                      <p style={{ color: "#1E3A4A", fontWeight: "700", fontSize: "15px" }}>{msg.titre}</p>
                    </div>
                    <p style={{ color: "#888", fontSize: "13px", marginBottom: "10px" }}>par {msg.auteur}, le {msg.date}</p>
                    <p style={{ color: "#555", fontSize: "13px", fontStyle: "italic", lineHeight: "1.5", marginBottom: "16px" }}>« {msg.contenu} »</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                      <span style={{ color: "#E07B39", fontSize: "13px" }}>❤️ {msg.likes}</span>
                      <span style={{ color: "#888", fontSize: "13px" }}>💬 {msg.reponses} réponses</span>
                      <span style={{ color: "#004649", fontSize: "13px", fontWeight: "600" }}>✨ Ajouter une réponse</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}