# HOLD UP (`/holdup`)

Know your real balance before a registration hold. Shayna, 26 Oct 2026: free and built with plain code, no AI.

- `app/holdup/HoldUp.tsx` is the page, `parse.ts` holds the rules that sort bill lines, `School.tsx` holds the school pieces, and `holdup.css` holds the styles (scoped `.hu` inside `.sc`).
- What she pastes stays on her phone (localStorage `reach-holdup`, with Erase). Her chosen school is saved there too.
- **Purge Clock:** the school picker (`eff_search_institutions`) reads MyEFF's `eff_campus_deadlines_public(p_institution)`.
  - Students only see dates National has checked against the school's own page (status `live`, with a date and a source).
  - "Use this date" fills her deadline. The whole list downloads as one `.ics`. She can still type her own date.
- **Fee ledger:** sharing is opt-in. She ticks "Share my school's fee lines, not my name".
  - `eff_campus_fees_share(p_institution, p_term, p_lines [{name, amount}])` receives only fee names, amounts, her school and the term. It is anon and rate-limited, and filters out aid, payment and ID-like lines.
  - A fee named by 3+ students at a school shows as "Students at your school also often pay…" (`fees` in the public reader).
- National manages both in MyEFF, under National → Scholarships → HOLD UP: Purge Clock & fee ledger (`app/national/CampusDeadlinesDesk.tsx`).
- Linked from:
  - REACH Emergency (the hold/balance need)
  - `app/content/resources.ts`
  - `app/get-help/resources.ts`
  - MyEFF's Survival Kit Hold Buster, `lib/reach-resources.ts`, and member Home.
- **Deploy trap:** the domain is pinned by hand. After each deploy is READY, re-point `reach.estherfundsfoundation.org` to the new deployment (Vercel `assign_alias`).
