/* HOLD UP: reads a pasted student account summary in the browser, with plain rules and no AI.
   Nothing leaves the phone. The student checks every line before any number counts.

   Kinds:
   charge   something the school is billing you (tuition, fees, housing, meal plan, a refund sent to you)
   aid      aid already paid into your account (grants, scholarships, loans that disbursed)
   coming   aid listed as anticipated / pending / authorized, not paid in yet
   payment  money you or your family already paid
   offer    a loan you were offered but haven't accepted (typed in; never on the bill)
   skip     not counted (totals, headers, dates) */

export type Kind = "charge" | "aid" | "coming" | "payment" | "offer" | "skip";
export type Line = { id: number; label: string; amount: number; kind: Kind; guessed?: boolean };

export const KIND_LABEL: Record<Kind, string> = {
  charge: "Charge",
  aid: "Aid paid in",
  coming: "Aid on the way",
  payment: "Payment made",
  offer: "Loan not accepted yet",
  skip: "Don't count",
};

const MONEY = /\(?-?\s?\$\s?\d[\d,]*(?:\.\d{1,2})?\)?(?:\s?CR\b)?|\(?-?\d{1,3}(?:,\d{3})+(?:\.\d{2})?\)?(?:\s?CR\b)?|\(?-?\d+\.\d{2}\)?(?:\s?CR\b)?/gi;

const RX = {
  total: /\b(account balance|balance due|amount due|total due|current due|term balance|total balance|total charges|total credits|total payments|total aid|net balance|subtotal|minimum (amount )?due|grand total|^balance\b|^total\b|statement balance|previous balance|ending balance)/i,
  coming: /\b(anticipat|pending|memo|estimated|authori[sz]ed|expected|not yet (disbursed|paid)|scheduled|projected)/i,
  refundOut: /\b(refund(ed)? (to|issued|check|sent)|disbursed to (student|you)|bankmobile|direct deposit refund|refund disbursement|overpayment refund)/i,
  payment: /\b(payment|paid|pymt|pmt\b|cash|check\b|cheque|credit card|debit card|visa|mastercard|amex|discover card|e-?check|ach\b|nelnet|touchnet|transact|installment|payment plan|flywire|cashnet|online pay)/i,
  aid: /\b(grant|scholarship|pell|seog|fseog|award|waiver|exemption|fellowship|stipend|tuition assistance|sponsor|third party|vgap|tag\b|hope\b|zell|bright futures|tap\b|tuition remission|loan|direct (sub|unsub)|stafford|perkins|plus\b|work[- ]?study|fws|gi bill|va benefit|chapter 33|voc rehab|foundation award|athletic aid)/i,
  charge: /\b(tuition|fee|housing|room|board|meal|dining|insurance|parking|lab\b|course|book|e-?book|technology|activity|athletic|health|orientation|graduation|late|penalty|fine|deposit|application|matriculation|library|transcript|id card|charge)/i,
  header: /^(description|detail code|term|date|charges?|payments?|credits?|amount|balance|account summary|summary|item|type)\s*$/i,
};

/* Turns "$1,234.50", "(1,234.50)", "-1234.50", "1,234.50 CR" into a signed number.
   Negative means a credit on the account. */
