import type { Metadata } from "next";
import Finder from "./Finder";
import { rpc } from "../scholarships/lib";
import type { Coverage } from "./data";
import "../scholarships/scholarships.css";
import "./college.css";

/* Your College's Resources (3 Nov 2026, Shayna's brief): every US college in IPEDS HD2024 (6,072), and the help
   on each campus that EFF has confirmed. Data lives in MyEFF (eff_ipeds_institutions, eff_campus_resources),
   read with the public key. The coverage number counts only verified records. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Your college's resources | REACH by Esther Funds Foundation",
  description: "Find the emergency money, food pantry, counseling and financial aid help at your own college. Every US college, checked by EFF.",
  alternates: { canonical: "/my-college" },
  openGraph: { title: "What does your college already offer you?", description: "Emergency money, food, counseling, financial aid. Look up your college.", url: "https://reach.estherfundsfoundation.org/my-college", images: ["/og.png"] },
};

export default async function Page() {
  const cov = await rpc<Coverage>("eff_campus_coverage", {}, 600).catch(() => null);
  return <Finder coverage={cov} />;
}
