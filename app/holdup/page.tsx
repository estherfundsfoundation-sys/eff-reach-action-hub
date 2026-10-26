import type { Metadata } from "next";
import HoldUp from "./HoldUp";
import "../scholarships/scholarships.css";
import "./holdup.css";

/* HOLD UP: know your real number before a registration hold. Everything runs in the browser. */
export const metadata: Metadata = {
  title: "HOLD UP: know what you owe before registration | REACH by Esther Funds Foundation",
  description: "Paste your student account and get your real number in two minutes: what you owe now, what's still coming, your real gap and a plan. Free, no sign-in, nothing leaves your phone.",
  alternates: { canonical: "/holdup" },
  openGraph: {
    title: "HOLD UP. Do you know what you owe?",
    description: "Find your real balance before a hold stops your registration. Free from REACH by EFF.",
    url: "https://reach.estherfundsfoundation.org/holdup",
    images: ["/og.png"],
  },
};

export default function Page() {
  return <HoldUp />;
}
