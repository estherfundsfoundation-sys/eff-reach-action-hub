import type { Metadata } from "next";
import Missing from "./Missing";
import "../scholarships.css";

export const metadata: Metadata = {
  title: "Tell us about a scholarship | REACH",
  description: "Know a scholarship REACH doesn't list yet? Send the provider's own page and a person checks it.",
  alternates: { canonical: "/scholarships/missing" },
};

export default function Page() {
  return <Missing />;
}
