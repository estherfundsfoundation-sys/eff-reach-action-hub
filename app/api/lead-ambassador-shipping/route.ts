type Submission = Record<string, unknown>;

const allowedLeadStatuses = new Set([
  "confirmed-lead",
  "new-lead",
  "needs-review",
  "no-longer-serving",
]);

const allowedShippingActions = new Set([
  "shopify-correct",
  "update-address",
  "no-packet",
]);

const allowedShipmentTypes = new Set([
  "individual",
  "bulk-campus",
  "unsure",
]);

function clean(value: unknown, max = 250) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function nullable(value: unknown, max = 250) {
  const result = clean(value, max);
  return result || null;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  return Response.json(
    { error: "This REACH shipping confirmation round is closed." },
    { status: 410 }
  );
  /* The intake used a Cloudflare D1 binding that does not exist on Vercel; rebuild it on MyEFF before reopening a round. */
}
