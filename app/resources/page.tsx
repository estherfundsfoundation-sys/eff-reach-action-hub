import type { Metadata } from "next";
import AllResources from "./AllResources";
import "../scholarships/scholarships.css";
import "../reach-home.css";
import "../start/start.css";

export const metadata: Metadata = {
  title: "All resources | REACH by Esther Funds Foundation",
  description: "Every REACH tool, guide and lifeline in one place, for students from 9th grade to after graduation, families, schools, colleges and communities, checked every morning.",
  alternates: { canonical: "/resources" },
};

export default function Page() { return <AllResources />; }
