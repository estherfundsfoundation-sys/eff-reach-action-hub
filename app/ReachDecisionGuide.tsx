"use client";

import Link from "next/link";
import { useState } from "react";

const situations = [
  {
    id: "leaving",
    label: "I’m thinking about leaving college",
    title: "Pause the decision. Protect your options.",
    text: "Before you withdraw, identify the pressure point and build a 48-hour support plan. You may have appeals, emergency aid, housing help, or academic options you have not been shown yet.",
    steps: ["Name the barrier making school feel impossible.", "Use the Student Defense Suite to prepare your next conversation.", "Contact the office that can change the outcome before your deadline."],
    href: "/defense?tool=triage",
    action: "Build my stay-enrolled plan",
  },
  {
    id: "friend",
    label: "I’m worried a friend may drop out",
    title: "You do not have to fix it. Help them feel less alone.",
    text: "Start with a calm conversation, listen for the real barrier, and connect your friend to one practical next step without taking over their decision.",
    steps: ["Ask what is making it hardest to stay enrolled.", "Listen without judgment or rushing to solve it.", "Offer to sit with them while they contact support."],
    href: "/reach-a-friend/walkthrough",
    action: "Practice the conversation",
  },
  {
    id: "money",
    label: "A balance or financial-aid issue is blocking me",
    title: "Turn the number into a plan.",
    text: "Decode what you owe, separate grants from debt, and prepare a clear appeal or reconsideration request before making a permanent enrollment decision.",
    steps: ["Gather your bill and financial-aid offer.", "Calculate the true uncovered amount.", "Draft the right appeal, request, or payment conversation."],
    href: "/tools/award",
    action: "Open the balance decoder",
  },
  {
    id: "basic-needs",
    label: "I need food, housing, transportation, or essentials",
    title: "Staying enrolled starts with being supported.",
    text: "Find immediate basic-needs resources, organize who to contact, and make a practical support plan for the next few days—not the whole semester at once.",
    steps: ["Choose the most urgent need first.", "Find campus and local help available now.", "Build a short follow-up list so nothing gets lost."],
    href: "/reach-yourself",
    action: "Find immediate support",
  },
];

export default function ReachDecisionGuide() {
  const [active, setActive] = useState(situations[0]);

  return (
    <section className="decision-guide" aria-labelledby="decision-guide-title">
      <div className="decision-guide-heading">
        <p className="kicker">START WITH THE REAL SITUATION</p>
        <h2 id="decision-guide-title">What is happening right now?</h2>
        <p>Choose the closest match. REACH will give you a practical first move—not another research assignment.</p>
      </div>
      <div className="decision-guide-grid">
        <div className="decision-options" role="list" aria-label="Choose your situation">
          {situations.map((situation, index) => (
            <button
              key={situation.id}
              type="button"
              className={active.id === situation.id ? "active" : ""}
              onClick={() => setActive(situation)}
              aria-pressed={active.id === situation.id}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{situation.label}</strong>
              <b aria-hidden="true">→</b>
            </button>
          ))}
        </div>
        <article className="decision-result" aria-live="polite">
          <span className="decision-result-label">YOUR FIRST MOVE</span>
          <h3>{active.title}</h3>
          <p>{active.text}</p>
          <ol>
            {active.steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <Link href={active.href}>{active.action} <span aria-hidden="true">↗</span></Link>
        </article>
      </div>
    </section>
  );
}
