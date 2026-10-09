import type { Metadata } from "next";
import Emergency from "./Emergency";
import "../scholarships/scholarships.css";
import "./emergency.css";

/* REACH Emergency: a private quiz that builds a step-by-step emergency plan.
   The plan is built by MyEFF (/api/reach/emergency); see Emergency.tsx. */
export const metadata: Metadata = {
  title: "REACH Emergency: make a plan | Esther Funds Foundation",
  description: "Five quick questions, then a step-by-step plan: your campus emergency fund, help near you and what's open right now. Private. Nothing is saved.",
  alternates: { canonical: "/emergency" },
  openGraph: {
    title: "In a tough spot? Let's make a plan.",
    description: "Rent, food, a bill, a hold on your account. Five questions, then a step-by-step plan built for you. Private, free, from EFF.",
    url: "https://reach.estherfundsfoundation.org/emergency",
    images: ["/og.png"],
  },
};

export default function Page() {
  return <Emergency />;
}
