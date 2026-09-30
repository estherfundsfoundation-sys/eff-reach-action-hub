import { NextResponse } from "next/server";
import { rpc } from "../../../scholarships/lib";
import { rank, type Candidate, type Profile } from "../../../scholarships/match";

/* REACH Scholarships "Match me": ranks the open scholarships against the quiz answers
   and sends back the best 60 with their reasons. The answers are used for this one
   request and never stored or logged; the student keeps them on their own phone. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Profile;
  const clip = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : null);
  const profile: Profile = {
    level: clip(body.level, 40), state: clip(body.state, 2), school: clip(body.school, 120), field: clip(body.field, 80), gpa: clip(body.gpa, 12),
    identity: Array.isArray(body.identity) ? body.identity.filter((x) => typeof x === "string").slice(0, 12) : [],
  };
  try {
    const items = await rpc<Candidate[]>("eff_scholarships_candidates", { p_level: profile.level || null }, 900);
    return NextResponse.json({ matches: rank(profile, items, 60), considered: items.length }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "The list didn't load. Try again in a minute." }, { status: 502 });
  }
}
