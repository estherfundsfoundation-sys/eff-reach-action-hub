import type { Metadata } from "next";
import Moves from "./Moves";
import "../scholarships/scholarships.css";
import "../my-college/college.css";
import "./aid-moves.css";

export const metadata: Metadata = {
  title: "The aid moves nobody tells you | REACH by Esther Funds Foundation",
  description: "Special circumstances, dependency overrides, SAP appeals, verification, scholarship displacement, the new Pell limits, summer Pell and more, from the official rules, with what to say.",
  alternates: { canonical: "/aid-moves" },
};

export default function Page() {
  return <Moves />;
}
