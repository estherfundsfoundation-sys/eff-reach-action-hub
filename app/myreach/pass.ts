/* My REACH: the student's sign-in. An email and a 6-digit code (MyEFF's /api/reach/pass
   emails it; eff_reach_code_verify trades it for a 30-day token). The token lives in this
   browser only (localStorage reach-pass) and every call carries it; MyEFF stores only its
   sha256. A REACH account is not a MyEFF membership. */
import { SUPABASE, KEY } from "../scholarships/lib";

export const MYEFF = "https://my.estherfundsfoundation.org";
const STORE = "reach-pass";

export type Pass = { token: string; email: string };
export function readPass(): Pass | null {
  try { const v = JSON.parse(localStorage.getItem(STORE) || "null"); return v && typeof v.token === "string" ? v : null; } catch { return null; }
}
export function writePass(p: Pass | null) {
  try { if (p) localStorage.setItem(STORE, JSON.stringify(p)); else localStorage.removeItem(STORE); window.dispatchEvent(new Event("reach-pass")); } catch { /* private mode */ }
}

export class SignedOut extends Error {}

export async function call<T>(fn: string, body: Record<string, unknown>): Promise<T> {
  const r = await fetch(`${SUPABASE}/rest/v1/rpc/${fn}`, {
    method: "POST", headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (d as { message?: string })?.message || "Something went wrong. Try again.";
    if (/signed out/i.test(msg)) { writePass(null); throw new SignedOut(msg); }
    throw new Error(msg);
  }
  return d as T;
}

export async function startCode(email: string, website = "") {
  const r = await fetch(`${MYEFF}/api/reach/pass`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, website }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "The code didn't send. Try again.");
  return d as { session: string; returning: boolean };
}

export async function upload(token: string, application: string, key: string, file: File) {
  const r = await fetch(`${MYEFF}/api/reach/upload`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, application, key, name: file.name, type: file.type, size: file.size }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.error || "The upload couldn't start.");
  const put = await fetch(d.url, { method: "PUT", headers: { "Content-Type": file.type, "x-upsert": "true" }, body: file });
  if (!put.ok) throw new Error("The upload didn't finish. Check your connection and try again.");
  return call<App>("eff_reach_doc_attach", { p_token: token, p_id: application, p_key: key, p_path: d.path, p_name: file.name });
}

export type Question = { key: string; label: string; kind: string; required?: boolean; options?: string[]; help?: string; max?: number };
export type DocReq = { key: string; label: string; required?: boolean; help?: string };
export type Program = {
  key: string; name: string; kind: string; summary: string; amount: string | null; who: string | null; audience: string;
  open: boolean; status: string; cycle: string | null; opens_at: string | null; closes_at: string | null; rolling: boolean;
  description?: string; questions?: Question[]; documents?: DocReq[];
};
export type App = {
  id: string; number: string; program: string; cycle: string; status: string; answers: Record<string, unknown>;
  documents: Array<{ key: string; name: string; size: number; at: string }>; submitted_at: string | null; decided_at: string | null;
  decision_note: string | null; more_info: string | null; award_amount: number | null; updated_at: string;
  events: Array<{ at: string; kind: string; actor: string }>; program_name?: string; program_kind?: string; program_open?: boolean; closes_at?: string | null;
};
export type Me = {
  email: string; is_member: boolean; applications: App[];
  profile: { first_name: string | null; last_name: string | null; preferred_name: string | null; phone: string | null; school: string | null; level: string | null; grad_year: number | null; state: string | null };
};

export const STATUS_WORDS: Record<string, { label: string; tone: string; line: string }> = {
  draft: { label: "Draft", tone: "", line: "Not sent yet. Finish it before it closes." },
  submitted: { label: "Sent", tone: "ok", line: "EFF has it. You'll get an email when there's news." },
  reviewing: { label: "Being reviewed", tone: "ok", line: "Someone at EFF is reading it now." },
  more_info: { label: "EFF needs more", tone: "hot", line: "EFF asked for something. Add it and send it again." },
  awarded: { label: "Selected", tone: "win", line: "Congratulations. EFF will contact you about next steps." },
  not_selected: { label: "Not selected", tone: "", line: "Not this time. Keep going: thousands of other scholarships are open." },
  withdrawn: { label: "Withdrawn", tone: "", line: "You withdrew this application." },
};
