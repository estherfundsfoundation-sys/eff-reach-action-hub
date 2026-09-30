"use client";

import { useEffect, useState } from "react";

/* When someone arrives from an old portal.estherfundsfoundation.org address (the Portal
   forwards every page here with ?from=portal), say so, once, kindly. */
export default function MovedNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      if (new URLSearchParams(location.search).get("from") !== "portal") return;
      if (sessionStorage.getItem("reach-moved-seen")) return;
      setShow(true);
      const u = new URL(location.href); u.searchParams.delete("from");
      history.replaceState(null, "", u.pathname + u.search + u.hash);
    } catch { /* ignore */ }
  }, []);
  if (!show) return null;
  const close = () => { try { sessionStorage.setItem("reach-moved-seen", "1"); } catch { /* */ } setShow(false); };
  return (
    <div role="status" style={{ position: "fixed", left: 12, right: 12, bottom: 12, zIndex: 1000, maxWidth: 560, margin: "0 auto", padding: "16px 18px", borderRadius: 20,
      background: "#2a0a55", color: "#fff", boxShadow: "0 20px 50px -20px rgba(0,0,0,.6)", font: "500 15px/1.45 Poppins, 'Segoe UI', system-ui, sans-serif", display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <b style={{ display: "block", color: "#ffd35a", fontSize: 16, marginBottom: 2 }}>The EFF Portal has moved to REACH.</b>
        Scholarships, EFF applications and student help all live here now, in one place. Welcome in.
      </div>
      <button onClick={close} aria-label="Close" style={{ minWidth: 44, minHeight: 44, border: 0, borderRadius: 999, background: "rgba(255,255,255,.14)", color: "#fff", fontSize: 18, cursor: "pointer" }}>×</button>
    </div>
  );
}
