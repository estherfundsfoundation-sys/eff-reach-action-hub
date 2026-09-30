import type { Metadata } from "next";
import { rpc } from "../../scholarships/lib";
import type { Program } from "../../myreach/pass";
import Apply from "./Apply";
import "../../scholarships/scholarships.css";

export async function generateMetadata({ params }: { params: Promise<{ program: string }> }): Promise<Metadata> {
  const { program } = await params;
  const p = await rpc<Program | null>("eff_reach_program", { p_key: program }, 60).catch(() => null);
  return { title: p ? `${p.name} | Apply on REACH` : "Apply | REACH", description: p?.summary || "Apply to Esther Funds Foundation on REACH." };
}

export default async function Page({ params }: { params: Promise<{ program: string }> }) {
  const { program } = await params;
  return <Apply programKey={program} />;
}
