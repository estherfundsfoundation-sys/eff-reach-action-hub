import type { Metadata } from "next";
import PracticeIndex from "./PracticeIndex";
import "../scholarships/scholarships.css";
import "./practice.css";

export const metadata: Metadata = {
  title: "Practice the Conversation | REACH by Esther Funds Foundation",
  description: "Practice the hard conversations that keep you in school: financial aid, professors, advisors, managers, roommates, family, recruiters and job offers. Pick your words, see how they land, leave with a script.",
  alternates: { canonical: "/practice" },
  openGraph: {
    title: "Say it out loud before it counts.",
    description: "Eight conversations that keep students in school. Practice them here first, free and private.",
    url: "https://reach.estherfundsfoundation.org/practice",
    images: ["/og.png"],
  },
};

export default function Page() {
  return <PracticeIndex />;
}
