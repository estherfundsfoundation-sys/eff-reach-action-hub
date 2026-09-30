import type { Metadata } from "next";
import Link from "next/link";
import { rpc } from "../lib";
import { Top, Foot } from "../parts";
import "../scholarships.css";

/* Past recipients: the same list as the website, run from MyEFF → National → Website
   (eff_site_recipients_public). Only publicly announced awards, each with the post that
   announced it; amounts only where EFF stated them; never youth recipients. */
export const metadata: Metadata = {
  title: "Past Recipients | REACH Scholarships",
  description: "Students recognized through Esther Funds Foundation scholarships and awards, each with the post that announced it.",
  alternates: { canonical: "/scholarships/recipients" },
};

type R = { id: string; name: string; school: string | null; award: string; amount: number | null; status: string; photo_path: string | null; source_url: string | null; note: string | null; announced_on: string | null };
const MEDIA = "https://voljlrqyruluuqrfqwww.supabase.co/storage/v1/object/public/eff-media/";

export default async function Page() {
  let people: R[] = [];
  try { people = await rpc<R[]>("eff_site_recipients_public", {}, 600); } catch { /* shown below */ }
  const total = people.reduce((n, p) => n + (p.amount ?? 0), 0);
  return (
    <main className="sc">
      <Top on="/scholarships/recipients" />
      <section className="sc-hero">
        <div className="sc-wrap">
          <span className="sc-kick">Every award carries a story</span>
          <h1>They <em>kept going.</em></h1>
          <p>Students publicly recognized through Esther Funds Foundation scholarships and awards. Schools and amounts appear only where EFF announced them, and every name links to the post that did.</p>
          {people.length ? <p style={{ marginTop: 14, fontWeight: 700, color: "var(--p)" }}>{people.length} recipients{total ? ` · $${total.toLocaleString()} in announced awards` : ""}</p> : null}
        </div>
      </section>
      <div className="sc-wrap sc-section">
        {people.length ? (
          <div className="sc-people">
            {people.map((p) => (
              <article className="sc-person" key={p.id}>
                <div className="sc-face" aria-hidden="true">{p.photo_path ? <img src={`${MEDIA}${p.photo_path}`} alt="" /> : p.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("")}</div>
                <h3>{p.name}</h3>
                <p><b style={{ color: "var(--p)" }}>{p.award}</b></p>
                {p.school ? <p>{p.school}</p> : null}
                {p.amount ? <div className="sc-amt">${Number(p.amount).toLocaleString()}</div> : null}
                {p.note ? <p>{p.note}</p> : null}
                {p.source_url ? <p><a href={p.source_url} target="_blank" rel="noopener noreferrer">The announcement ↗</a></p> : null}
              </article>
            ))}
          </div>
        ) : <div className="sc-empty"><p>The recipient list didn&rsquo;t load. Try again in a minute.</p></div>}
        <div className="sc-note" style={{ marginTop: 24 }}>Want to be next? <Link href="/scholarships/eff">See EFF&rsquo;s own scholarships</Link> and <Link href="/scholarships/match">get matched to thousands more</Link>.</div>
      </div>
      <Foot />
    </main>
  );
}
