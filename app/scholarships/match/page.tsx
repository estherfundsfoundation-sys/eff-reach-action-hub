import type { Metadata } from "next";
import Quiz from "./Quiz";
import "../scholarships.css";

export const metadata: Metadata = {
  title: "Match me | REACH Scholarships",
  description: "Answer a few questions and REACH sorts thousands of open scholarships for you, and tells you why each one fits. Your answers stay on your phone.",
  alternates: { canonical: "/scholarships/match" },
};

export default function Page() {
  return <Quiz />;
}
