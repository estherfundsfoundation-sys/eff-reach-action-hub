import {
  formatShippingAddress,
  getAuthorizedShippingAdmin,
  ShippingConfirmation,
  submissionIssues,
} from "@/lib/reach-shipping-admin";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const admin = await getAuthorizedShippingAdmin();
  if (admin.status === "signed-out") return new Response("Sign in required.", { status: 401 });
  if (admin.status === "forbidden") return new Response("Not authorized.", { status: 403 });
  const { env } = await import("cloudflare:workers");
  if (!env.DB) return new Response("Database unavailable.", { status: 503 });

  let rows: ShippingConfirmation[] = [];
  try {
    const result = await env.DB.prepare(
      "SELECT * FROM lead_ambassador_shipping_confirmations ORDER BY datetime(updated_at) DESC"
    ).all<ShippingConfirmation>();
    rows = result.results || [];
  } catch {
    rows = [];
  }

  const headers = [
    "Review Status", "Issues", "Full Name", "Email", "School", "Lead Status",
    "Shipping Action", "Shipment Type", "Packet Quantity", "Label Instruction",
    "Phone", "Delivery Notes", "Shirt Interest", "Shirt Size", "Submitted ET", "Reference",
  ];
  const lines = [headers.map(csvCell).join(",")];

  for (const row of rows) {
    const issues = submissionIssues(row);
    lines.push([
      issues.length ? "NEEDS REVIEW" : row.shipping_action === "no-packet" ? "NO SHIPMENT" : "READY",
      issues.join("; "), row.full_name, row.email, row.school, row.lead_status,
      row.shipping_action, row.shipment_type, row.packet_quantity || 1,
      formatShippingAddress(row), row.phone, row.delivery_notes, row.shirt_interest,
      row.shirt_size, row.updated_at, row.id.slice(0, 8).toUpperCase(),
    ].map(csvCell).join(","));
  }

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="reach-lead-shipping-confirmations.csv"',
      "Cache-Control": "no-store",
    },
  });
}
