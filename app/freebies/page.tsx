import type { Metadata } from "next";
import Freebies, { type Data } from "./Freebies";
import { rpc } from "../scholarships/lib";
import "../scholarships/scholarships.css";
import "./freebies.css";

/* REACH Freebies: free stuff and student deals that brands and agencies already advertise
   publicly. Every card links straight to the brand's own page (no codes copied, no commission).
   The list lives in MyEFF (eff_deals, read through the anon eff_deals_public); MyEFF checks
   every link each morning and hides dead ones and ended deals, and Free Friday picks itself
   each week. National runs it from MyEFF → National → Scholarships → REACH Freebies. */
export const revalidate = 600;

export const metadata: Metadata = {
  title: "Free stuff for students | REACH by Esther Funds Foundation",
  description: "Free money you're owed, free software, free trials and student prices, checked by EFF. Every link goes straight to the brand's own page.",
  alternates: { canonical: "/freebies" },
  openGraph: {
    title: "Free stuff you're owed.",
    description: "Up to $2,500 back for college, free Word and Excel, free textbooks, student prices and more. Checked by EFF.",
    url: "https://reach.estherfundsfoundation.org/freebies",
    images: ["/og.png"],
  },
};

export default async function Page() {
  const data = await rpc<Data>("eff_deals_public", {}, 600).catch(() => null);
  return <Freebies data={data} />;
}
