import type { Metadata } from "next";
import Orgs from "./Orgs";
import "../scholarships/scholarships.css";
import "../reach-home.css";
import "../start/start.css";

export const metadata: Metadata = {
  title: "Organizations doing this work | REACH by Esther Funds Foundation",
  description: "46 organizations across the country that keep students in school: emergency money, basic needs, coaching, scholarships, first-gen and foster youth support, high school dropout prevention and the research behind it.",
  alternates: { canonical: "/organizations" },
};

export default function Page() { return <Orgs />; }
