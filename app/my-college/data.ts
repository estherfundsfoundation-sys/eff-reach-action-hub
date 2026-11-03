/* Your College's Resources: the shapes MyEFF returns (eff_campus_search, eff_campus_public, eff_campus_coverage).
   Everything a student sees comes from MyEFF's database: no AI call, ever. */
export type Hit = { unitid: number; name: string; alias: string | null; city: string | null; state: string | null; level: string | null;
  control: string | null; hbcu: boolean; tribal: boolean; active: number; verified: number };
export type Item = {
  id: string;
  service: { name: string; description: string | null; url: string | null; how_to_apply: string | null; amount_max: number | null; college_wording: string | null };
  next_step: string;
  contact: { office: string | null; email: string | null; phone: string | null };
  location: { text: string | null; hours: string | null };
  source_url: string; last_verified_at: string | null; method: string;
};
export type Group = { type: string; label: string; items: Item[] };
export type College = {
  unitid: number; name: string; alias: string | null; city: string | null; state: string | null; level: string | null; control: string | null;
  hbcu: boolean; tribal: boolean; active: boolean; website_url: string | null; financial_aid_url: string | null;
  chapter: { name: string; slug: string; status: string } | null; crawled_at: string | null;
  groups: Group[]; pages: Array<{ type: string; label: string; url: string; checked_at: string | null }>;
};
export type Coverage = { colleges: number; verified_colleges: number; verified_resources: number; deep_colleges: number; crawled_colleges: number; pages_watched: number };

export const fmtDate = (s: string | null) => (s ? new Date(s).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : null);
export const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };

/* What a student sees on every college page, even before anything is verified. */
export const EFF_ROUTES = [
  { title: "EFF Emergency Grant", text: "Up to $250 toward a bill that could make you leave school, paid straight to the company or school.", href: "/apply/emergency-grant" },
  { title: "Get Help near you", text: "Food, housing, money and health help near your campus, and what to say when you call.", href: "/get-help" },
  { title: "Call or text 211", text: "A free, local line for food, rent, utilities and more, any day.", href: "https://www.211.org/" },
  { title: "Talk to a person at EFF", text: "Tell EFF what's going on, privately. Someone reads it.", href: "https://my.estherfundsfoundation.org/lighthouse" },
];
