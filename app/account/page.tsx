import type { Metadata } from "next";
import Account from "./Account";
import "../scholarships/scholarships.css";

export const metadata: Metadata = {
  title: "My REACH | Esther Funds Foundation",
  description: "Sign in with your email to apply for EFF scholarships and funding and follow your applications. No password needed.",
  alternates: { canonical: "/account" },
};

export default function Page() { return <Account />; }
