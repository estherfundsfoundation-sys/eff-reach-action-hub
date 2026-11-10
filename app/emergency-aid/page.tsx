import type { Metadata } from "next";
import AidFinder from "./AidFinder";
import { rpc } from "../scholarships/lib";
import "../scholarships/scholarships.css";
import "../my-college/college.css";
import "./aid.css";

export const revalidate = 600;
export const metadata: Metadata = {
  title: "Emergency Aid Finder | REACH by Esther Funds Foundation",
  description: "Your college might have emergency money for you right now. Find it, and get the exact words to ask for it.",
  alternates: { canonical: "/emergency-aid" },
};

export type AidStats = { funds: number; fund_colleges: number; colleges: number; listings: number };

export default async function Page() {
  const stats = await rpc<AidStats>("eff_emergency_aid_stats", {}, 600).catch(() => null);
  return <AidFinder stats={stats} />;
}
