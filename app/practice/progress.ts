/* Which scenarios a student has finished, in this browser only (localStorage "reach-practice").
   Nothing is sent anywhere. Every read and write is wrapped, because storage can be blocked. */
export type Done = Record<string, { at: string; strong: number; turns: number }>;
const KEY = "reach-practice";

export function readDone(): Done {
  try {
    const raw = window.localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : null;
    return v && typeof v === "object" && v.done && typeof v.done === "object" ? (v.done as Done) : {};
  } catch { return {}; }
}

export function markDone(slug: string, strong: number, turns: number) {
  try {
    const done = readDone();
    done[slug] = { at: new Date().toISOString(), strong, turns };
    window.localStorage.setItem(KEY, JSON.stringify({ done }));
  } catch { /* storage blocked: progress just isn't kept */ }
}
