import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { adminEmails } from "@/lib/reach-shipping-admin";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Invalid request origin.", { status: 403 });
  const user = await getChatGPTUser();
  if (!user) return new Response("Sign in required.", { status: 401 });
  if (!adminEmails().has(user.email.toLowerCase())) return new Response("Not authorized.", { status: 403 });
  const form = await request.formData();
  const id = String(form.get("id") || "").trim();
  const reason = String(form.get("reason") || "").trim().slice(0, 300);
  if (!/^[0-9a-f-]{36}$/i.test(id) || reason.length < 3) return new Response("A valid letter and reason are required.", { status: 400 });
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return new Response("Database unavailable.", { status: 503 });
  await env.DB.prepare(`UPDATE recommendation_letter_issuances SET status='revoked', revoked_at=?, revocation_reason=? WHERE id=? AND status='issued'`).bind(new Date().toISOString(), reason, id).run();
  return NextResponse.redirect(new URL("/admin/recommendation-letters", request.url), { status: 303 });
}
