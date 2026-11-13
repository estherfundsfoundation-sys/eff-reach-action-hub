import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { rpc, type Search } from "../../lib";
import { Top, Foot } from "../../parts";
import { CardView, BrowseBlock } from "../../cards";
import { ALL, byKey } from "../../browse";
import "../../scholarships.css";

/* One browse list: the directory with one filter already chosen (see ../../browse.ts), 24 a page. */
export function generateStaticParams() { return ALL.map((b) => ({ key: b.key })); }
export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const b = byKey((await params).key);
  if (!b) return { title: "Scholarships | REACH" };
  return { title: `${b.title} | REACH by Esther Funds Foundation`, description: `${b.blurb} Real scholarships, checked every morning. Free, always. Never pay to apply.`,
    alternates: { canonical: `/scholarships/browse/${b.key}` },
    openGraph: { title: b.title, description: b.blurb, images: [{ url: "/og.png", width: 1536, height: 1024, alt: "REACH Scholarships" }] } };
}

export default async function Page({ params, searchParams }: { params: Promise<{ key: string }>; searchParams: Promise<{ page?: string }> }) {
  const b = byKey((await params).key);
  if (!b) notFound();
  const page = Math.max(1, Number.parseInt((await searchParams).page ?? "1", 10) || 1);
  let data: Search | null = null;
  try { data = await rpc<Search>("eff_scholarships_find", { p: { deadline: "upcoming", sort: "deadline", ...b.find, page } }); } catch { /* shown below */ }
  const href = (n: number) => `/scholarships/browse/${b.key}?page=${n}`;
  return (
    <main className="sc">
      <Top on="/scholarships" />
      <section className="sc-hero sc-hero-sm">
        <div className="sc-wrap">
          <span className="sc-kick"><Link href="/scholarships#browse">← All lists</Link></span>
          <h1 className="sc-h1-sm">{b.title}</h1>
          <p>{b.blurb}</p>
        </div>
      </section>
      <div className="sc-wrap sc-section">
        {!data ? (
          <div className="sc-empty"><h2>The list didn&rsquo;t load.</h2><p>That&rsquo;s on us, not you. Refresh in a minute, or <Link href="/scholarships">see the whole directory</Link>.</p></div>
        ) : data.items.length ? (
          <>
            <p className="sc-count">{data.total.toLocaleString()} open {data.total === 1 ? "scholarship" : "scholarships"} · page {data.page} of {data.pages}</p>
            <div className="sc-grid">{data.items.map((c) => <CardView key={c.slug} c={c} />)}</div>
            {data.pages > 1 ? (
              <nav className="sc-pages" aria-label="Pages">
                {data.page > 1 ? <Link className="sc-btn ghost sm" href={href(data.page - 1)}>← Back</Link> : <span />}
                <span className="sc-small">Page {data.page} of {data.pages}</span>
                {data.page < data.pages ? <Link className="sc-btn sm" href={href(data.page + 1)}>More →</Link> : <span />}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="sc-empty"><h2>Nothing open on this list today.</h2><p>New scholarships come in every morning. Try another list below, or <Link href="/scholarships/match">get matched in 2 minutes</Link>.</p></div>
        )}
        <h2 className="sc-bh">Browse another list</h2>
        <BrowseBlock on={b.key} />
        <p className="sc-small">Every list is the same directory, sorted a different way. <Link href="/scholarships#search">Search everything</Link>.</p>
      </div>
      <Foot />
    </main>
  );
}
