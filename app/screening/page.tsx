import type { Metadata } from "next";
import Screening from "./Screening";
import "../scholarships/scholarships.css";
import "./screening.css";

export const metadata: Metadata = {
  title: "Balance Screening | REACH by Esther Funds Foundation",
  description: "Got a college balance or a hold? Take a free two-minute pre-screening, get your first moves, and open a full screening that a person at EFF reviews.",
  alternates: { canonical: "/screening" },
  openGraph: { title: "REACH Balance Screening", description: "Got a balance? Let's look at it together. Free.", images: [{ url: "/og.png", width: 1536, height: 1024, alt: "REACH" }] },
};

export default function Page() { return <Screening />; }
