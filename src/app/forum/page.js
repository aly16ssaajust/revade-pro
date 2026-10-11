"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";

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
  const searchParams = useSearchParams();
  const threadEndRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState(searchParams.get("tab") === "messagerie" ? "messagerie" : "messages");
  const [categorieOuverte, setCategorieOuverte] = useState(null);
  const [postOuvert, setPostOuvert] = useState(null);
  const [commentaires, setCommentaires] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [nouveauMessage, setNouveauMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // ── Messagerie ──────────────────────────────────────────────────────────────
  const [patientsMsg, setPatientsMsg] = useState([]);
  const [patientSel, setPatientSel] = useState(null);
  const [thread, setThread] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

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

  // ── Messagerie: load patients list ──────────────────────────────────────────
  useEffect(() => {
    if (!pro) return;
    loadPatientsMsg();
  }, [pro]);

  async function loadPatientsMsg() {
    const { data: links } = await supabase
      .from("patient_professional_links")
      .select("patient_id")
      .eq("professional_id", pro.id);
    const patientIds = (links || []).map((l) => l.patient_id);
    if (patientIds.length === 0) {
      setPatientsMsg([]);
      return;
    }
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .in("id", patientIds);
    const patients = profiles || [];
    setPatientsMsg(patients);

    // Auto-select from URL param
    const pid = searchParams.get("patientId");
    if (pid) {
      const found = patients.find((p) => p.id === pid);
      if (found) selectPatient(found);
    }
  }

  async function selectPatient(patient) {
    setPatientSel(patient);
    setLoadingThread(true);
    const { data } = await supabase
      .from("pro_patient_messages")
      .select("*")
      .eq("pro_id", pro.id)
      .eq("patient_id", patient.id)
      .order("created_at", { ascending: true });
    setThread(data || []);
    setLoadingThread(false);
    // Mark patient messages as read
    await supabase
      .from("pro_patient_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("pro_id", pro.id)
      .eq("patient_id", patient.id)
      .eq("sender_type", "patient")
      .is("read_at", null);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  useEffect(() => {
    if (!pro || !patientSel) return;
    const channel = supabase
      .channel(`msg_pro_${pro.id}_${patientSel.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pro_patient_messages",
        filter: `pro_id=eq.${pro.id}` }, (payload) => {
        if (payload.new?.patient_id === patientSel.id) {
          setThread((prev) => [...prev, payload.new]);
          setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [pro, patientSel]);

  async function sendMsg() {
    if (!msgContent.trim() || !pro || !patientSel || sendingMsg) return;
    setSendingMsg(true);
    const text = msgContent.trim();
    setMsgContent("");
    const { data: newMsg } = await supabase
      .from("pro_patient_messages")
      .insert({ pro_id: pro.id, patient_id: patientSel.id, sender_type: "pro", content: text })
      .select().single();
    if (newMsg) {
      setThread((prev) => [...prev, newMsg]);
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setSendingMsg(false);
  }

  function formatMsgTime(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
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
            <PageHeader eyebrow="Échanges" title={onglet === "messagerie" ? "Messagerie" : "Forum"} subtitle={onglet === "messagerie" ? "Échangez en privé avec vos patients" : "Discussions de la communauté Rêvade"} />
            <div style={{ display: "inline-flex", flexWrap: "wrap", gap: "4px", padding: "6px", background: "#FFFFFF", borderRadius: "50px", border: "1px solid rgba(0,70,73,0.08)", boxShadow: "0 8px 24px rgba(0,70,73,0.05)", marginBottom: "28px" }}>
              {["categories", "messages", "messagerie"].map((o) => {
                const labels = { categories: "Catégories", messages: "Derniers messages", messagerie: "Messagerie patients" };
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
                {onglet === "messagerie" && (
                  <div style={{ display: "flex", gap: "24px", minHeight: "520px" }}>
                    {/* Patient list */}
                    <div style={{ width: "240px", flexShrink: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                      <p style={{ color: "#004649", fontWeight: "500", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "6px" }}>Mes patients</p>
                      {patientsMsg.length === 0 ? (
                        <p style={{ color: "#90A4AE", fontSize: "13px", fontStyle: "italic" }}>Aucun patient lié</p>
                      ) : patientsMsg.map((p) => (
                        <button key={p.id} onClick={() => selectPatient(p)} style={{ textAlign: "left", padding: "12px 14px", borderRadius: "50px", border: "none", cursor: "pointer", background: patientSel?.id === p.id ? "linear-gradient(135deg, #004649, #00363A)" : "linear-gradient(135deg, #ffffff, #EAF3F8)", color: patientSel?.id === p.id ? "white" : "#2A3F4F", fontWeight: "600", fontSize: "14px", boxShadow: "0 8px 24px rgba(0,70,73,0.05)" }}>
                          {p.prenom} {p.nom}
                        </button>
                      ))}
                    </div>

                    {/* Thread */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#FFFFFF", borderRadius: "24px", boxShadow: "0 8px 24px rgba(0,70,73,0.06)", overflow: "hidden" }}>
                      {!patientSel ? (
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", color: "#90A4AE" }}>
                          <span style={{ fontSize: "40px" }}>💬</span>
                          <p style={{ fontSize: "14px" }}>Sélectionnez un patient pour démarrer la messagerie</p>
                        </div>
                      ) : (
                        <>
                          {/* Thread header */}
                          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(0,70,73,0.08)", background: "#FFFFFF" }}>
                            <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "15px" }}>{patientSel.prenom} {patientSel.nom}</p>
                          </div>

                          {/* Messages */}
                          <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "10px", maxHeight: "340px" }}>
                            {loadingThread ? (
                              <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center" }}>Chargement…</p>
                            ) : thread.length === 0 ? (
                              <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>Aucun message — commencez la conversation</p>
                            ) : thread.map((msg) => {
                              const isPro = msg.sender_type === "pro";
                              return (
                                <div key={msg.id} style={{ display: "flex", justifyContent: isPro ? "flex-end" : "flex-start" }}>
                                  <div style={{ maxWidth: "70%", padding: "10px 14px", borderRadius: isPro ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: isPro ? "#004649" : "#EAF3F8", color: isPro ? "#F4EDE4" : "#2A3F4F", boxShadow: "0 8px 24px rgba(0,70,73,0.05)", fontSize: "14px", lineHeight: "1.5" }}>
                                    <p style={{ margin: 0 }}>{msg.content}</p>
                                    <p style={{ margin: "4px 0 0", fontSize: "11px", opacity: 0.7, textAlign: "right" }}>{formatMsgTime(msg.created_at)}</p>
                                  </div>
                                </div>
                              );
                            })}
                            <div ref={threadEndRef} />
                          </div>

                          {/* Input */}
                          <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(0,70,73,0.08)", display: "flex", gap: "10px", alignItems: "flex-end" }}>
                            <textarea
                              value={msgContent}
                              onChange={(e) => setMsgContent(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                              placeholder="Écrire un message…"
                              rows={2}
                              style={{ flex: 1, border: "1px solid rgba(0,70,73,0.12)", borderRadius: "22px", padding: "11px 18px", fontSize: "14px", outline: "none", resize: "none", background: "#F7FAFC", color: "#2A3F4F", fontFamily: "inherit", lineHeight: "1.5" }}
                            />
                            <button
                              onClick={sendMsg}
                              disabled={sendingMsg || !msgContent.trim()}
                              style={{ background: sendingMsg || !msgContent.trim() ? "#B0BEC5" : "linear-gradient(135deg, #004649, #00363A)", color: "#F4EDE4", border: "none", borderRadius: "50px", padding: "10px 20px", fontSize: "14px", fontWeight: "600", cursor: sendingMsg || !msgContent.trim() ? "default" : "pointer", whiteSpace: "nowrap" }}>
                              {sendingMsg ? "…" : "Envoyer"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
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
