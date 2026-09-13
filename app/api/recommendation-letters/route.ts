import { sanitizeScholarName, screenRecommendationDetails } from "@/app/tools/recommendation-content-policy";

type Submission = Record<string, unknown>;

const clean = (value: unknown, max: number) => typeof value === "string" ? value.trim().slice(0, max) : "";
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const validPhone = (value: string) => value.replace(/\D/g, "").length >= 7 && value.replace(/\D/g, "").length <= 15;
const allowedActions = new Set(["copy", "download", "print"]);
const allowedPronouns = new Set(["she", "he", "they"]);

function referenceFromId(id: string) {
  return `EFF-REC-${id.replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

async function ensureTable(database: D1Database) {
  await database.prepare(`CREATE TABLE IF NOT EXISTS recommendation_letter_issuances (
    id TEXT PRIMARY KEY,
    reference TEXT NOT NULL UNIQUE,
    client_nonce TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    school TEXT NOT NULL,
    major TEXT NOT NULL,
    gpa TEXT,
    scholarship_name TEXT NOT NULL,
    scholarship_organization TEXT NOT NULL,
    eff_connection TEXT NOT NULL,
    strengths TEXT NOT NULL,
    achievement TEXT NOT NULL,
    challenge TEXT,
    future_goal TEXT NOT NULL,
    pronouns TEXT NOT NULL,
    first_action TEXT NOT NULL,
    request_fingerprint TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'issued',
    notification_status TEXT NOT NULL DEFAULT 'pending',
    consent_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    revoked_at TEXT,
    revocation_reason TEXT
  )`).run();
  await database.prepare(`CREATE INDEX IF NOT EXISTS idx_recommendation_issuances_created ON recommendation_letter_issuances(created_at DESC)`).run();
  await database.prepare(`CREATE INDEX IF NOT EXISTS idx_recommendation_issuances_status ON recommendation_letter_issuances(status, created_at DESC)`).run();
  await database.prepare(`CREATE INDEX IF NOT EXISTS idx_recommendation_issuances_email_limit ON recommendation_letter_issuances(student_email, created_at DESC)`).run();
  await database.prepare(`CREATE INDEX IF NOT EXISTS idx_recommendation_issuances_network_limit ON recommendation_letter_issuances(request_fingerprint, created_at DESC)`).run();
}

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
    `Review or revoke: https://reach.estherfundsfoundation.org/admin/recommendation-letters`,
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

  const { env } = await import("cloudflare:workers");
  if (!env.DB) return Response.json({ error: "EFF letter oversight is temporarily unavailable. No letter was issued." }, { status: 503 });
  await ensureTable(env.DB);

  const existing = await env.DB.prepare(`SELECT reference FROM recommendation_letter_issuances WHERE client_nonce = ?`).bind(record.clientNonce).first<{ reference: string }>();
  if (existing?.reference) return Response.json({ ok: true, reference: existing.reference });

  const networkHint = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
  const fingerprintBytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${networkHint}|${request.headers.get("user-agent") || "unknown"}`));
  const requestFingerprint = [...new Uint8Array(fingerprintBytes)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const emailCount = await env.DB.prepare(`SELECT COUNT(*) AS total FROM recommendation_letter_issuances WHERE student_email=? AND created_at>=?`).bind(record.studentEmail, dayAgo).first<{ total: number }>();
  const networkCount = await env.DB.prepare(`SELECT COUNT(*) AS total FROM recommendation_letter_issuances WHERE request_fingerprint=? AND created_at>=?`).bind(requestFingerprint, hourAgo).first<{ total: number }>();
  // Allow a real student to prepare several scholarship applications and avoid
  // penalizing a campus lab or residence hall whose devices share an address.
  if (Number(emailCount?.total || 0) >= 15 || Number(networkCount?.total || 0) >= 60) {
    return Response.json({ error: "For security, this contact has reached the letter limit. Email nationals@estherfundsinc.org for help." }, { status: 429 });
  }

  const id = crypto.randomUUID();
  const reference = referenceFromId(id);
  const now = new Date().toISOString();
  try {
    await env.DB.prepare(`INSERT INTO recommendation_letter_issuances (
      id,reference,client_nonce,student_name,student_email,student_phone,school,major,gpa,
      scholarship_name,scholarship_organization,eff_connection,strengths,achievement,challenge,
      future_goal,pronouns,first_action,request_fingerprint,status,notification_status,consent_at,created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'issued','pending',?,?)`).bind(
      id, reference, record.clientNonce, record.studentName, record.studentEmail, record.studentPhone,
      record.school, record.major, record.gpa || null, record.opportunity, record.organization,
      record.effConnection, record.strengths, record.achievement, record.challenge || null,
      record.futureGoal, record.pronouns, record.action, requestFingerprint, now, now,
    ).run();
  } catch {
    const duplicate = await env.DB.prepare(`SELECT reference FROM recommendation_letter_issuances WHERE client_nonce = ?`).bind(record.clientNonce).first<{ reference: string }>();
    if (duplicate?.reference) return Response.json({ ok: true, reference: duplicate.reference });
    return Response.json({ error: "EFF could not securely record this letter. No letter was issued; please try again." }, { status: 503 });
  }

  let notificationStatus = "failed";
  try { notificationStatus = await notifyNationalOffice({ ...record, reference }); }
  catch { notificationStatus = "failed"; }
  await env.DB.prepare(`UPDATE recommendation_letter_issuances SET notification_status = ? WHERE id = ?`).bind(notificationStatus, id).run();
  return Response.json({ ok: true, reference, notificationSent: notificationStatus === "sent" });
}
