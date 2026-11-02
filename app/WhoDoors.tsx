import Link from "next/link";
import { WHO } from "./content/library";

/* REACH home, right after the opening: "Who are you?" Five doors; students get their own plan on
   /start, everyone else a toolkit on /for/*. */
export default function WhoDoors() {
  return (
    <section className="rs rs-who" aria-labelledby="who-h">
      <div className="sc-wrap">
        <p className="rs-k">Start here</p>
        <h2 id="who-h">Who are you?</h2>
        <p className="rs-lede">REACH is for every student, from 9th grade to after graduation, and for everyone in their corner.</p>
        <div className="rs-doors">
          {WHO.map((w, n) => (
            <Link key={w.key} href={w.href} className="rs-door" style={{ ["--hue" as string]: w.hue, ["--d" as string]: `${n * 0.06}s` }}>
              <span aria-hidden="true">{w.glyph}</span><b>{w.title}</b><small>{w.line}</small>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
