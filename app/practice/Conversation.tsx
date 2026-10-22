"use client";

/* Practice the Conversation: one scenario. A chat stage: the other person speaks, the student picks one
   of three replies, a coaching note explains the pick, the other person reacts, and the next turn opens.
   Optional: "Say it your way" uses the browser's own speech recognition to show the student's own words
   (shown on screen only, never scored or sent), and "Voice" reads the other person's lines aloud with
   speechSynthesis (off by default). Finished runs are kept in localStorage ("reach-practice"). */
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SiteTop, SiteFoot } from "../myreach/ui";
import { SCENARIOS, findScenario, type Choice, type Tone, type Turn } from "./scenarios";
import { markDone } from "./progress";
import Avatar from "./Avatar";

type Pick = { turn: string; pick: number };

const TONE: Record<Tone, string> = { strong: "Strong", okay: "Okay", risky: "Risky" };

/* Minimal typing for the browser's speech recognition, which TypeScript's DOM lib doesn't ship. */
type Rec = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type RecCtor = new () => Rec;
const recCtor = (): RecCtor | null => {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function Conversation({ slug }: { slug: string }) {
  const s = findScenario(slug)!;
  const turns = useMemo(() => new Map<string, Turn>(s.turns.map((t) => [t.id, t])), [s]);
  const [started, setStarted] = useState(false);
  const [path, setPath] = useState<Pick[]>([]);
  const [cur, setCur] = useState<string>(s.turns[0].id);
  const [voice, setVoice] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const [canHear, setCanHear] = useState(false);
  const [listening, setListening] = useState<string | null>(null);
  const [said, setSaid] = useState<Record<string, string>>({});
  const [micErr, setMicErr] = useState("");
  const [copied, setCopied] = useState(false);
  const recRef = useRef<Rec | null>(null);
  const curRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCanSpeak(typeof window !== "undefined" && "speechSynthesis" in window);
    setCanHear(Boolean(recCtor()));
    return () => { try { recRef.current?.abort(); window.speechSynthesis?.cancel(); } catch { /* ignore */ } };
  }, []);

  const speak = useCallback((lines: string[]) => {
    if (!voice || !canSpeak) return;
    try {
      window.speechSynthesis.cancel();
      for (const l of lines) {
        const u = new SpeechSynthesisUtterance(l);
        u.rate = 1; u.lang = "en-US";
        window.speechSynthesis.speak(u);
      }
    } catch { /* no voice on this device */ }
  }, [voice, canSpeak]);

  useEffect(() => { if (!voice) { try { window.speechSynthesis?.cancel(); } catch { /* ignore */ } } }, [voice]);

  const done = cur === "end";
  const last = path[path.length - 1];
  const lastChoice: Choice | null = last ? turns.get(last.turn)!.choices[last.pick] : null;

  // Read the newest lines aloud, then move focus to what just appeared.
  useEffect(() => {
    if (!started) return;
    const lines: string[] = [];
    if (lastChoice) lines.push(lastChoice.reply);
    if (!done) lines.push(turns.get(cur)!.them);
    speak(lines);
    const el = done ? endRef.current : curRef.current;
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, path.length, cur]);

  // Save progress once a run ends.
  const strong = path.filter((p) => turns.get(p.turn)!.choices[p.pick].tone === "strong").length;
  useEffect(() => { if (done) markDone(s.slug, strong, path.length); }, [done, s.slug, strong, path.length]);

  const choose = (t: Turn, i: number) => {
    try { recRef.current?.abort(); } catch { /* ignore */ }
    setListening(null);
    setPath((p) => [...p, { turn: t.id, pick: i }]);
    setCur(t.choices[i].next);
  };

  const restart = () => {
    try { window.speechSynthesis?.cancel(); } catch { /* ignore */ }
    setPath([]); setCur(s.turns[0].id); setSaid({}); setCopied(false); setStarted(true);
  };

  const listen = (key: string) => {
    const C = recCtor(); if (!C) return;
    setMicErr("");
    if (listening) { try { recRef.current?.stop(); } catch { /* ignore */ } if (listening === key) { setListening(null); return; } }
    try {
      const r = new C();
      r.lang = "en-US"; r.interimResults = true; r.maxAlternatives = 1; r.continuous = false;
      r.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        setSaid((m) => ({ ...m, [key]: text.trim() }));
      };
      r.onerror = (e) => { setMicErr(e?.error === "not-allowed" ? "Your browser didn't allow the microphone. You can still say it out loud to yourself." : "We couldn't hear that. Try again, or just say it out loud."); };
      r.onend = () => setListening((k) => (k === key ? null : k));
      recRef.current = r;
      setListening(key);
      r.start();
    } catch { setListening(null); setMicErr("Speech isn't available here. Say it out loud anyway; it still counts."); }
  };

  const copy = async () => {
    const text = `${s.script.title}\n\n${s.script.lines.map((l) => `- ${l}`).join("\n")}`;
    try { await navigator.clipboard.writeText(text); setCopied(true); }
    catch {
      try {
        const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove(); setCopied(true);
      } catch { setCopied(false); }
    }
  };

  const idx = SCENARIOS.findIndex((x) => x.slug === s.slug);
  const another = SCENARIOS[(idx + 1) % SCENARIOS.length];
  const tally = { strong: 0, okay: 0, risky: 0 } as Record<Tone, number>;
  path.forEach((p) => { tally[turns.get(p.turn)!.choices[p.pick].tone]++; });

  return (
    <div className="sc pr">
      <SiteTop />

      <section className="pr-scene" aria-labelledby="pr-s-title" style={{ ["--hue" as string]: s.who.hue }}>
        <div className="pr-stars" aria-hidden="true" />
        <div className="sc-wrap pr-scene-in">
          <Link className="pr-back" href="/practice">&larr; All conversations</Link>
          <div className="pr-scene-who">
            <Avatar initial={s.who.initial} hue={s.who.hue} size={64} />
            <div><b>{s.who.name}</b><span>{s.who.role}</span></div>
          </div>
          <h1 id="pr-s-title">{s.title}</h1>
          <p className="pr-setting">{s.setting}</p>
          <p className="pr-goal"><b>Your goal:</b> {s.goal}</p>
          <div className="pr-scene-acts">
            {!started ? <button type="button" className="pr-btn" onClick={() => setStarted(true)}>Start the conversation</button> : null}
            {canSpeak ? (
              <button type="button" className={`pr-toggle${voice ? " on" : ""}`} aria-pressed={voice} onClick={() => setVoice((v) => !v)}>
                <span aria-hidden="true">{voice ? "\u{1F50A}" : "\u{1F508}"}</span> Voice {voice ? "on" : "off"}
              </button>
            ) : null}
          </div>
        </div>
      </section>

      <main className="sc-wrap pr-stage">
        {started ? (
          <>
            <ol className="pr-log" aria-label="Conversation so far">
              {path.map((p, n) => {
                const t = turns.get(p.turn)!; const c = t.choices[p.pick];
                const fresh = n === path.length - 1;
                return (
                  <li key={`${p.turn}-${n}`} className="pr-turn">
                    <Them who={s.who} text={t.them} />
                    <div className="pr-you"><span className="pr-tag">You</span><p>{c.text}</p></div>
                    <div className={`pr-coach ${c.tone}${fresh ? " fresh" : ""}`}>
                      <span className="pr-tone">{TONE[c.tone]}</span>
                      <p>{c.coach}</p>
                      {said[`${p.turn}-${p.pick}`] ? <p className="pr-said-old">Your version: &ldquo;{said[`${p.turn}-${p.pick}`]}&rdquo;</p> : null}
                    </div>
                    <div className={fresh ? "pr-late" : undefined}><Them who={s.who} text={c.reply} /></div>
                  </li>
                );
              })}
            </ol>

            {!done ? (
              <div className={`pr-now${path.length ? " pr-late2" : ""}`} ref={curRef} tabIndex={-1} aria-live="polite" aria-labelledby="pr-now-h">
                <Them who={s.who} text={turns.get(cur)!.them} big />
                <h2 id="pr-now-h" className="pr-ask">Turn {path.length + 1}. What do you say?</h2>
                <ul className="pr-choices">
                  {turns.get(cur)!.choices.map((c, i) => {
                    const key = `${cur}-${i}`;
                    return (
                      <li key={key} className="pr-choice">
                        <button type="button" className="pr-pick" onClick={() => choose(turns.get(cur)!, i)}>
                          <span className="pr-letter" aria-hidden="true">{"ABC"[i]}</span>
                          <span>{c.text}</span>
                        </button>
                        {canHear ? (
                          <button type="button" className={`pr-mic${listening === key ? " live" : ""}`} aria-pressed={listening === key} onClick={() => listen(key)}
                            aria-label={listening === key ? "Stop listening" : `Say reply ${"ABC"[i]} your way, out loud`}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></svg>
                            {listening === key ? "Listening..." : "Say it your way"}
                          </button>
                        ) : null}
                        {said[key] ? <p className="pr-said">You said: &ldquo;{said[key]}&rdquo; <span>Just for you. Nothing is saved or sent.</span></p> : null}
                      </li>
                    );
                  })}
                </ul>
                {micErr ? <p className="pr-micerr" role="status">{micErr}</p> : null}
              </div>
            ) : (
              <section className="pr-end" ref={endRef} tabIndex={-1} aria-labelledby="pr-end-h">
                <p className="pr-kick">Conversation complete</p>
                <h2 id="pr-end-h">You said it. <em>Now you&rsquo;re ready.</em></h2>
                <div className="pr-tally" aria-label="How your picks landed">
                  <span className="strong"><b>{tally.strong}</b> strong</span>
                  <span className="okay"><b>{tally.okay}</b> okay</span>
                  <span className="risky"><b>{tally.risky}</b> risky</span>
                </div>
                <p className="pr-end-lede">{tally.strong === path.length ? "Every pick was strong. Take these words into the real conversation." : "Every risky pick here is one you won't have to learn the hard way. Try it again and see how a different reply changes the room."}</p>

                <div className="pr-end-grid">
                  <div className="pr-box">
                    <h3>What you practiced</h3>
                    <ul className="pr-checks">{s.practiced.map((p) => <li key={p}>{p}</li>)}</ul>
                  </div>
                  <div className="pr-box pr-script">
                    <h3>{s.script.title}</h3>
                    <ol>{s.script.lines.map((l) => <li key={l}>{l}</li>)}</ol>
                    <button type="button" className="pr-btn small" onClick={copy}>{copied ? "Copied" : "Copy these words"}</button>
                    <span className="pr-sr" role="status">{copied ? "Copied to your clipboard." : ""}</span>
                  </div>
                </div>

                <div className="pr-box">
                  <h3>Your real next step</h3>
                  <ul className="pr-next">
                    {s.next.map((n) => {
                      const ext = /^https?:/.test(n.href);
                      const inner = <><b>{n.label}{ext ? " ↗" : " →"}</b><span>{n.detail}</span></>;
                      return <li key={n.href}>{ext || n.href.endsWith("/") ? <a href={n.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a> : <Link href={n.href}>{inner}</Link>}</li>;
                    })}
                  </ul>
                </div>

                <div className="pr-end-acts">
                  <button type="button" className="pr-btn" onClick={restart}>Practice again</button>
                  <Link className="pr-btn ghost" href={`/practice/${another.slug}`}>Try another: {another.title}</Link>
                  <Link className="pr-link" href="/practice">All conversations</Link>
                </div>
              </section>
            )}
          </>
        ) : (
          <p className="pr-pre">Three replies each turn. There&rsquo;s no grade, just practice. Pick the one that sounds most like you, or the one you&rsquo;d never say, and see what happens.</p>
        )}
        <p className="pr-988">If you&rsquo;re struggling, call or text <a href="tel:988">988</a>. In immediate danger, call 911.</p>
      </main>

      <SiteFoot />
    </div>
  );
}

function Them({ who, text, big }: { who: { name: string; initial: string; hue: string }; text: string; big?: boolean }) {
  return (
    <div className={`pr-them${big ? " big" : ""}`}>
      <Avatar initial={who.initial} hue={who.hue} size={big ? 46 : 38} />
      <div><span className="pr-tag">{who.name}</span><p>{text}</p></div>
    </div>
  );
}
