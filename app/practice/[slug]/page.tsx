import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SCENARIOS, findScenario } from "../scenarios";
import Conversation from "../Conversation";
import "../../scholarships/scholarships.css";
import "../practice.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = findScenario(slug);
  if (!s) return {};
  return {
    title: `${s.title} | Practice the Conversation | REACH by Esther Funds Foundation`,
    description: `${s.line} Practice it here first: pick your words, see how they land, and leave with a script.`,
    alternates: { canonical: `/practice/${s.slug}` },
    openGraph: {
      title: s.title,
      description: s.line,
      url: `https://reach.estherfundsfoundation.org/practice/${s.slug}`,
      images: ["/og.png"],
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!findScenario(slug)) notFound();
  return <Conversation slug={slug} />;
}
