import { getChatGPTUser } from "@/app/chatgpt-auth";

const DEFAULT_ADMINS = [
  "estherfundsfoundation@gmail.com",
  "nationals@estherfundsinc.org",
  "shaynavincent24@outlook.com",
];

export type ShippingConfirmation = {
  id: string;
  full_name: string;
  email: string;
  school: string;
  lead_status: string;
  shipping_action: string;
  label_name: string | null;
  organization: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  country: string | null;
  phone: string | null;
  delivery_notes: string | null;
  shipment_type: string;
  packet_quantity: number | null;
  shirt_interest: string | null;
  shirt_size: string | null;
  confirmed_at: string;
  updated_at: string;
};

export function adminEmails() {
  const configured = (process.env.REACH_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return new Set([...DEFAULT_ADMINS, ...configured]);
}

export async function getAuthorizedShippingAdmin() {
  const user = await getChatGPTUser();
  if (!user) return { status: "signed-out" as const, user: null };
  if (!adminEmails().has(user.email.toLowerCase())) {
    return { status: "forbidden" as const, user };
  }
  return { status: "authorized" as const, user };
}

export function submissionIssues(row: ShippingConfirmation) {
  const issues: string[] = [];

  if (row.lead_status === "needs-review") issues.push("Lead role needs review");
  if (row.lead_status === "no-longer-serving" && row.shipping_action !== "no-packet") {
    issues.push("Do not ship — no longer serving");
  }
  if (
    row.shipping_action === "update-address" &&
    (!row.label_name || !row.address_1 || !row.city || !row.state || !row.postal_code)
  ) {
    issues.push("Updated label is incomplete");
  }
  if (row.shipment_type === "bulk-campus" && !row.packet_quantity) {
    issues.push("Bulk quantity is missing");
  }
  if (row.shipment_type === "unsure") issues.push("Shipment type needs review");
  if (row.shirt_interest === "yes" && !row.shirt_size) issues.push("Shirt size is missing");

  return issues;
}

export function formatShippingAddress(row: ShippingConfirmation) {
  if (row.shipping_action === "shopify-correct") return "Use newest Shopify order";
  if (row.shipping_action === "no-packet") return "DO NOT SHIP";
  return [
    row.label_name,
    row.organization,
    row.address_1,
    row.address_2,
    [row.city, row.state, row.postal_code].filter(Boolean).join(", "),
    row.country,
  ]
    .filter(Boolean)
    .join(" · ");
}
