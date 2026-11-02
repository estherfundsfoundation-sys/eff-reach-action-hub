import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Toolkit from "./Toolkit";
import { KITS } from "../toolkits";
import "../../scholarships/scholarships.css";
import "../../start/start.css";

export function generateStaticParams() { return KITS.map((k) => ({ who: k.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ who: string }> }): Promise<Metadata> {
  const { who } = await params;
  const kit = KITS.find((k) => k.slug === who);
  return kit ? { title: `REACH toolkit ${kit.k.toLowerCase()}`, description: kit.lede } : {};
}

export default async function Page({ params }: { params: Promise<{ who: string }> }) {
  const { who } = await params;
  const kit = KITS.find((k) => k.slug === who);
  if (!kit) notFound();
  return <Toolkit kit={kit} />;
}
