import type { Metadata } from "next";
import { Suspense } from "react";
import Notify from "./Notify";
import "../scholarships/scholarships.css";
import "./notify.css";

export const metadata: Metadata = {
  title: "Be first to know | REACH by Esther Funds Foundation",
  description: "Make a free REACH account and get one email the day the EFF Emergency Grant and EFF's 2027 scholarships open.",
  alternates: { canonical: "/notify" },
  openGraph: {
    title: "Be first to know.",
    description: "One email the day the EFF Emergency Grant and EFF's 2027 scholarships open. Free. No password.",
    url: "https://reach.estherfundsfoundation.org/notify",
    images: ["/og.png"],
  },
};

export default function Page() {
  return <Suspense fallback={null}><Notify /></Suspense>;
}
