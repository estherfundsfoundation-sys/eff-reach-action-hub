import type { Metadata } from "next";
import Builder from "./Builder";
import "../scholarships/scholarships.css";
import "./applyme.css";

/* Apply With Me: EFF builds your scholarship application with you; you make it yours and click submit.
   Profile, essay bank, matches, a kit per scholarship and a tracker, saved to the student's My REACH
   account in MyEFF (eff_raw_* functions). EFF never submits for a student. */
export const metadata: Metadata = {
  title: "Apply With Me | REACH Scholarships by Esther Funds Foundation",
  description: "Build your scholarship application once with EFF. Your story becomes answers and essays for every scholarship. You make it yours and click submit. Free.",
  alternates: { canonical: "/apply-with-me" },
  openGraph: {
    title: "You don't have to apply alone.",
    description: "Apply With Me: EFF builds your scholarship application with you. You make it yours and click submit.",
    url: "https://reach.estherfundsfoundation.org/apply-with-me",
    images: ["/og.png"],
  },
};

export default function Page() { return <Builder />; }
