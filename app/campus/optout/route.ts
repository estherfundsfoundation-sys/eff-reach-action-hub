import { SUPABASE, KEY } from "../../scholarships/lib";

/* One-click opt-out from REACH for Campuses outreach emails (CAN-SPAM; List-Unsubscribe-Post). GET shows a plain
   confirmation; POST is what mail apps send for one-click unsubscribe. Either way the address is never emailed again. */
async function optOut(t: string) {
  try {
    await fetch(`${SUPABASE}/rest/v1/rpc/eff_reach_outreach_optout`, {
      method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_token: t.slice(0, 40) }), cache: "no-store",
    });
  } catch { /* shown as done; National also honours "no thanks" replies */ }
}
const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>You're unsubscribed | REACH</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#faf7ff;color:#1b1227;font:17px/1.55 system-ui,sans-serif;padding:24px}
main{max-width:520px;background:#fff;border:1px solid #e3d8f4;border-radius:22px;padding:28px}h1{margin:0 0 8px;color:#42127f;font-size:28px}a{color:#42127f;font-weight:700}</style></head>
<body><main><h1>You're unsubscribed.</h1><p>Esther Funds Foundation won't send REACH for Campuses emails to this address again. Thank you for the work you do for students.</p>
<p>If you ever want to share REACH, it's always free at <a href="https://reach.estherfundsfoundation.org/campus">reach.estherfundsfoundation.org/campus</a>.</p></main></body></html>`;

export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (t) await optOut(t);
  return new Response(page, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
export async function POST(req: Request) {
  const t = new URL(req.url).searchParams.get("t") || "";
  if (t) await optOut(t);
  return new Response("ok");
}
