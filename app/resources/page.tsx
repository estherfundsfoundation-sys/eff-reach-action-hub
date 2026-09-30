import type { Metadata } from "next";
import AllResources from "./AllResources";
import "../scholarships/scholarships.css";
import "../reach-home.css";

export const metadata: Metadata = {
  title: "All resources | REACH by Esther Funds Foundation",
  description: "Every REACH tool, guide and lifeline in one place, organized by what's going on: help right now, paying for school, staying enrolled, mind and heart, career, family, and leading.",
  alternates: { canonical: "/resources" },
};

export default function Page() { return <AllResources />; }
