"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Toaster from "./Toaster";
import NightSky from "./NightSky";

const NAV_ITEMS = [
  { href: "/accueil", label: "Accueil" },
  { href: "/dashboard", label: "Fiches patients" },
  { href: "/agenda", label: "Agenda" },
  { href: "/forum", label: "Messagerie", msgBadge: true },
  { href: "/annuaire", label: "Annuaire" },
  { href: "/outils", label: "Outils" },
  { href: "/profil", label: "Profil" },
];

export default function Navbar({ proId, eyebrow, title, subtitle }) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingRdv, setPendingRdv] = useState([]);
  const [pendingMsgs, setPendingMsgs] = useState([]);
  const [cancelledRdv, setCancelledRdv] = useState([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [bellFlash, setBellFlash] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [cancelModal, setCancelModal] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const bellRef = useRef(null);
  const prevCountRef = useRef(null);

  useEffect(() => {
    if (!proId) return;
    loadPending();
    loadMsgNotifs();

    // Demander la permission de notification navigateur
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const rdvChannel = supabase
      .channel(`navbar_bell_${proId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "appointments",
        filter: `professional_id=eq.${proId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT" && payload.new?.statut === "en_attente") {
          setBellFlash(true);
          setTimeout(() => setBellFlash(false), 3000);
        }
        if (payload.eventType === "UPDATE" && payload.new?.statut === "annule") {
          setCancelledRdv(prev => {
            const filtered = prev.filter(r => r.id !== payload.new.id);
            return [payload.new, ...filtered].slice(0, 5);
          });
          setBellFlash(true);
          setTimeout(() => setBellFlash(false), 3000);
          if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
            new Notification("❌ RDV annulé", {
              body: `${payload.new.patient_name || "Un patient"} a annulé son rendez-vous`,
              icon: "/logo.png",
            });
          }
        }
        loadPending();
      })
      .subscribe();

    const msgChannel = supabase
      .channel(`navbar_msgs_${proId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "pro_patient_messages",
        filter: `pro_id=eq.${proId}`,
      }, (payload) => {
        if (payload.new?.sender_type !== "patient") return;
        loadMsgNotifs();
        if (typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
          new Notification("💬 Nouveau message patient", {
            body: "Un patient vous a envoyé un message",
            icon: "/logo.png",
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(rdvChannel);
      supabase.removeChannel(msgChannel);
    };
  }, [proId]);

  async function loadMsgNotifs() {
    if (!proId) return;
    const { data: msgs } = await supabase
      .from("pro_patient_messages")
      .select("patient_id")
      .eq("pro_id", proId)
      .eq("sender_type", "patient")
      .is("read_at", null);

    if (!msgs || msgs.length === 0) {
      setPendingMsgs([]);
      setUnreadMsgs(0);
      return;
    }

    const grouped = {};
    msgs.forEach((m) => { grouped[m.patient_id] = (grouped[m.patient_id] || 0) + 1; });
    const patientIds = Object.keys(grouped);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, prenom, nom")
      .in("id", patientIds);

    const result = patientIds.map((pid) => {
      const p = profiles?.find((pr) => pr.id === pid);
      return {
        patientId: pid,
        patientName: p ? `${p.prenom || ""} ${p.nom || ""}`.trim() : "Patient",
        count: grouped[pid],
      };
    });

    setPendingMsgs(result);
    setUnreadMsgs(result.reduce((sum, r) => sum + r.count, 0));
  }

  useEffect(() => {
    const count = pendingRdv.length;
    if (prevCountRef.current !== null && count > prevCountRef.current) {
      setBellFlash(true);
      setTimeout(() => setBellFlash(false), 3000);
    }
    prevCountRef.current = count;
  }, [pendingRdv]);

  // Fermer le dropdown en cliquant dehors
  useEffect(() => {
    function handleClick(e) {
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function loadPending() {
    if (!proId) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("professional_id", proId)
      .eq("statut", "en_attente")
      .order("date_heure");
    setPendingRdv(data ?? []);
  }

  function formatDate(isoString) {
    const d = new Date(isoString);
    const jours = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];
    const mois = ["jan", "fév", "mar", "avr", "mai", "juin", "juil", "août", "sep", "oct", "nov", "déc"];
    return `${jours[d.getDay()]} ${d.getDate()} ${mois[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}h${String(d.getMinutes()).padStart(2, "0")}`;
  }

  async function confirmRdv(rdv) {
    setSavingId(rdv.id);
    await supabase.from("appointments").update({ statut: "confirme" }).eq("id", rdv.id);
    setSavingId(null);
    loadPending();
  }

  async function executeCancelRdv() {
    if (!cancelModal) return;
    setSavingId(cancelModal.rdv.id);
    await supabase.from("appointments").update({
      statut: "annule",
      ...(cancelMessage.trim() ? { message_pro: cancelMessage.trim() } : {}),
    }).eq("id", cancelModal.rdv.id);
    setSavingId(null);
    setCancelModal(null);
    setCancelMessage("");
    loadPending();
  }

  // Reset unread badge when on the messagerie page
  useEffect(() => {
    if (pathname === "/forum") { setUnreadMsgs(0); setPendingMsgs([]); }
  }, [pathname]);

  const hasPending = pendingRdv.length > 0 || cancelledRdv.length > 0;
  const totalBell = pendingRdv.length + cancelledRdv.length;

  return (
    <>
      <Toaster />
      <header style={{ position: "relative", zIndex: 50, background: "#0B2F4B" }}>
      <NightSky />
      <nav style={{ position: "relative", zIndex: 2, maxWidth: "1280px", margin: "0 auto", padding: "22px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
        <Link href="/accueil" style={{ textDecoration: "none", display: "flex" }}>
          <Image src="/logo-white.svg" alt="Rêvade" width={110} height={40} priority />
        </Link>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {NAV_ITEMS.map((item) => {
            const actif = pathname === item.href || (item.href !== "/accueil" && pathname?.startsWith(item.href));
            const badge = item.msgBadge && unreadMsgs > 0 ? unreadMsgs : 0;
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none", position: "relative" }}>
                <div style={{ padding: "9px 16px", borderRadius: "50px", fontSize: "14px", fontWeight: actif ? "600" : "500", color: actif ? "#0B2F4B" : "rgba(244,237,228,0.82)", background: actif ? "linear-gradient(135deg, #A5C9B9, #B7D7E8)" : "transparent", boxShadow: actif ? "0 6px 20px rgba(0,0,0,0.25)" : "none", transition: "all 0.2s ease", whiteSpace: "nowrap" }}>
                  {item.label}
                </div>
                {badge > 0 && (
                  <div style={{ position: "absolute", top: "-6px", right: "-6px", background: "#E53935", color: "white", borderRadius: "50%", minWidth: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", border: "2px solid white", padding: "0 3px", pointerEvents: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                    {badge > 99 ? "99+" : badge}
                  </div>
                )}
              </Link>
            );
          })}

          {/* Cloche notifications */}
          {proId && (
            <div ref={bellRef} style={{ position: "relative" }}>
              <button
                onClick={() => { setBellOpen(o => !o); if (bellFlash) setBellFlash(false); }}
                title={hasPending ? `${pendingRdv.length} demande${pendingRdv.length > 1 ? "s" : ""} en attente` : "Aucune demande"}
                style={{ width: "40px", height: "40px", borderRadius: "50%", background: bellFlash ? "linear-gradient(135deg, #E65100, #FF6D00)" : hasPending ? "linear-gradient(135deg, rgba(255,243,224,0.95), rgba(255,224,178,0.95))" : "rgba(244,237,228,0.08)", border: "1px solid rgba(244,237,228,0.18)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", transition: "all 0.3s ease", boxShadow: hasPending ? "0 2px 8px rgba(230,81,0,0.25)" : "none", marginLeft: "8px" }}>
                🔔
              </button>
              {totalBell > 0 && (
                <div style={{ position: "absolute", top: "-6px", right: "-6px", background: cancelledRdv.length > 0 ? "#C62828" : "#E65100", color: "white", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "700", border: "2px solid white", pointerEvents: "none", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                  {totalBell}
                </div>
              )}

              {/* Dropdown */}
              {bellOpen && (
                <div style={{ position: "absolute", top: "52px", right: 0, width: "380px", background: "white", borderRadius: "16px", boxShadow: "0 16px 48px rgba(0,0,0,0.16), 0 4px 12px rgba(0,0,0,0.08)", border: "1px solid #E8E8E8", zIndex: 200, overflow: "hidden" }}>
                  {/* Header dropdown */}
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#EAF3F8" }}>
                    <div>
                      <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "14px", marginBottom: "2px" }}>
                        {hasPending ? `${pendingRdv.length} demande${pendingRdv.length > 1 ? "s" : ""} en attente` : "Notifications"}
                      </p>
                      <p style={{ color: "#90A4AE", fontSize: "11px" }}>Répondez directement ici</p>
                    </div>
                    <Link href="/agenda" onClick={() => setBellOpen(false)} style={{ color: "#0B2F4B", fontSize: "12px", fontWeight: "600", textDecoration: "none", background: "rgba(11,47,75,0.08)", padding: "6px 12px", borderRadius: "8px" }}>
                      Agenda →
                    </Link>
                  </div>

                  {/* Messages patients non lus */}
                  {pendingMsgs.length > 0 && (
                    <div>
                      <div style={{ padding: "10px 20px 6px", background: "#F8FAFB", borderBottom: "1px solid #F0F0F0" }}>
                        <p style={{ color: "#1565C0", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                          💬 Messages non lus
                        </p>
                      </div>
                      {pendingMsgs.map((msg) => (
                        <div
                          key={msg.patientId}
                          onClick={() => {
                            router.push(`/forum?tab=messagerie&patientId=${msg.patientId}`);
                            setBellOpen(false);
                            setPendingMsgs((prev) => prev.filter((m) => m.patientId !== msg.patientId));
                            setUnreadMsgs((n) => Math.max(0, n - msg.count));
                          }}
                          style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #F5F5F5" }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#EEF6FF"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                        >
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "linear-gradient(135deg, #E3F2FD, #BBDEFB)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px" }}>
                            💬
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "13px", marginBottom: "1px" }}>{msg.patientName}</p>
                            <p style={{ color: "#5A6B72", fontSize: "11px" }}>{msg.count} message{msg.count > 1 ? "s" : ""} non lu{msg.count > 1 ? "s" : ""}</p>
                          </div>
                          <div style={{ background: "#1565C0", color: "white", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
                            Ouvrir →
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* RDV annulés par patient */}
                  {cancelledRdv.length > 0 && (
                    <div>
                      <div style={{ padding: "10px 20px 6px", background: "#FFF5F5", borderBottom: "1px solid #FFEBEE", borderTop: "1px solid #F0F0F0" }}>
                        <p style={{ color: "#C62828", fontSize: "11px", fontWeight: "700", letterSpacing: "0.4px", textTransform: "uppercase" }}>
                          ❌ RDV annulés par le patient
                        </p>
                      </div>
                      {cancelledRdv.map((rdv) => (
                        <div key={rdv.id}
                          onClick={() => { router.push("/agenda"); setBellOpen(false); setCancelledRdv(prev => prev.filter(r => r.id !== rdv.id)); }}
                          style={{ padding: "12px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid #FFF5F5" }}
                          onMouseEnter={e => e.currentTarget.style.background = "#FFF5F5"}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px" }}>❌</div>
                          <div style={{ flex: 1 }}>
                            <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "13px", marginBottom: "1px" }}>
                              {rdv.patient_pseudo ? `@${rdv.patient_pseudo}` : rdv.patient_name || "Patient"}
                            </p>
                            <p style={{ color: "#C62828", fontSize: "11px" }}>A annulé son RDV · {formatDate(rdv.date_heure)}</p>
                          </div>
                          <div style={{ background: "#FFEBEE", color: "#C62828", border: "1px solid #EF9A9A", borderRadius: "6px", padding: "4px 10px", fontSize: "11px", fontWeight: "600", whiteSpace: "nowrap" }}>
                            Voir →
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {pendingRdv.length === 0 && cancelledRdv.length === 0 ? (
                    <div style={{ padding: pendingMsgs.length > 0 ? "16px 20px" : "32px 20px", textAlign: "center" }}>
                      {pendingMsgs.length === 0 && <><div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
                      <p style={{ color: "#5A6B72", fontSize: "13px", fontWeight: "600" }}>Tout est à jour</p>
                      <p style={{ color: "#90A4AE", fontSize: "12px", marginTop: "4px" }}>Aucune demande en attente</p></>}
                      {pendingMsgs.length > 0 && <p style={{ color: "#90A4AE", fontSize: "12px", fontStyle: "italic" }}>Aucune demande de RDV en attente</p>}
                    </div>
                  ) : pendingRdv.length > 0 && (
                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                      {pendingRdv.map((rdv, i) => (
                        <div key={rdv.id} style={{ padding: "16px 20px", borderBottom: i < pendingRdv.length - 1 ? "1px solid #F5F5F5" : "none" }}>
                          {/* Patient info */}
                          <div style={{ marginBottom: "10px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3px" }}>
                              <p style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "14px" }}>
                                {rdv.patient_pseudo ? `@${rdv.patient_pseudo}` : rdv.patient_name || "Patient"}
                              </p>
                              <span style={{ background: "#FFF3E0", color: "#E65100", fontSize: "10px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", border: "1px solid #FFCC80" }}>
                                En attente
                              </span>
                            </div>
                            <p style={{ color: "#5A6B72", fontSize: "12px" }}>📅 {formatDate(rdv.date_heure)}</p>
                            {rdv.patient_user_id && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "3px" }}>
                                <code style={{ color: "#5A6B72", fontSize: "9px", fontFamily: "monospace", background: "#EAF3F8", padding: "1px 5px", borderRadius: "3px", letterSpacing: "0.2px" }}>
                                  {rdv.patient_user_id}
                                </code>
                                <button
                                  onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(rdv.patient_user_id); }}
                                  title="Copier l'identifiant"
                                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "10px", padding: "1px", color: "#90A4AE", lineHeight: 1 }}>
                                  📋
                                </button>
                              </div>
                            )}
                            {rdv.motif && (
                              <p style={{ color: "#888", fontSize: "11px", marginTop: "2px", fontStyle: "italic" }}>"{rdv.motif}"</p>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => confirmRdv(rdv)}
                              disabled={savingId === rdv.id}
                              style={{ flex: 1, background: savingId === rdv.id ? "#E0E0E0" : "linear-gradient(135deg, #0B2F4B, #072238)", color: "#F4EDE4", border: "none", borderRadius: "50px", padding: "8px 12px", fontSize: "12px", fontWeight: "700", cursor: savingId === rdv.id ? "default" : "pointer", transition: "opacity 0.2s" }}>
                              {savingId === rdv.id ? "…" : "✓ Confirmer"}
                            </button>
                            <button
                              onClick={() => { setCancelModal({ rdv }); setCancelMessage(""); setBellOpen(false); }}
                              disabled={savingId === rdv.id}
                              style={{ flex: 1, background: "white", color: "#C62828", border: "1px solid #FFCDD2", borderRadius: "8px", padding: "8px 12px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                              ✕ Refuser
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {title && (
        <div style={{ position: "relative", zIndex: 1, maxWidth: "1280px", margin: "0 auto", padding: "28px 48px 56px" }}>
          {eyebrow && (
            <p style={{ fontWeight: "300", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: "13px", color: "#A5C9B9", marginBottom: "14px" }}>
              {eyebrow}
            </p>
          )}
          <h1 style={{ fontStyle: "italic", fontWeight: "700", fontSize: "clamp(34px, 4vw, 52px)", lineHeight: "1.1", letterSpacing: "-0.02em", color: "#F4EDE4" }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontWeight: "300", fontSize: "17px", lineHeight: "1.6", color: "rgba(244,237,228,0.72)", marginTop: "14px", maxWidth: "640px" }}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      </header>

      {/* Modal refus avec message au patient */}
      {cancelModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300 }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "36px", width: "440px", display: "flex", flexDirection: "column", gap: "18px", boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>❌</div>
              <h2 style={{ color: "#2A3F4F", fontWeight: "700", fontSize: "17px", marginBottom: "4px" }}>Refuser la demande</h2>
              <p style={{ color: "#888", fontSize: "13px" }}>
                <strong>{cancelModal.rdv.patient_pseudo ? `@${cancelModal.rdv.patient_pseudo}` : cancelModal.rdv.patient_name}</strong> · {formatDate(cancelModal.rdv.date_heure)}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ color: "#2A3F4F", fontSize: "13px", fontWeight: "600" }}>
                Message au patient <span style={{ color: "#aaa", fontWeight: "400" }}>(optionnel)</span>
              </label>
              <textarea
                value={cancelMessage}
                onChange={e => setCancelMessage(e.target.value)}
                rows={3}
                autoFocus
                placeholder="Ex : Je suis indisponible ce jour, n'hésitez pas à reprendre rendez-vous…"
                style={{ border: "1px solid #E0E0E0", borderRadius: "10px", padding: "10px 14px", fontSize: "14px", outline: "none", color: "#2A3F4F", resize: "none", fontFamily: "inherit", lineHeight: "1.5" }}
              />
              <p style={{ color: "#aaa", fontSize: "11px" }}>Ce message sera visible par le patient dans son application.</p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => { setCancelModal(null); setCancelMessage(""); }}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #E0E0E0", background: "white", color: "#5A6B72", fontWeight: "600", cursor: "pointer", fontSize: "14px" }}>
                Retour
              </button>
              <button
                onClick={executeCancelRdv}
                disabled={savingId !== null}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #B71C1C, #E53935)", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "14px", opacity: savingId !== null ? 0.7 : 1 }}>
                {savingId !== null ? "…" : "Refuser"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
