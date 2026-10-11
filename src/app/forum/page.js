"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import EchangesSwitch from "@/components/EchangesSwitch";

const CATEGORIE_CONFIG = {
  temoignages: { nom: "Témoignages", icon: "💬" },
  conseils_sevrage: { nom: "Conseils sevrage", icon: "🌿" },
  gestion_stress: { nom: "Gestion du stress", icon: "🧘" },
  substituts: { nom: "Substituts nicotiniques", icon: "🧪" },
  rechutes: { nom: "Rechutes & reprises", icon: "🔄" },
};

function categorieLabel(cat) {
  return CATEGORIE_CONFIG[cat]?.nom || cat;
}
function categorieIcon(cat) {
  return CATEGORIE_CONFIG[cat]?.icon || "💬";
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
    " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}


const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "20px", padding: "32px",
  boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
  marginBottom: "20px",
};

function ForumContent() {
  const { pro } = useProProfile();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState("messages");
  const [categorieOuverte, setCategorieOuverte] = useState(null);
  const [postOuvert, setPostOuvert] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const [{ data: postsData }, { data: commentsData }] = await Promise.all([
      supabase.from("forum_posts").select("*").order("created_at", { ascending: false }),
      supabase.from("forum_comments").select("post_id"),
    ]);

    if (postsData) {
      // Compute real counts from actual comments rows
      const counts = {};
      (commentsData || []).forEach((c) => {
        counts[c.post_id] = (counts[c.post_id] || 0) + 1;
      });
      const merged = postsData.map((p) => ({
        ...p,
        comments_count: counts[p.id] ?? p.comments_count ?? 0,
      }));
      setPosts(merged);
      const cats = Object.entries(CATEGORIE_CONFIG).map(([id, cfg]) => ({
        id,
        nom: cfg.nom,
        icon: cfg.icon,
        nbSujets: merged.filter((p) => p.categorie === id).length,
      }));
      setCategories(cats);
    }
    setLoading(false);
  }

  async function openPost(post) {
    setLoadingComments(true);
    const { data } = await supabase
      .from("forum_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    const comments = data || [];
    // Use real count from loaded comments
    setPostOuvert({ ...post, comments_count: comments.length });
    setCommentaires(comments);
    setLoadingComments(false);
  }

  async function envoyerMessage() {
    if (!nouveauMessage.trim() || !pro || !postOuvert) return;
    setEnvoi(true);

    const pseudo = `Dr. ${pro.prenom} ${pro.nom}${pro.specialite ? ` · ${pro.specialite}` : ""}`;

    const { data: newComment } = await supabase
      .from("forum_comments")
      .insert({
        post_id: postOuvert.id,
        user_id: pro.id,
        pseudo,
        contenu: nouveauMessage,
        is_pro: true,
      })
      .select()
      .single();

    if (newComment) {
      setCommentaires((prev) => [...prev, newComment]);
      const { data: updatedPost } = await supabase
        .from("forum_posts")
        .select("comments_count")
        .eq("id", postOuvert.id)
        .single();
      const newCount = updatedPost?.comments_count ?? (postOuvert.comments_count || 0) + 1;
      setPostOuvert((prev) => ({ ...prev, comments_count: newCount }));
      setPosts((prev) =>
        prev.map((p) => p.id === postOuvert.id ? { ...p, comments_count: newCount } : p)
      );
    }

    setNouveauMessage("");
    setEnvoi(false);
  }

  const postsInCategorie = categorieOuverte
    ? posts.filter((p) => p.categorie === categorieOuverte)
    : [];


  const BadgePro = () => (
    <span style={{
      background: "#DCEEE6",
      color: "#004649", borderRadius: "999px", padding: "3px 10px",
      fontSize: "11px", fontWeight: "600",
    }}>✓ Professionnel certifié</span>
  );

  const renderPost = () => {
    if (!postOuvert) return null;
    const pseudoPro = pro ? `Dr. ${pro.prenom} ${pro.nom}${pro.specialite ? ` · ${pro.specialite}` : ""}` : "";

    return (
      <div>
        <button
          onClick={() => { setPostOuvert(null); setCommentaires([]); }}
          style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "white", border: "1px solid rgba(0,70,73,0.12)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A3F4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </div>
          <div>
            <p style={{ margin: 0, fontSize: "11px", color: "#004649", fontWeight: "500", letterSpacing: "0.18em" }}>DISCUSSIONS</p>
            <p style={{ margin: 0, fontSize: "15px", color: "#004649", fontWeight: "600" }}>{postOuvert.titre}</p>
          </div>
        </button>

        <div style={cardStyle}>
          <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "17px", marginBottom: "8px" }}>{postOuvert.titre}</p>
          <p style={{ color: "#5A6B72", fontSize: "13px", marginBottom: "16px" }}>
            par {postOuvert.pseudo}, le {formatDate(postOuvert.created_at)}
          </p>
          <p style={{ color: "#2A3F4F", fontSize: "14px", lineHeight: "1.6", fontStyle: "italic" }}>
            « {postOuvert.contenu} »
          </p>
          <div style={{ display: "flex", gap: "20px", marginTop: "16px" }}>
            <span style={{ color: "#E07B39", fontSize: "13px" }}>❤️ {postOuvert.likes_count || 0}</span>
            <span style={{ color: "#5A6B72", fontSize: "13px" }}>💬 {postOuvert.comments_count || 0} réponses</span>
          </div>
        </div>

        {loadingComments ? (
          <p style={{ color: "#5A6B72", fontSize: "14px" }}>Chargement des commentaires...</p>
        ) : commentaires.map((msg, i) => (
          <div key={i} style={{
            background: msg.is_pro ? "#F1F8F5" : "#FFFFFF",
            borderRadius: "24px", padding: "24px",
            border: "1px solid rgba(0,70,73,0.08)",
            boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
            marginBottom: "12px",
                      }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
              <span style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "14px" }}>{msg.pseudo}</span>
              {msg.is_pro && <BadgePro />}
              <span style={{ color: "#90A4AE", fontSize: "12px", marginLeft: "auto" }}>{formatDate(msg.created_at)}</span>
            </div>
            <p style={{ color: "#2A3F4F", fontSize: "14px", lineHeight: "1.6" }}>{msg.contenu}</p>
          </div>
        ))}

        <div style={{ ...cardStyle, marginTop: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "14px" }}>{pseudoPro}</span>
            <BadgePro />
          </div>
          <textarea
            value={nouveauMessage}
            onChange={(e) => setNouveauMessage(e.target.value)}
            placeholder="Écrire un message..."
            rows={4}
            style={{ width: "100%", border: "1px solid rgba(0,70,73,0.14)", borderRadius: "14px", padding: "14px", fontSize: "14px", color: "#2A3F4F", outline: "none", resize: "none", backgroundColor: "#F7FAFC", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button
              onClick={envoyerMessage}
              disabled={envoi || !nouveauMessage.trim()}
              style={{
                background: (envoi || !nouveauMessage.trim()) ? "#90A4AE" : "linear-gradient(135deg, #004649 0%, #00363A 100%)",
                color: "#F4EDE4", borderRadius: "50px", padding: "12px 32px",
                fontSize: "14px", fontWeight: "600", border: "none",
                cursor: (envoi || !nouveauMessage.trim()) ? "not-allowed" : "pointer",
                boxShadow: "0 4px 8px rgba(0,70,73,0.3)",
              }}
            >{envoi ? "Envoi..." : "Envoyer"}</button>
          </div>
        </div>
      </div>
    );
  };

  const renderListeDiscussions = () => (
    <div>
      <button
        onClick={() => setCategorieOuverte(null)}
        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "24px" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "white", border: "1px solid rgba(0,70,73,0.12)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2A3F4F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: "11px", color: "#004649", fontWeight: "500", letterSpacing: "0.18em" }}>CATÉGORIES</p>
          <p style={{ margin: 0, fontSize: "15px", color: "#004649", fontWeight: "600" }}>{categorieIcon(categorieOuverte)} {categorieLabel(categorieOuverte)}</p>
        </div>
      </button>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {postsInCategorie.length === 0 ? (
          <p style={{ color: "#90A4AE", fontSize: "14px", fontStyle: "italic" }}>Aucune discussion dans cette catégorie</p>
        ) : postsInCategorie.map((post) => (
          <div key={post.id} onClick={() => openPost(post)} style={{
            background: "#FFFFFF",
            borderRadius: "24px", padding: "24px 28px",
            boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
            cursor: "pointer", border: "1px solid rgba(0,70,73,0.08)",
          }}>
            <p style={{ color: "#004649", fontWeight: "600", fontSize: "16px", marginBottom: "6px" }}>{post.titre}</p>
            <p style={{ color: "#5A6B72", fontSize: "13px", marginBottom: "10px" }}>par {post.pseudo}, le {formatDate(post.created_at)}</p>
            <p style={{ color: "#5A6B72", fontSize: "13px", fontStyle: "italic", lineHeight: "1.5", marginBottom: "16px" }}>« {post.contenu} »</p>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span style={{ color: "#E07B39", fontSize: "13px" }}>❤️ {post.likes_count || 0}</span>
              <span style={{ color: "#5A6B72", fontSize: "13px" }}>💬 {post.comments_count || 0} réponses</span>
              <span style={{ color: "#004649", fontSize: "13px", fontWeight: "600" }}>✨ Répondre</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />
      <div style={{ padding: "40px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>
        {postOuvert ? (
          renderPost()
        ) : categorieOuverte ? (
          renderListeDiscussions()
        ) : (
          <div>
            <PageHeader eyebrow="Échanges" title="Forum communauté" subtitle="Discussions publiques : répondez aux patients en tant que professionnel certifié" />
            <EchangesSwitch actif="forum" proId={pro?.id} />
            <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "4px", padding: "6px", background: "#FFFFFF", borderRadius: "50px", border: "1px solid rgba(0,70,73,0.08)", boxShadow: "0 8px 24px rgba(0,70,73,0.05)", marginBottom: "28px" }}>
              {["messages", "categories"].map((o) => {
                const labels = { categories: "Catégories", messages: "Dernières discussions" };
                const actif = onglet === o;
                return (
                  <button key={o} onClick={() => setOnglet(o)} style={{ padding: "10px 20px", fontSize: "14px", fontWeight: actif ? "600" : "500", color: actif ? "#F4EDE4" : "#5A6B72", background: actif ? "#004649" : "transparent", border: "none", borderRadius: "50px", cursor: "pointer", transition: "all 0.2s ease" }}>
                    {labels[o]}
                  </button>
                );
              })}
            </div>

            {loading ? (
              <p style={{ color: "#5A6B72", fontSize: "14px" }}>Chargement du forum...</p>
            ) : (
              <>
                {onglet === "categories" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {categories.length === 0 ? (
                      <p style={{ color: "#90A4AE", fontSize: "14px", fontStyle: "italic" }}>Aucune discussion pour le moment</p>
                    ) : categories.map((cat) => (
                      <div key={cat.id} onClick={() => setCategorieOuverte(cat.id)} style={{
                        background: "#FFFFFF",
                        borderRadius: "24px", padding: "22px 28px",
                        boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        cursor: "pointer", border: "1px solid rgba(0,70,73,0.08)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                          <span style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#EAF3F8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>{cat.icon}</span>
                          <span style={{ color: "#004649", fontWeight: "600", fontSize: "16px" }}>{cat.nom}</span>
                        </div>
                        <span style={{ color: "#004649", fontSize: "13px", fontWeight: "600", background: "#EAF3F8", borderRadius: "50px", padding: "6px 14px" }}>{cat.nbSujets} sujet{cat.nbSujets > 1 ? "s" : ""} →</span>
                      </div>
                    ))}
                  </div>
                )}

                {onglet === "messages" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {posts.length === 0 ? (
                      <p style={{ color: "#90A4AE", fontSize: "14px", fontStyle: "italic" }}>Aucun message pour le moment</p>
                    ) : posts.map((post) => (
                      <div key={post.id} onClick={() => openPost(post)} style={{
                        background: "#FFFFFF",
                        borderRadius: "24px", padding: "24px 28px",
                        boxShadow: "0 8px 24px rgba(0,70,73,0.05)",
                        cursor: "pointer", border: "1px solid rgba(0,70,73,0.08)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                          <span style={{ fontSize: "12px", color: "#004649", background: "#EAF3F8", borderRadius: "50px", padding: "4px 12px" }}>{categorieIcon(post.categorie)} {categorieLabel(post.categorie)}</span>
                        </div>
                        <p style={{ color: "#004649", fontWeight: "600", fontSize: "16px", marginBottom: "6px" }}>{post.titre}</p>
                        <p style={{ color: "#5A6B72", fontSize: "13px", marginBottom: "10px" }}>par {post.pseudo}, le {formatDate(post.created_at)}</p>
                        <p style={{ color: "#5A6B72", fontSize: "13px", fontStyle: "italic", lineHeight: "1.5", marginBottom: "16px" }}>« {post.contenu} »</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                          <span style={{ color: "#E07B39", fontSize: "13px" }}>❤️ {post.likes_count || 0}</span>
                          <span style={{ color: "#5A6B72", fontSize: "13px" }}>💬 {post.comments_count || 0} réponses</span>
                          <span style={{ color: "#004649", fontSize: "13px", fontWeight: "600" }}>✨ Répondre</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Forum() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><p style={{ color: "#5A6B72" }}>Chargement...</p></div>}>
      <ForumContent />
    </Suspense>
  );
}
