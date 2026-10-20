import type { Metadata } from "next";
import Campus from "./Campus";
import "../scholarships/scholarships.css";
import "../apply-with-me/applyme.css";
import "./campus.css";

export const metadata: Metadata = {
  title: "REACH for Campuses | Esther Funds Foundation",
  description: "Will your university join the mission of preventing college dropouts? Share REACH with your students: emergency help, scholarships, free tools and real people. A free partnership with Esther Funds Foundation.",
  alternates: { canonical: "/campus" },
  openGraph: {
    title: "Will your university join the mission of preventing college dropouts?",
    description: "REACH for Campuses: a free partnership. Share REACH with your students and get a campus link and share kit.",
    url: "https://reach.estherfundsfoundation.org/campus",
    images: ["/campus-kit/post-before-you-drop-out.jpg"],
  },
};

export default function Page() { return <Campus />; }
