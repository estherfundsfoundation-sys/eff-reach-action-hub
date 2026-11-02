"use client";

import { useState } from "react";
import { CATS, report, track, type LibItem } from "./library";

/* One resource card, used on /start, /for/* and /resources. Opening it counts (no names);
   "Didn't help?" sends a report National sees (three reports in a month put it in front of them). */
export default function LibCard({ i, mine }: { i: LibItem; mine?: boolean }) {
  const [ask, setAsk] = useState(false);
  const [sent, setSent] = useState(false);
  const ext = i.href.startsWith("http");
  const hue = CATS[i.cat]?.hue || "#b799e3";
  const send = (reason: string) => { setSent(true); setAsk(false); report(i.key, reason).catch(() => {}); };
  return (
    <div className="lb-card" style={{ ["--hue" as string]: hue }}>
      <a className="lb-open" href={i.href} target={ext ? "_blank" : undefined} rel={ext ? "noopener noreferrer" : undefined} onClick={() => track(i.key)}>
        <em>{mine ? "Made for you" : i.tag === "Now" ? "Start here" : i.tag === "Official" ? "Official source ↗" : i.tag === "EFF" ? "From EFF" : i.tag}</em>
        <b>{i.title}</b>
        <span>{i.text}</span>
      </a>
      <div className="lb-foot">
        {sent ? <small>Thank you. EFF will look at it.</small> : ask ? (
          <span className="lb-ask"><small>What was wrong?</small>
            <button type="button" onClick={() => send("broken")}>Link didn&rsquo;t work</button>
            <button type="button" onClick={() => send("outdated")}>Out of date</button>
            <button type="button" onClick={() => send("not_for_me")}>Not for me</button>
          </span>
        ) : <button type="button" className="lb-flag" onClick={() => setAsk(true)}>Didn&rsquo;t help?</button>}
      </div>
    </div>
  );
}
