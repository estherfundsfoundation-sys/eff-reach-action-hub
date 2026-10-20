import type { Metadata } from "next";
import College from "./College";
import "../../scholarships/scholarships.css";
import "../applyme.css";

/* Apply With Me · College: EFF builds a high school student's college application with her (profile,
   activities, personal statement, college list, a kit per college); she submits on the college's portal. */
export const metadata: Metadata = {
  title: "Apply With Me · College | REACH by Esther Funds Foundation",
  description: "For high school students: EFF builds your college application with you. Activities, personal statement, college list and every supplement, ready to paste. You click submit. Free.",
  alternates: { canonical: "/apply-with-me/college" },
  openGraph: {
    title: "Let us apply for college with you.",
    description: "Apply With Me · College: your activities, personal statement, college list and supplements, built with EFF. You click submit.",
    url: "https://reach.estherfundsfoundation.org/apply-with-me/college",
    images: ["/og.png"],
  },
};

export default function Page() { return <College />; }
