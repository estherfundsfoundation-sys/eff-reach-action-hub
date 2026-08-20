import Link from "next/link";
import { chatGPTSignInPath } from "@/app/chatgpt-auth";
import {
  formatShippingAddress,
  getAuthorizedShippingAdmin,
  ShippingConfirmation,
  submissionIssues,
} from "@/lib/reach-shipping-admin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "REACH Shipping Dashboard | Esther Funds Foundation",
  robots: { index: false, follow: false },
};

const TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS lead_ambassador_shipping_confirmations (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    school TEXT NOT NULL,
    lead_status TEXT NOT NULL,
    shipping_action TEXT NOT NULL,
    label_name TEXT,
    organization TEXT,
    address_1 TEXT,
    address_2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'United States',
    phone TEXT,
    delivery_notes TEXT,
    shipment_type TEXT NOT NULL,
    packet_quantity INTEGER,
    shirt_interest TEXT,
    shirt_size TEXT,
    confirmed_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

function label(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function ShippingAdminPage() {
  const admin = await getAuthorizedShippingAdmin();

  if (admin.status === "signed-out") {
    return (
      <main className="shipping-admin-gate">
        <p className="kicker">PRIVATE REACH OPERATIONS</p>
        <h1>Sign in to view confirmations.</h1>
        <p>Ambassador addresses and contact information are protected.</p>
        <a className="button primary" href={chatGPTSignInPath("/admin/lead-ambassador-shipping")}>Sign in securely</a>
      </main>
    );
  }

  if (admin.status === "forbidden") {
    return (
      <main className="shipping-admin-gate">
        <p className="kicker">PRIVATE REACH OPERATIONS</p>
        <h1>This account is not authorized.</h1>
        <p>Signed in as {admin.user.email}. Contact the Esther Funds Foundation administrator.</p>
      </main>
    );
  }

  let rows: ShippingConfirmation[] = [];
  let databaseError = "";

  try {
    const { env } = await import("cloudflare:workers");
    if (!env.DB) throw new Error("Database binding is unavailable.");
    await env.DB.prepare(TABLE_SQL).run();
    const result = await env.DB.prepare(
      "SELECT * FROM lead_ambassador_shipping_confirmations ORDER BY datetime(updated_at) DESC"
    ).all<ShippingConfirmation>();
    rows = result.results || [];
  } catch (error) {
    databaseError = error instanceof Error ? error.message : "The live database could not be read.";
  }

  const flagged = rows.filter((row) => submissionIssues(row).length > 0);
  const ready = rows.filter(
    (row) => row.shipping_action !== "no-packet" && submissionIssues(row).length === 0
  );
  const addressUpdates = rows.filter((row) => row.shipping_action === "update-address");
  const bulkBoxes = rows.filter((row) => row.shipment_type === "bulk-campus");
  const packetTotal = rows.reduce(
    (total, row) => total + (row.shipping_action === "no-packet" ? 0 : row.packet_quantity || 1),
    0
  );

  return (
    <main className="shipping-admin-page">
      <nav className="journey-nav">
        <Link href="/lead-ambassador-shipping">← Public confirmation form</Link>
        <span>Signed in as {admin.user.email}</span>
      </nav>

      <header className="shipping-admin-header">
        <div>
          <p className="kicker">PRIVATE REACH OPERATIONS</p>
          <h1>Packet confirmation dashboard</h1>
          <p>Every form submission appears here. Red review flags should be resolved before printing Shopify labels.</p>
        </div>
        <a className="button primary" href="/api/admin/lead-ambassador-shipping/export">Download CSV</a>
      </header>

      <section className="shipping-admin-stats" aria-label="Confirmation summary">
        <article><strong>{rows.length}</strong><span>Total submissions</span></article>
        <article><strong>{ready.length}</strong><span>Ready to ship</span></article>
        <article className={flagged.length ? "warning" : ""}><strong>{flagged.length}</strong><span>Needs review</span></article>
        <article><strong>{addressUpdates.length}</strong><span>Address updates</span></article>
        <article><strong>{bulkBoxes.length}</strong><span>Bulk campus boxes</span></article>
        <article><strong>{packetTotal}</strong><span>Estimated packets</span></article>
      </section>

      {databaseError && <p className="shipping-admin-error">Database issue: {databaseError}</p>}

      <section className="shipping-admin-table-shell">
        <div className="shipping-admin-table-heading">
          <div>
            <h2>All ambassador responses</h2>
            <p>Newest or updated confirmations appear first.</p>
          </div>
          <span>Private data · Do not share this page</span>
        </div>

        {rows.length === 0 ? (
          <div className="shipping-admin-empty">
            <strong>No form confirmations yet.</strong>
            <p>The dashboard is working and will populate as Lead Ambassadors submit.</p>
          </div>
        ) : (
          <div className="shipping-admin-table-scroll">
            <table className="shipping-admin-table">
              <thead>
                <tr>
                  <th>Review</th><th>Ambassador</th><th>Campus</th><th>Status</th>
                  <th>Shipment</th><th>Label instruction</th><th>Contact</th><th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const issues = submissionIssues(row);
                  return (
                    <tr key={row.id} className={issues.length ? "has-issue" : "is-ready"}>
                      <td>
                        {issues.length ? (
                          <ul>{issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
                        ) : row.shipping_action === "no-packet" ? (
                          <span className="admin-badge neutral">No shipment</span>
                        ) : (
                          <span className="admin-badge ready">Ready</span>
                        )}
                      </td>
                      <td><strong>{row.full_name}</strong><small>{row.email}</small></td>
                      <td>{row.school}</td>
                      <td>{label(row.lead_status)}</td>
                      <td><strong>{label(row.shipment_type)}</strong><small>{row.packet_quantity ? `${row.packet_quantity} packets` : "1 packet"}</small><small>Shirt: {row.shirt_interest || "Not answered"}{row.shirt_size ? ` · ${row.shirt_size}` : ""}</small></td>
                      <td>{formatShippingAddress(row)}{row.delivery_notes && <small>Note: {row.delivery_notes}</small>}</td>
                      <td>{row.phone || "—"}</td>
                      <td>{new Date(row.updated_at).toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" })} ET</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
