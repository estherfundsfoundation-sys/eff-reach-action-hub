import { KEY, SUPABASE } from "@/app/scholarships/lib";

/* Impact check-ins are recorded in MyEFF's database through the anon eff_reach_outcome_submit
   (validation, honeypot and rate limits live there); National reads them in MyEFF → National → REACH.
   This used to write to a Cloudflare D1 binding that does not exist on Vercel, so every check-in failed. */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = await request.json() as Record<string, unknown>; }
  catch { return Response.json({ error: "Please check the form and try again." }, { status: 400 }); }
  const hint = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${hint}|${request.headers.get("user-agent") || "unknown"}`));
  const fingerprint = [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, "0")).join("");
  try {
    const r = await fetch(`${SUPABASE}/rest/v1/rpc/eff_reach_outcome_submit`, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p: { ...body, consent: body.consent === true, fingerprint } }),
      cache: "no-store",
      signal: AbortSignal.timeout(12000),
    });
    const d = await r.json().catch(() => ({})) as { reference?: string; message?: string };
    if (!r.ok || !d.reference) return Response.json({ error: d.message || "Your check-in could not be saved. Please try again." }, { status: r.ok ? 503 : 400 });
    return Response.json({ ok: true, reference: d.reference });
  } catch {
    return Response.json({ error: "We could not reach EFF just now. Please try again in a minute." }, { status: 503 });
  }
}
