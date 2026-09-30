/* REACH Scholarships: shared helpers. The directory lives in MyEFF's database
   (eff_scholarships, refreshed every morning from 64 sources by MyEFF's
   /api/cron/scholarships); REACH only reads it with the public key through the
   anon functions eff_scholarships_search / eff_scholarship / eff_scholarships_by_slugs /
   eff_scholarships_stats / eff_scholarships_candidates. National runs it from
   MyEFF → National → Scholarships. Nothing about a student is stored anywhere:
   saved lists and quiz answers stay in the student's own browser. */

export const SUPABASE = "https://voljlrqyruluuqrfqwww.supabase.co";
export const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGpscnF5cnVsdXVxcmZxd3d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTY2NTEsImV4cCI6MjEwMDgzMjY1MX0.O9Ini6y-jLZIyVClID9mslNwi4Ga33EieKGEhX0QSao";

export async function rpc<T>(fn: string, body: Record<string, unknown> = {}, revalidate = 300): Promise<T> {
  const r = await fetch(`${SUPABASE}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...(typeof window === "undefined" ? { next: { revalidate } } : {}),
  } as RequestInit);
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((d as { message?: string })?.message || "Something went wrong. Try again in a second.");
  return d as T;
}

export type Card = {
  slug: string; title: string; sponsor: string | null; amount: string | null; amount_numeric: number | null;
  deadline_kind: "date" | "rolling" | "varies"; deadline: string | null; levels: string[]; featured?: boolean; current?: boolean;
};
export type Detail = Card & {
  summary: string | null; url: string; eligibility: Record<string, unknown>; current: boolean; checked: string | null; seen: string | null;
  source: { name: string; url: string; permission: string; note: string | null };
};
export type Search = { total: number; page: number; pages: number; items: Card[] };
export type Stats = { current: number; closing_soon: number; sources: number; updated: string | null };

export const LEVELS = [
  { v: "high school", label: "High school" },
  { v: "undergraduate", label: "College (undergrad)" },
  { v: "graduate", label: "Grad school" },
  { v: "trade school", label: "Trade school" },
];

export function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const end = new Date(`${deadline}T23:59:59`);
  return Math.ceil((end.getTime() - Date.now()) / 86400000);
}
export function dueLabel(c: Pick<Card, "deadline" | "deadline_kind">) {
  if (c.deadline) {
    const d = daysLeft(c.deadline);
    const date = new Date(`${c.deadline}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: new Date(`${c.deadline}T12:00:00`).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined });
    if (d !== null && d <= 0) return "Due today";
    if (d !== null && d === 1) return "Due tomorrow";
    if (d !== null && d <= 14) return `${d} days left · ${date}`;
    return `Due ${date}`;
  }
  return c.deadline_kind === "rolling" ? "Rolling: apply anytime" : "Deadline varies";
}
export const urgent = (c: Pick<Card, "deadline">) => { const d = daysLeft(c.deadline); return d !== null && d <= 14; };

// ---------- Saved list (this browser only) ----------
export const SAVED_KEY = "reach-saved-scholarships";
export function readSaved(): string[] {
  try { const v = JSON.parse(localStorage.getItem(SAVED_KEY) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, 200) : []; } catch { return []; }
}
export function writeSaved(list: string[]) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 200))); window.dispatchEvent(new Event("reach-saved")); } catch { /* private mode: nothing saved */ }
}

// ---------- Calendar (.ics), made in the browser ----------
export function icsFor(items: Array<Pick<Card, "slug" | "title" | "sponsor" | "deadline">>) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const events = items.filter((i) => i.deadline).flatMap((i) => {
    const day = i.deadline!.replace(/-/g, "");
    const url = `https://reach.estherfundsfoundation.org/scholarships/${i.slug}`;
    return [
      "BEGIN:VEVENT", `UID:${i.slug}@reach.estherfundsfoundation.org`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${day}`, `SUMMARY:${esc(`Due: ${i.title}`)}`,
      `DESCRIPTION:${esc(`${i.sponsor ? `Offered by ${i.sponsor}. ` : ""}Check the provider's page for the exact time it closes. ${url}`)}`,
      `URL:${url}`,
      "BEGIN:VALARM", "TRIGGER:-P7D", "ACTION:DISPLAY", `DESCRIPTION:${esc(`One week left: ${i.title}`)}`, "END:VALARM",
      "BEGIN:VALARM", "TRIGGER:-P1D", "ACTION:DISPLAY", `DESCRIPTION:${esc(`Due tomorrow: ${i.title}`)}`, "END:VALARM",
      "END:VEVENT",
    ];
  });
  return ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Esther Funds Foundation//REACH Scholarships//EN", "CALSCALE:GREGORIAN", ...events, "END:VCALENDAR"].join("\r\n");
}
export function downloadIcs(items: Array<Pick<Card, "slug" | "title" | "sponsor" | "deadline">>, name = "reach-scholarship-deadlines.ics") {
  const blob = new Blob([icsFor(items)], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
