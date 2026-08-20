import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leadAmbassadorShippingConfirmations = sqliteTable(
  "lead_ambassador_shipping_confirmations",
  {
    id: text("id").primaryKey(),
    fullName: text("full_name").notNull(),
    email: text("email").notNull().unique(),
    school: text("school").notNull(),
    leadStatus: text("lead_status").notNull(),
    shippingAction: text("shipping_action").notNull(),
    labelName: text("label_name"),
    organization: text("organization"),
    address1: text("address_1"),
    address2: text("address_2"),
    city: text("city"),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country").default("United States"),
    phone: text("phone"),
    deliveryNotes: text("delivery_notes"),
    shipmentType: text("shipment_type").notNull(),
    packetQuantity: integer("packet_quantity"),
    shirtInterest: text("shirt_interest"),
    shirtSize: text("shirt_size"),
    confirmedAt: text("confirmed_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  }
);