export function money(raw: string): number {
  const s = raw.trim();
  const credit = /^\(.*\)$/.test(s) || /-/.test(s) || /CR$/i.test(s);
  const n = Number(s.replace(/CR$/i, "").replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return credit ? -n : n;
}

function clean(label: string): string {
  return label
    .replace(MONEY, " ")
    .replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, " ")
    .replace(/\b(19|20)\d{2}-\d{2}-\d{2}\b/g, " ")
    .replace(/\b(fall|spring|summer|winter)\s+(19|20)\d{2}\b/gi, (m) => m)
    .replace(/[\t|•·]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim()
    .replace(/^[-:,.\s]+|[-:,.\s]+$/g, "");
}

export type Parsed = { lines: Line[]; shownBalance: number | null };

export function parseBill(text: string, startId = 1): Parsed {
  const out: Line[] = [];
  let shownBalance: number | null = null;
  let id = startId;
  const rows = text.replace(/\r/g, "").split("\n");

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row.trim()) continue;
    const found = row.match(MONEY);
    let label = clean(row);
    // Banner often puts the description on one line and the amount on the next.
    if (!found) continue;
    if (!label || /^[\d\s/.-]*$/.test(label)) {
      for (let j = i - 1; j >= 0 && j >= i - 2; j--) {
        const prev = rows[j].trim();
        if (prev && !prev.match(MONEY)) { label = clean(prev); break; }
      }
    }
    if (!label) label = "Line";
    if (RX.header.test(label)) continue;

    // When a row has several amounts (charge | payment | running balance), the first is the line itself.
    // A row with tab columns where the first amount sits in the second numeric column is a credit.
    const cells = row.split(/\t/);
    const amounts = found.map(money).filter((n) => n !== 0);
    if (!amounts.length) continue;
    let amt = amounts[0];
    if (cells.length >= 3 && amounts.length === 1) {
      const one = new RegExp(MONEY.source, "i");
      const idx = cells.findIndex((c) => one.test(c));
      const emptyBefore = idx > 1 ? cells.slice(1, idx).filter((c) => !c.trim()).length : 0;
      if (emptyBefore > 0 && amt > 0) amt = -amt;
    }

    if (RX.total.test(label)) {
      if (/balance|due/i.test(label) && shownBalance === null) shownBalance = amounts[amounts.length - 1];
      continue;
    }

    const abs = Math.abs(Math.round(amt * 100) / 100);
    let kind: Kind;
    if (RX.refundOut.test(label)) kind = "charge";
    else if (RX.coming.test(label)) kind = "coming";
    else if (RX.payment.test(label) && !RX.aid.test(label)) kind = "payment";
    else if (RX.aid.test(label)) kind = "aid";
    else if (RX.charge.test(label)) kind = amt < 0 ? "aid" : "charge";
    else kind = amt < 0 ? "aid" : "charge";

    out.push({ id: id++, label: label.slice(0, 90), amount: abs, kind, guessed: true });
  }
  return { lines: out, shownBalance };
}

export type Totals = {
  charges: number; aid: number; payments: number; coming: number; offers: number;
  owedNow: number;      // what the account says you owe today
  afterComing: number;  // after aid that's on its way pays in
  afterLoans: number;   // after you also accept the loans you were offered
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function totals(lines: Line[]): Totals {
  const sum = (k: Kind) => r2(lines.filter((l) => l.kind === k).reduce((s, l) => s + (Number(l.amount) || 0), 0));
  const charges = sum("charge"), aid = sum("aid"), payments = sum("payment"), coming = sum("coming"), offers = sum("offer");
  const owedNow = r2(charges - aid - payments);
  const afterComing = r2(owedNow - coming);
  const afterLoans = r2(afterComing - offers);
  return { charges, aid, payments, coming, offers, owedNow, afterComing, afterLoans };
}

export const usd = (n: number) =>
  (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: Math.abs(n) % 1 ? 2 : 0, maximumFractionDigits: 2 });

/* Fees that often aren't on the bill yet, so a student can add them before they surprise her. */
export const OFTEN_MISSING: Array<{ label: string; why: string }> = [
  { label: "Student health insurance", why: "Many schools charge it unless you waive it by a deadline with your own insurance." },
  { label: "Housing for next semester", why: "Housing often posts later than tuition." },
  { label: "Meal plan", why: "Can post separately from housing." },
  { label: "E-book or course materials fee", why: "Some schools bill books automatically unless you opt out." },
  { label: "Parking permit", why: "Usually only if you have a car on campus." },
  { label: "Late payment fee", why: "Added if a payment deadline passes." },
  { label: "Graduation fee", why: "Usually your last year." },
  { label: "Lab or course fees", why: "Some classes carry their own fee." },
];
