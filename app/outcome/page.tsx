import Link from "next/link";
import type { Metadata } from "next";
import OutcomeForm from "./OutcomeForm";
import "./outcome.css";

export const metadata: Metadata = {
  title: "Share Your REACH Outcome | Esther Funds Foundation",
  description: "Tell Esther Funds Foundation whether a REACH tool helped protect your aid, money, credits, housing, or enrollment.",
};

export default function OutcomePage(){
  return <main className="outcome-page"><header><Link href="/defense">← Student Defense Suite</Link><span>EFF IMPACT CHECK-IN</span><Link href="/">REACH home</Link></header><section className="outcome-hero"><p>WHAT HAPPENED NEXT?</p><h1>Your outcome can<br/><em>open the next door.</em></h1><span>EFF uses verified, aggregate outcomes to improve tools and show funders what students are actually overcoming. No account, student ID, document, or private financial information is requested.</span></section><OutcomeForm/><footer><strong>Every Future Fulfilled.</strong><span>Need direct help instead? <a href="https://portal.estherfundsfoundation.org/resources/student-help">Open a secure EFF help case.</a></span></footer></main>;
}
