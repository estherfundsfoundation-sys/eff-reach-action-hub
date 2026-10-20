import { NextResponse } from "next/server";
import { SUPABASE, KEY } from "../../scholarships/lib";

/* A REACH campus partner's link (reach…/go/<code>). Counts the open for that campus (never who opened it)
   and lands the student on REACH's home. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  try {
    await fetch(`${SUPABASE}/rest/v1/rpc/eff_reach_campus_click`, {
      method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_code: (code || "").slice(0, 12) }), cache: "no-store",
    });
  } catch { /* the student still gets REACH */ }
  return NextResponse.redirect(new URL("/?from=campus", req.url), 302);
}
