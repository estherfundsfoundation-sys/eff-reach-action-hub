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

  /* The intake logic is retained below so it can be reopened for a future round. */
  let body: Submission;

  try {
    body = (await request.json()) as Submission;
  } catch {
    return Response.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  const fullName = clean(body.fullName, 120);
  const email = clean(body.email, 180).toLowerCase();
  const school = clean(body.school, 180);
  const leadStatus = clean(body.leadStatus, 40);
  const shippingAction = clean(body.shippingAction, 40);
  const shipmentType = clean(body.shipmentType, 40);
  const address1 = nullable(body.address1, 180);
  const city = nullable(body.city, 100);
  const state = nullable(body.state, 80);
  const postalCode = nullable(body.postalCode, 20);
  const shirtInterest = clean(body.shirtInterest, 30);
  const shirtSize = nullable(body.shirtSize, 80);
  const consent = clean(body.consent, 10);
  const packetQuantityRaw = Number(body.packetQuantity);
  const packetQuantity = Number.isFinite(packetQuantityRaw)
    ? Math.max(1, Math.min(200, Math.round(packetQuantityRaw)))
    : null;

  if (!fullName || !isEmail(email) || !school) {
    return Response.json(
      { error: "Your full name, email, and school are required." },
      { status: 400 }
    );
  }

  if (
    !allowedLeadStatuses.has(leadStatus) ||
    !allowedShippingActions.has(shippingAction) ||
    !allowedShipmentTypes.has(shipmentType)
  ) {
    return Response.json({ error: "Please complete every required selection." }, { status: 400 });
  }

  if (
    shippingAction === "update-address" &&
    (!address1 || !city || !state || !postalCode)
  ) {
    return Response.json(
      { error: "Please enter the complete address that should appear on the label." },
      { status: 400 }
    );
  }

  if (shipmentType === "bulk-campus" && !packetQuantity) {
    return Response.json(
      { error: "Please enter how many student packets your campus expects." },
      { status: 400 }
    );
  }

  if (shirtInterest === "yes" && !shirtSize) {
    return Response.json(
      { error: "Please enter your preferred shirt size." },
      { status: 400 }
    );
  }

  if (leadStatus === "no-longer-serving" && shippingAction !== "no-packet") {
    return Response.json(
      { error: "If you are no longer serving, please select ‘Do not ship a packet.’" },
      { status: 400 }
    );
  }

  if (consent !== "yes") {
    return Response.json(
      { error: "Please confirm that the information is accurate." },
      { status: 400 }
    );
  }

  if (body.dryRun === true) {
    return Response.json({ ok: true, dryRun: true });
  }

  const { env } = await import("cloudflare:workers");
  if (!env.DB) {
    return Response.json(
      { error: "Confirmations are temporarily unavailable. Please try again shortly." },
      { status: 503 }
    );
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await env.DB.prepare(`
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
  `).run();

  await env.DB.prepare(`
    CREATE INDEX IF NOT EXISTS idx_lead_shipping_confirmed_at
    ON lead_ambassador_shipping_confirmations (confirmed_at)
  `).run();

  await env.DB.prepare(`
    INSERT INTO lead_ambassador_shipping_confirmations (
      id, full_name, email, school, lead_status, shipping_action,
      label_name, organization, address_1, address_2, city, state,
      postal_code, country, phone, delivery_notes, shipment_type,
      packet_quantity, shirt_interest, shirt_size, confirmed_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
    ON CONFLICT(email) DO UPDATE SET
      full_name = excluded.full_name,
      school = excluded.school,
      lead_status = excluded.lead_status,
      shipping_action = excluded.shipping_action,
      label_name = excluded.label_name,
      organization = excluded.organization,
      address_1 = excluded.address_1,
      address_2 = excluded.address_2,
      city = excluded.city,
      state = excluded.state,
      postal_code = excluded.postal_code,
      country = excluded.country,
      phone = excluded.phone,
      delivery_notes = excluded.delivery_notes,
      shipment_type = excluded.shipment_type,
      packet_quantity = excluded.packet_quantity,
      shirt_interest = excluded.shirt_interest,
      shirt_size = excluded.shirt_size,
      confirmed_at = excluded.confirmed_at,
      updated_at = excluded.updated_at
  `)
    .bind(
      id,
      fullName,
      email,
      school,
      leadStatus,
      shippingAction,
      nullable(body.labelName, 120),
      nullable(body.organization, 140),
      address1,
      nullable(body.address2, 140),
      city,
      state,
      postalCode,
      clean(body.country, 80) || "United States",
      nullable(body.phone, 40),
      nullable(body.deliveryNotes, 600),
      shipmentType,
      packetQuantity,
      shirtInterest || null,
      shirtSize,
      now,
      now
    )
    .run();

  return Response.json({ ok: true, reference: id.slice(0, 8).toUpperCase() });
}
