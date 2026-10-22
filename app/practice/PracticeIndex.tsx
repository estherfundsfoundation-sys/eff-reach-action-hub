"use client";

/* Practice the Conversation: the index. A dark stage with a few chat bubbles, then one card per scenario.
   Finished scenarios show a check from localStorage ("reach-practice"). */
import Link from "next/link";
import { useEffect, useState } from "react";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { SCENARIOS } from "./scenarios";
import { readDone, type Done } from "./progress";
import Avatar from "./Avatar";

export default function PracticeIndex() {
  const [done, setDone] = useState<Done>({});
  useEffect(() => { setDone(readDone()); }, []);
  const count = SCENARIOS.filter((s) => done[s.slug]).length;

  return (
    <div className="sc pr">
      <SiteTop />

      <section className="pr-hero" aria-labelledby="pr-title">
        <div className="pr-stars" aria-hidden="true" />
        <div className="sc-wrap pr-hero-in">
          <div className="pr-hero-copy">
            <p className="pr-kick">REACH · Practice the Conversation</p>
            <h1 id="pr-title">Say it out loud <em>before it counts.</em></h1>
            <p className="pr-lede">The talk with financial aid. The email to your professor. The call with your family. Practice the conversations that keep you in school, see how each answer lands, and leave with words you can use for real.</p>
            <div className="pr-hero-acts">
              <a className="pr-btn" href="#scenarios">Pick a conversation</a>
              <span className="pr-note">{count > 0 ? `${count} of ${SCENARIOS.length} practiced on this device` : "Free. Private. Nothing you pick is saved anywhere but your own browser."}</span>
            </div>
          </div>
          <div className="pr-hero-chat" aria-hidden="true">
            <div className="pr-hb them"><Avatar initial="A" hue="#42127F" size={34} /><span>What can I help you with today?</span></div>
            <div className="pr-hb you"><span>My family&rsquo;s income dropped. Can my aid be reviewed?</span></div>
            <div className="pr-hb coach"><b>Strong.</b> You named the change and asked for the review.</div>
            <div className="pr-hb them"><Avatar initial="A" hue="#42127F" size={34} /><span>Yes. Here&rsquo;s what we&rsquo;ll need.</span></div>
          </div>
        </div>
      </section>

      <main className="sc-wrap pr-index" id="scenarios">
        <h2 className="pr-h2">Eight conversations. Five to seven turns each.</h2>
        <p className="pr-sub">Each one takes about three minutes. Pick the reply that sounds most like you, then see why it works or what to try instead.</p>
        <ul className="pr-grid">
          {SCENARIOS.map((s, i) => (
            <li key={s.slug}>
              <Link className="pr-card" href={`/practice/${s.slug}`} style={{ ["--hue" as string]: s.who.hue }}>
                <span className="pr-card-top">
                  <Avatar initial={s.who.initial} hue={s.who.hue} size={44} />
                  <span className="pr-card-num">{String(i + 1).padStart(2, "0")}</span>
                  {done[s.slug] ? <span className="pr-done" aria-label="Practiced">&#10003; Practiced</span> : null}
                </span>
                <b>{s.title}</b>
                <span className="pr-card-line">{s.line}</span>
                <span className="pr-card-who">With {s.who.name}, {s.who.role.toLowerCase()}</span>
                <span className="pr-card-go">{done[s.slug] ? "Practice again" : "Start"} &rarr;</span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="pr-how" aria-label="How it works">
          <div><b>1. Read the moment.</b><span>Each conversation starts with where you are and what you want.</span></div>
          <div><b>2. Pick your words.</b><span>Three replies each turn: strong, okay, or risky. Every pick gets a coaching note.</span></div>
          <div><b>3. Say it your way.</b><span>Tap the mic to say your own version out loud. It stays on your screen only.</span></div>
          <div><b>4. Take the script.</b><span>Finish with the strongest words to copy and the real next step.</span></div>
        </section>

        <p className="pr-988">If you&rsquo;re struggling, call or text <a href="tel:988">988</a>. In immediate danger, call 911.</p>
      </main>

      <SiteFoot />
    </div>
  );
}
