import type { Metadata } from "next";
import Sponsor from "./Sponsor";
import "../scholarships/scholarships.css";
import "../apply-with-me/applyme.css";
import "../campus/campus.css";
import "./sponsor.css";

export const metadata: Metadata = {
  title: "Sponsor REACH | Esther Funds Foundation",
  description: "Put your name behind the moment a student almost walked away. Sponsor REACH on Tour, REACH Workshops, emergency help, care packages and more with Esther Funds Foundation, a 501(c)(3).",
  alternates: { canonical: "/sponsor" },
  openGraph: {
    title: "Sponsor REACH: before they drop out, they REACH.",
    description: "What you can sponsor, what's in it for you, and what REACH looks like in real life.",
    url: "https://reach.estherfundsfoundation.org/sponsor",
    images: ["/campus-kit/post-before-you-drop-out.jpg"],
  },
};

export default function Page() { return <Sponsor />; }
