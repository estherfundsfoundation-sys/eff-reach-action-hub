import type { Metadata } from "next";
import GetHelp from "./GetHelp";
import "../scholarships/scholarships.css";

export const metadata: Metadata = {
  title: "Get Help | REACH by Esther Funds Foundation",
  description: "Out of food, behind on rent, stuck on a hold, or just not okay? Tell REACH what's going on and find help near you, in plain words. Nothing you pick is saved.",
  alternates: { canonical: "/get-help" },
  openGraph: { title: "Get Help | REACH", description: "Help near you for college students, in plain words. Before you drop out, REACH.", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "REACH Get Help" }] },
};

export default function Page() {
  return <GetHelp />;
}
