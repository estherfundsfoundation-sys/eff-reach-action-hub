"use client";

import Link from "next/link";
import { useState } from "react";
import { rpc } from "../lib";
import { Top, Foot } from "../parts";

/* "Tell us about a scholarship we're missing" (MyEFF eff_sch_suggest, anon). Local awards from a community
   foundation, a church, an employer or a club are exactly what national sites miss. The provider's own page is
   required; scholarship search sites are refused. It lands in the exceptions queue, where a chapter officer or a
   Campus Ambassador opens the page and adds it. Nothing about the student is kept. */
export default function Missing() {
  const [f, setF] = useState({ name: "", provider: "", url: "", state: "", note: "", website: "" });
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [err, setErr] = useState("");
  if (state === "done") {
    return (
      <main className="sc"><Top on="/scholarships" />
        <div className="sc-wrap"><div className="sc-quiz">
          <h1 className="sc-h2">Thank you.</h1>
          <p>A person opens the provider&rsquo;s page and adds it. If it checks out, it&rsquo;s on REACH for every student who qualifies.</p>
          <div className="sc-acts"><Link className="sc-btn" href="/scholarships">Back to scholarships</Link><button type="button" className="sc-btn ghost" onClick={() => { setF({ name: "", provider: "", url: "", state: "", note: "", website: "" }); setState("idle"); }}>Send another</button></div>
        </div></div>
        <Foot />
      </main>
    );
  }
  return (
    <main className="sc"><Top on="/scholarships" />
      <div className="sc-wrap">
        <form className="sc-quiz" onSubmit={async (e) => {
          e.preventDefault(); setErr(""); setState("busy");
          try { await rpc("eff_sch_suggest", { p: f }); setState("done"); }
          catch (x) { setErr(x instanceof Error ? x.message : "That didn't send."); setState("idle"); }
        }}>
          <span className="sc-kick">Help other students</span>
          <h1 className="sc-h2">Know a scholarship we don&rsquo;t?</h1>
          <p>Local awards from a community foundation, a church, an employer, a union or a club are the ones big sites miss. Send the provider&rsquo;s own page and a person checks it.</p>
          <label className="sc-field">Scholarship name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label className="sc-field">Who gives it<input value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} placeholder="e.g. Tallahassee Community Foundation" /></label>
          <label className="sc-field">Link to their own page<input required type="url" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://" /></label>
          <label className="sc-field">State (if it&rsquo;s local)<input maxLength={2} value={f.state} onChange={(e) => setF({ ...f, state: e.target.value.toUpperCase() })} placeholder="FL" /></label>
          <label className="sc-field">Anything else (optional)<textarea maxLength={600} value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Don't include your name or contact details." /></label>
          <label style={{ position: "absolute", left: -9999 }} aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => setF({ ...f, website: e.target.value })} /></label>
          {err ? <p style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}
          <div className="sc-acts"><button className="sc-btn coral" disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send it"}</button></div>
          <p className="sc-small">Not a scholarship search site, please: the link has to be the organization that gives the money.</p>
        </form>
      </div>
      <Foot />
    </main>
  );
}
