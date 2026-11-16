import type { Metadata } from "next";
import Story from "./Story";
import "../scholarships/scholarships.css";
import "../my-college/college.css";
import "./aid-explained.css";

export const metadata: Metadata = {
  title: "Financial aid, explained like a story | REACH by Esther Funds Foundation",
  description: "Follow Maya through college and learn financial aid one small idea at a time: the gap, Pell, loans, the report card rule, second looks, holds and the magic number, and the 60% line.",
  alternates: { canonical: "/aid-explained" },
};

export default function Page() {
  return <Story />;
}
