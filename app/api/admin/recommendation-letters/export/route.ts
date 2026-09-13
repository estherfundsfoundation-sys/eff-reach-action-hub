import { getChatGPTUser } from "@/app/chatgpt-auth";
import { adminEmails } from "@/lib/reach-shipping-admin";

type Row = Record<string, string | null>;
const csv = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return new Response("Sign in required.", { status: 401 });
  if (!adminEmails().has(user.email.toLowerCase())) return new Response("Not authorized.", { status: 403 });
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return new Response("Database unavailable.", { status: 503 });
  let rows: Row[] = [];
  try { rows = (await env.DB.prepare(`SELECT * FROM recommendation_letter_issuances ORDER BY created_at DESC`).all<Row>()).results || []; }
  catch { return new Response("No recommendation-letter records exist yet.", { status: 404 }); }
  const headers = ["reference","status","student_name","student_email","student_phone","school","major","gpa","scholarship_name","scholarship_organization","eff_connection","strengths","achievement","challenge","future_goal","first_action","notification_status","created_at","revoked_at","revocation_reason"];
  const lines = [headers.map(csv).join(","), ...rows.map((row) => headers.map((header) => csv(row[header])).join(","))];
  return new Response(lines.join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="eff-recommendation-letters-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
