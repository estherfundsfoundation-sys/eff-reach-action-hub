"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { call } from "../../myreach/pass";
import { SiteTop, SiteFoot } from "../../myreach/ui";

/* A grant recipient's check-in, 30 and 90 days after EFF helped (eff_application_followups). The emailed code is
   the key, so there is no sign-in: eff_reach_checkin_public reads which program and day, eff_reach_checkin_answer
   records the answers once. Anyone who says things aren't okay, or asks for more help, is flagged to National. */
type Info = { day: number; answered: boolean; program: string; kind: string; number: string; first_name: string | null };

const HELPED = ["Yes", "Somewhat", "No"];
const ENROLLED = ["Still enrolled", "Graduated", "Taking a break", "Withdrew"];
const STABLE = ["Yes", "Getting there", "No"];

export default function CheckIn({ code }: { code: string }) {
  const [info, setInfo] = useState<Info | null | undefined>(undefined);
  const [a, setA] = useState({ helped: "", enrolled: "", stable: "", need_help: "No", story: "", share_ok: false });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [err, setErr] = useState("");
  useEffect(() => { call<Info | null>("eff_reach_checkin_public", { p_code: code }).then(setInfo).catch(() => setInfo(null)); }, [code]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    setState("sending"); setErr("");
    try { await call("eff_reach_checkin_answer", { p_code: code, p: a }); setState("done"); window.scrollTo({ top: 0, behavior: "smooth" }); }
    catch (x) { setErr(x instanceof Error ? x.message : "That didn't send. Try again."); setState("idle"); }
  }
  const pills = (key: "helped" | "enrolled" | "stable", opts: string[]) => (
    <div className="sc-pills">{opts.map((o) => <button type="button" key={o} className={`sc-pill${a[key] === o ? " on" : ""}`} aria-pressed={a[key] === o} onClick={() => setA({ ...a, [key]: o })}>{o}</button>)}</div>
  );

  return (
    <main className="sc">
      <SiteTop />
      <div className="sc-wrap">
        <article className="sc-detail" style={{ maxWidth: 680 }}>
          {info === undefined ? <p className="sc-small">Loading…</p> : !info ? (
            <div className="sc-empty"><h2>That link isn&rsquo;t right.</h2><p>Use the link in your email from EFF, or open <Link href="/account">My REACH</Link>.</p></div>
          ) : info.answered || state === "done" ? (
            <div className="sc-empty">
              <h1 style={{ marginTop: 0 }}>Thank you{info.first_name ? `, ${info.first_name}` : ""}.</h1>
              <p>Your answers help EFF show donors and schools that this works, so the next student can get help too.</p>
              {a.need_help === "Yes" || a.stable === "No" ? <p className="sc-note">Someone at EFF National will reach out. If you need help right now, <Link href="/emergency">REACH Emergency</Link> builds a plan in a few minutes, and you can call or text <a href="tel:988">988</a> any time.</p> : null}
              <p><Link className="sc-btn" href="/">Back to REACH</Link></p>
            </div>
          ) : (
            <form onSubmit={send}>
              <p className="sc-small" style={{ margin: 0 }}>{info.program} · {info.number} · {info.day}-day check-in</p>
              <h1 style={{ marginTop: 6 }}>How are you doing{info.first_name ? `, ${info.first_name}` : ""}?</h1>
              <p style={{ fontSize: 17, lineHeight: 1.55 }}>Three quick taps and an optional sentence. No sign-in needed.</p>
              <section className="sc-step"><h2 style={{ fontSize: 18 }}>Did EFF&rsquo;s help make a difference?</h2>{pills("helped", HELPED)}</section>
              <section className="sc-step"><h2 style={{ fontSize: 18 }}>Where are you with school?</h2>{pills("enrolled", ENROLLED)}</section>
              <section className="sc-step"><h2 style={{ fontSize: 18 }}>Are things steadier now?</h2>{pills("stable", STABLE)}</section>
              <section className="sc-step">
                <h2 style={{ fontSize: 18 }}>Do you need more help right now?</h2>
                <div className="sc-pills">{["No", "Yes"].map((o) => <button type="button" key={o} className={`sc-pill${a.need_help === o ? " on" : ""}`} aria-pressed={a.need_help === o} onClick={() => setA({ ...a, need_help: o })}>{o}</button>)}</div>
                {a.need_help === "Yes" ? <p className="sc-small">Someone at EFF National will reach out after you send this.</p> : null}
              </section>
              <section className="sc-step">
                <label className="sc-field" style={{ color: "var(--i)", fontSize: 16 }}>
                  <span style={{ fontWeight: 700 }}>Anything you want to tell us? (optional)</span>
                  <textarea rows={4} maxLength={2000} value={a.story} onChange={(e) => setA({ ...a, story: e.target.value })} placeholder="What it meant, what changed, what's still hard." />
                </label>
                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 10, fontSize: 15 }}>
                  <input type="checkbox" checked={a.share_ok} onChange={(e) => setA({ ...a, share_ok: e.target.checked })} style={{ marginTop: 4 }} />
                  <span>EFF may share what I wrote, without my name, to help raise money for the next student.</span>
                </label>
              </section>
              {err ? <p className="sc-note" style={{ color: "#b3123a", fontWeight: 600 }}>{err}</p> : null}
              <div className="sc-acts" style={{ margin: "18px 0 40px" }}>
                <button className="sc-btn coral" style={{ minHeight: 56, fontSize: 18 }} disabled={state === "sending" || !a.helped || !a.enrolled || !a.stable}>{state === "sending" ? "Sending…" : "Send my check-in"}</button>
              </div>
            </form>
          )}
        </article>
      </div>
      <SiteFoot />
    </main>
  );
}
