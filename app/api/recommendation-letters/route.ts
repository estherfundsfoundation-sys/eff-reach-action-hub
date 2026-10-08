import { KEY, SUPABASE } from "@/app/scholarships/lib";
import { sanitizeScholarName, screenRecommendationDetails } from "@/app/tools/recommendation-content-policy";

type Submission = Record<string, unknown>;

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = (value: string) => value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;
const allowedActions = new Set(["copy", "download", "print"]);
const allowedPronouns = new Set(["she", "he", "they"]);

async function notifyNationalOffice(record: Record<string, string>) {
  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  if (!apiKey) return "not_configured";
  const text = [
    "A new EFF scholarship recommendation letter was issued.",
    "",
    `Reference: ${record.reference}`,
    `Student: ${record.studentName}`,
    `Email: ${record.studentEmail}`,
    `Phone: ${record.studentPhone}`,
    `School: ${record.school}`,
    `Major: ${record.major}`,
    `GPA: ${record.gpa || "Not supplied"}`,
    `Scholarship: ${record.opportunity}`,
    `Organization: ${record.organization}`,
    `EFF connection: ${record.effConnection}`,
    `Strengths submitted: ${record.strengths}`,
    `Achievement submitted: ${record.achievement}`,
    `Challenge submitted: ${record.challenge || "Not supplied"}`,
    `Future goal submitted: ${record.futureGoal}`,
    `First action: ${record.action}`,
    "",
    `Review or revoke: https://my.estherfundsfoundation.org/national#letters`,
    `Public verification: https://reach.estherfundsfoundation.org/recommendation/${record.reference}`,
  ].join("\n");
  const payload = JSON.stringify({
    from: "EFF Recommendation Oversight <nationals@estherfundsinc.org>",
    to: ["nationals@estherfundsinc.org"],
    reply_to: record.studentEmail,
    subject: `New EFF scholarship letter · ${record.reference} · ${record.studentName}`,
    text,
  });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": `eff-recommendation-${record.reference}`,
        },
        body: payload,
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) return "sent";
      if (response.status !== 429 && response.status < 500) return "failed";
      if (attempt < 2) {
        const retryAfter = Math.min(Number(response.headers.get("retry-after")) || attempt + 1, 3);
        await new Promise((resolve) => setTimeout(resolve, retryAfter * 500));
      }
    } catch {
      if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 500));
    }
  }
  return "failed_after_retry";
}

export async function POST(request: Request) {
  let body: Submission;
  try { body = await request.json() as Submission; }
  catch { return Response.json({ error: "Please check the form and try again." }, { status: 400 }); }

  const record = {
    studentName: sanitizeScholarName(clean(body.studentName, 120)),
    studentEmail: clean(body.studentEmail, 180).toLowerCase(),
    studentPhone: clean(body.studentPhone, 40),
    school: clean(body.school, 180),
    major: clean(body.major, 140),
    gpa: clean(body.gpa, 12),
    opportunity: clean(body.opportunity, 180),
    organization: clean(body.organization, 180),
    effConnection: clean(body.effConnection, 700),
    strengths: clean(body.strengths, 700),
    achievement: clean(body.achievement, 700),
    challenge: clean(body.challenge, 700),
    futureGoal: clean(body.futureGoal, 700),
    pronouns: clean(body.pronouns, 10),
    action: clean(body.action, 20),
    clientNonce: clean(body.clientNonce, 80),
  };
  const required = [record.studentName, record.studentEmail, record.studentPhone, record.school, record.major, record.opportunity, record.organization, record.effConnection, record.strengths, record.achievement, record.futureGoal];
  if (required.some((value) => !value) || !validEmail(record.studentEmail) || !validPhone(record.studentPhone) || !allowedPronouns.has(record.pronouns) || !allowedActions.has(record.action) || body.consent !== true || !/^[a-zA-Z0-9-]{16,80}$/.test(record.clientNonce)) {
    return Response.json({ error: "Complete the required contact, scholarship, consent, and letter fields." }, { status: 400 });
  }
  const issues = screenRecommendationDetails(record);
  if (issues.length) return Response.json({ error: "Prohibited content must be removed before EFF can issue this letter." }, { status: 400 });

  // Letters are recorded in MyEFF's database (eff_reach_rec_letters) through the anon
  // function eff_reach_rec_issue, which also re-checks the fields, rate-limits by email
  // and network, is idempotent by clientNonce, and notifies National. National reviews
  // and revokes them in MyEFF → National → Letters. (REACH runs on Vercel: there is no
  // Cloudflare D1 binding, which is why issuing used to fail every time.)
  const networkHint = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("cf-connecting-ip") || "unknown";
  const fingerprintBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${networkHint}|${request.headers.get("user-agent") || "unknown"}`));
  const fingerprint = [...new Uint8Array(fingerprintBytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  let reference = "";
  try {
    const r = await fetch(`${SUPABASE}/rest/v1/rpc/eff_reach_rec_issue`, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p: { ...record, consent: true, fingerprint } }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    const d = await r.json().catch(() => ({})) as { reference?: string; message?: string };
    if (!r.ok || !d.reference) {
      const status = /letter limit/i.test(d.message || "") ? 429 : r.ok ? 503 : 400;
      return Response.json({ error: d.message || "EFF could not securely record this letter. No letter was issued; please try again." }, { status });
    }
    reference = d.reference;
  } catch {
    return Response.json({ error: "EFF could not reach its records just now. No letter was issued; please try again in a minute." }, { status: 503 });
  }

  let notificationStatus = "failed";
  try { notificationStatus = await notifyNationalOffice({ ...record, reference }); }
  catch { notificationStatus = "failed"; }
  return Response.json({ ok: true, reference, notificationSent: notificationStatus === "sent" });
}
