"use client";
import { useState, useEffect, useRef, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProProfile } from "@/lib/useProProfile";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import EchangesSwitch from "@/components/EchangesSwitch";

function initiales(p) {
  return `${(p?.prenom || "")[0] || ""}${(p?.nom || "")[0] || ""}`.toUpperCase();
}

function formatHeure(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function MessagerieContent() {
  const { pro } = useProProfile();
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState([]);
  const [apercus, setApercus] = useState({}); // patientId -> { dernier, nonLus }
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [patientSel, setPatientSel] = useState(null);
  const [thread, setThread] = useState([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const [msgContent, setMsgContent] = useState("");
  const [sending, setSending] = useState(false);
  const threadEndRef = useRef(null);

  useEffect(() => {
    if (!pro) return;
    loadPatients();
  }, [pro]);

  async function loadPatients() {
    setLoading(true);
    const { data: links } = await supabase
      .from("patient_professional_links")
      .select("patient_id")
      .eq("professional_id", pro.id);
    const ids = (links || []).map((l) => l.patient_id);
    if (ids.length === 0) {
      setPatients([]);
      setLoading(false);
      return;
    }
    const [{ data: profiles }, { data: msgs }] = await Promise.all([
      supabase.from("profiles").select("id, prenom, nom").in("id", ids),
      supabase.from("pro_patient_messages").select("patient_id, content, created_at, sender_type, read_at")
        .eq("pro_id", pro.id).order("created_at", { ascending: false }).limit(500),
    ]);
    const ap = {};
    (msgs || []).forEach((m) => {
      if (!ap[m.patient_id]) ap[m.patient_id] = { dernier: m, nonLus: 0 };
      if (m.sender_type === "patient" && !m.read_at) ap[m.patient_id].nonLus += 1;
    });
    const liste = (profiles || []).sort((a, b) =>
      new Date(ap[b.id]?.dernier?.created_at || 0) - new Date(ap[a.id]?.dernier?.created_at || 0));
    setApercus(ap);
    setPatients(liste);
    setLoading(false);

    const pid = searchParams.get("patientId");
    const cible = (pid && liste.find((p) => p.id === pid)) || null;
    if (cible) selectPatient(cible);
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
    setApercus((prev) => ({ ...prev, [patient.id]: { ...(prev[patient.id] || {}), nonLus: 0 } }));
    await supabase
      .from("pro_patient_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("pro_id", pro.id)
      .eq("patient_id", patient.id)
      .eq("sender_type", "patient")
      .is("read_at", null);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  // Temps réel : nouveaux messages
  useEffect(() => {
    if (!pro) return;
    const channel = supabase
      .channel(`messagerie_pro_${pro.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "pro_patient_messages", filter: `pro_id=eq.${pro.id}` }, (payload) => {
        const m = payload.new;
        if (patientSel && m.patient_id === patientSel.id) {
          setThread((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
        }
        setApercus((prev) => ({
          ...prev,
          [m.patient_id]: {
            dernier: m,
            nonLus: (prev[m.patient_id]?.nonLus || 0) + (m.sender_type === "patient" && m.patient_id !== patientSel?.id ? 1 : 0),
          },
        }));
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [pro, patientSel]);

  async function sendMsg() {
    if (!msgContent.trim() || !pro || !patientSel || sending) return;
    setSending(true);
    const text = msgContent.trim();
    setMsgContent("");
    const { data: newMsg } = await supabase
      .from("pro_patient_messages")
      .insert({ pro_id: pro.id, patient_id: patientSel.id, sender_type: "pro", content: text })
      .select().single();
    if (newMsg) {
      setThread((prev) => (prev.some((x) => x.id === newMsg.id) ? prev : [...prev, newMsg]));
      setApercus((prev) => ({ ...prev, [patientSel.id]: { dernier: newMsg, nonLus: 0 } }));
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setSending(false);
  }

  const patientsFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return q ? patients.filter((p) => `${p.prenom || ""} ${p.nom || ""}`.toLowerCase().includes(q)) : patients;
  }, [patients, recherche]);

  const avatar = (p, size, radius) => (
    <div style={{ width: size, height: size, borderRadius: radius, flexShrink: 0, background: "linear-gradient(135deg, #A5C9B9 0%, #B7D7E8 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ color: "#004649", fontWeight: "700", fontSize: size >= 44 ? "15px" : "12px" }}>{initiales(p)}</span>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#EAF3F8" }}>
      <Navbar proId={pro?.id} />
      <div style={{ padding: "40px 48px 72px", maxWidth: "1280px", margin: "0 auto" }}>
        <PageHeader eyebrow="Échanges" title="Messages privés" subtitle="Échanges confidentiels avec vos patients, visibles uniquement dans leur application Rêvade" />
        <EchangesSwitch actif="prive" proId={pro?.id} />

        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", height: "640px", background: "#FFFFFF", borderRadius: "24px", border: "1px solid rgba(0,70,73,0.08)", boxShadow: "0 8px 24px rgba(0,70,73,0.05)", overflow: "hidden" }}>

          {/* Liste des patients */}
          <aside style={{ borderRight: "1px solid rgba(0,70,73,0.08)", display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F3F8FB", borderRadius: "50px", padding: "10px 16px" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#5A6B72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                <input value={recherche} onChange={(e) => setRecherche(e.target.value)} placeholder="Rechercher un patient…"
                  style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: "13px", color: "#2A3F4F" }} />
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 10px 12px" }}>
              {loading ? (
                <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center", marginTop: "24px" }}>Chargement…</p>
              ) : patientsFiltres.length === 0 ? (
                <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center", marginTop: "24px", padding: "0 16px", lineHeight: 1.5 }}>
                  {patients.length === 0 ? "Aucun patient lié pour le moment" : "Aucun patient trouvé"}
                </p>
              ) : patientsFiltres.map((p) => {
                const actif = patientSel?.id === p.id;
                const ap = apercus[p.id];
                return (
                  <button key={p.id} onClick={() => selectPatient(p)} style={{
                    width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px", borderRadius: "18px", border: "none", cursor: "pointer", marginBottom: "4px",
                    background: actif ? "#EAF3F8" : "transparent", transition: "background 0.15s ease",
                  }}>
                    {avatar(p, 44, "16px")}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                        <span style={{ color: "#004649", fontWeight: "600", fontSize: "14px", overflowWrap: "anywhere" }}>{p.prenom} {p.nom}</span>
                        {ap?.dernier && <span style={{ color: "#90A4AE", fontSize: "11px", whiteSpace: "nowrap" }}>{formatHeure(ap.dernier.created_at)}</span>}
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                        <span style={{ color: ap?.nonLus ? "#2A3F4F" : "#5A6B72", fontWeight: ap?.nonLus ? "600" : "400", fontSize: "12px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {ap?.dernier ? `${ap.dernier.sender_type === "pro" ? "Vous : " : ""}${ap.dernier.content}` : "Aucun message"}
                        </span>
                        {ap?.nonLus > 0 && (
                          <span style={{ background: "#004649", color: "#F4EDE4", borderRadius: "50px", minWidth: "20px", height: "20px", padding: "0 6px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ap.nonLus}</span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Conversation */}
          <section style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "#F3F8FB" }}>
            {!patientSel ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", padding: "24px", textAlign: "center" }}>
                <div style={{ width: "72px", height: "72px", borderRadius: "24px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px" }}>💬</div>
                <p style={{ color: "#004649", fontWeight: "600", fontSize: "16px" }}>Sélectionnez un patient</p>
                <p style={{ color: "#5A6B72", fontSize: "13px", maxWidth: "320px", lineHeight: 1.6 }}>
                  Vos messages sont privés : seul le patient concerné les reçoit, directement dans son application Rêvade.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 24px", background: "#FFFFFF", borderBottom: "1px solid rgba(0,70,73,0.08)" }}>
                  {avatar(patientSel, 44, "16px")}
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#004649", fontWeight: "600", fontSize: "15px" }}>{patientSel.prenom} {patientSel.nom}</p>
                    <p style={{ color: "#90A4AE", fontSize: "12px" }}>🔒 Conversation privée</p>
                  </div>
                  <Link href={`/patients/${patientSel.id}`} style={{ textDecoration: "none", color: "#004649", fontSize: "13px", fontWeight: "600", background: "#EAF3F8", borderRadius: "50px", padding: "8px 16px", whiteSpace: "nowrap" }}>
                    Voir la fiche →
                  </Link>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  {loadingThread ? (
                    <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center" }}>Chargement…</p>
                  ) : thread.length === 0 ? (
                    <p style={{ color: "#90A4AE", fontSize: "13px", textAlign: "center", marginTop: "40px" }}>
                      Aucun message — démarrez la conversation, {patientSel.prenom} sera notifié(e) dans son application.
                    </p>
                  ) : thread.map((m) => {
                    const isPro = m.sender_type === "pro";
                    return (
                      <div key={m.id} style={{ display: "flex", justifyContent: isPro ? "flex-end" : "flex-start" }}>
                        <div style={{ maxWidth: "68%" }}>
                          <div style={{
                            padding: "11px 16px", fontSize: "14px", lineHeight: 1.5, whiteSpace: "pre-wrap",
                            borderRadius: isPro ? "20px 20px 6px 20px" : "20px 20px 20px 6px",
                            background: isPro ? "#004649" : "#FFFFFF", color: isPro ? "#F4EDE4" : "#2A3F4F",
                            border: isPro ? "none" : "1px solid rgba(0,70,73,0.08)",
                            boxShadow: isPro ? "0 6px 16px rgba(0,70,73,0.18)" : "none",
                          }}>{m.content}</div>
                          <p style={{ color: "#90A4AE", fontSize: "11px", margin: "4px 8px 0", textAlign: isPro ? "right" : "left" }}>{formatHeure(m.created_at)}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={threadEndRef} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 18px", background: "#FFFFFF", borderTop: "1px solid rgba(0,70,73,0.08)" }}>
                  <textarea value={msgContent} onChange={(e) => setMsgContent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMsg(); } }}
                    placeholder={`Message à ${patientSel.prenom}… (Entrée pour envoyer)`} rows={1}
                    style={{ flex: 1, border: "1px solid rgba(0,70,73,0.12)", borderRadius: "24px", padding: "12px 20px", fontSize: "14px", outline: "none", resize: "none", color: "#2A3F4F", background: "#F7FAFC", lineHeight: 1.5 }} />
                  <button onClick={sendMsg} disabled={sending || !msgContent.trim()} title="Envoyer" style={{
                    width: "46px", height: "46px", borderRadius: "50%", border: "none", flexShrink: 0,
                    background: sending || !msgContent.trim() ? "#E8EEF2" : "#004649",
                    cursor: sending || !msgContent.trim() ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sending || !msgContent.trim() ? "#90A4AE" : "#F4EDE4"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function Messagerie() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><p style={{ color: "#5A6B72" }}>Chargement…</p></div>}>
      <MessagerieContent />
    </Suspense>
  );
}
