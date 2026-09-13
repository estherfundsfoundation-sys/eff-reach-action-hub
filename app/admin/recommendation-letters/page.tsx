/* eslint-disable @next/next/no-html-link-for-pages */
import Link from "next/link";
import { chatGPTSignInPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { adminEmails } from "@/lib/reach-shipping-admin";
import "./recommendation-letters.css";

type LetterRow = {
  id: string; reference: string; student_name: string; student_email: string; student_phone: string;
  school: string; major: string; gpa: string | null; scholarship_name: string; scholarship_organization: string;
  eff_connection: string; strengths: string; achievement: string; challenge: string | null; future_goal: string;
  status: string; notification_status: string; created_at: string; revoked_at: string | null; revocation_reason: string | null;
};

export default async function RecommendationLettersAdmin() {
  const user = await getChatGPTUser();
  if (!user) return <main className="letter-admin-gate"><p>EFF NATIONAL OFFICE</p><h1>Letter Oversight</h1><span>Sign in with an authorized National Office account.</span><a href={chatGPTSignInPath("/admin/recommendation-letters")}>Sign in securely</a></main>;
  if (!adminEmails().has(user.email.toLowerCase())) return <main className="letter-admin-gate"><p>ACCESS NOT AUTHORIZED</p><h1>Letter Oversight</h1><span>Signed in as {user.email}. Contact the National Office.</span><Link href="/">Return home</Link></main>;

  let rows: LetterRow[] = [];
  let error = "";
  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB) error = "Database binding unavailable.";
    else {
      const result = await env.DB.prepare(`SELECT id,reference,student_name,student_email,student_phone,school,major,gpa,scholarship_name,scholarship_organization,eff_connection,strengths,achievement,challenge,future_goal,status,notification_status,created_at,revoked_at,revocation_reason FROM recommendation_letter_issuances ORDER BY created_at DESC LIMIT 500`).all<LetterRow>();
      rows = result.results || [];
    }
  } catch { error = "No scholarship recommendation letters have been issued yet."; }

  const active = rows.filter((row) => row.status === "issued").length;
  const revoked = rows.filter((row) => row.status === "revoked").length;
  return <main className="letter-admin">
    <nav><Link href="/">← REACH home</Link><span>Signed in as {user.email}</span><a href="/api/admin/recommendation-letters/export">Download CSV</a></nav>
    <header><p>EFF NATIONAL OFFICE · PRIVATE OVERSIGHT</p><h1>Every letter.<br/><em>Accountable.</em></h1><span>Review the student’s submitted contact information and statements. Revoke only the exact reference that should no longer be represented as active.</span></header>
    <section className="letter-admin-metrics"><article><strong>{rows.length}</strong><span>Total issued records</span></article><article><strong>{active}</strong><span>Currently active</span></article><article><strong>{revoked}</strong><span>Revoked</span></article></section>
    {error && <p className="letter-admin-error">{error}</p>}
    <section className="letter-records">{rows.map((row) => <article key={row.id} className={row.status === "revoked" ? "revoked" : ""}>
      <header><div><small>{new Date(row.created_at).toLocaleString("en-US")}</small><h2>{row.student_name}</h2><b>{row.reference}</b></div><span>{row.status.toUpperCase()}</span></header>
      <div className="letter-record-grid"><p><b>Contact</b><a href={`mailto:${row.student_email}`}>{row.student_email}</a><a href={`tel:${row.student_phone}`}>{row.student_phone}</a></p><p><b>School</b>{row.school}<br/>{row.major}{row.gpa ? ` · GPA ${row.gpa}` : ""}</p><p><b>Scholarship</b>{row.scholarship_name}<br/>{row.scholarship_organization}</p><p><b>Email alert</b>{row.notification_status.replaceAll("_", " ")}</p></div>
      <details><summary>Review everything the student submitted</summary><dl><dt>EFF connection</dt><dd>{row.eff_connection}</dd><dt>Strengths</dt><dd>{row.strengths}</dd><dt>Achievement or service</dt><dd>{row.achievement}</dd><dt>Challenge</dt><dd>{row.challenge || "Not supplied"}</dd><dt>Future goal</dt><dd>{row.future_goal}</dd></dl></details>
      {row.status === "issued" ? <form method="post" action="/api/admin/recommendation-letters/revoke"><input type="hidden" name="id" value={row.id}/><label><span>Reason for revocation</span><input name="reason" required maxLength={300} placeholder="Brief internal reason"/></label><button type="submit">Revoke this exact letter</button></form> : <p className="revocation-note"><b>Revoked:</b> {row.revoked_at ? new Date(row.revoked_at).toLocaleString("en-US") : "—"}<br/>{row.revocation_reason}</p>}
    </article>)}</section>
  </main>;
}
