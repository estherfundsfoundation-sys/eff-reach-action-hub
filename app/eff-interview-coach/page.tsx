import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EFF Interview Coach | REACH Career Studio",
  description: "Practice profession-specific interviews and improve with transparent EFF coaching feedback.",
};

export default function InterviewCoachPage() {
  return (
    <main className="interview-coach-route">
      <iframe
        src="/eff-interview-coach-app/index.html"
        title="EFF Interview Coach"
        allow="microphone"
      />
      <noscript>
        <p>
          The EFF Interview Coach needs JavaScript.{" "}
          <a href="/eff-interview-coach-app/index.html">Open the coach directly.</a>
        </p>
      </noscript>
    </main>
  );
}
