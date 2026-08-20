"use client";

import { FormEvent, useState } from "react";

type FormState = "idle" | "sending" | "success" | "error";

export default function ShippingConfirmationForm() {
  const [shippingAction, setShippingAction] = useState("shopify-correct");
  const [shipmentType, setShipmentType] = useState("individual");
  const [shirtInterest, setShirtInterest] = useState("not-sure");
  const [status, setStatus] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/lead-ambassador-shipping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = (await response.json()) as { error?: string; reference?: string };

      if (!response.ok) {
        throw new Error(result.error || "Please check the form and try again.");
      }

      setStatus("success");
      setMessage(`Confirmation received. Your reference is ${result.reference}.`);
      form.reset();
      setShippingAction("shopify-correct");
      setShipmentType("individual");
      setShirtInterest("not-sure");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  if (status === "success") {
    return (
      <section className="shipping-success" aria-live="polite">
        <span>✓</span>
        <p className="kicker">YOU’RE ON THE SHIPPING LIST</p>
        <h2>Thank you, Lead Ambassador!</h2>
        <p>{message}</p>
        <p>
          The REACH team will use this confirmation to prepare your Shopify
          label. Save your reference until your packet arrives.
        </p>
        <button className="button primary" onClick={() => setStatus("idle")}>
          Submit another campus lead
        </button>
      </section>
    );
  }

  return (
    <form className="shipping-confirmation-form" onSubmit={submit}>
      <fieldset>
        <legend>1. Identify your campus</legend>
        <div className="shipping-field-grid">
          <label>
            <span>Full name</span>
            <input name="fullName" autoComplete="name" required />
          </label>
          <label>
            <span>Best email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
        </div>
        <label>
          <span>College or university</span>
          <input name="school" autoComplete="organization" required />
        </label>
        <label>
          <span>Your current REACH status</span>
          <select name="leadStatus" required defaultValue="">
            <option value="" disabled>Select one</option>
            <option value="confirmed-lead">I am a confirmed Lead Ambassador</option>
            <option value="new-lead">I joined as a new Lead Ambassador after the July list</option>
            <option value="needs-review">I am in the group chat, but need my role reviewed</option>
            <option value="no-longer-serving">I am no longer serving as Lead Ambassador</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>2. Confirm the Shopify label</legend>
        <div className="shipping-choice-grid">
          <label className={shippingAction === "shopify-correct" ? "chosen" : ""}>
            <input
              type="radio"
              name="shippingAction"
              value="shopify-correct"
              checked={shippingAction === "shopify-correct"}
              onChange={(event) => setShippingAction(event.target.value)}
            />
            <strong>Use my current Shopify address</strong>
            <span>The address on my newest $0 REACH order is correct.</span>
          </label>
          <label className={shippingAction === "update-address" ? "chosen" : ""}>
            <input
              type="radio"
              name="shippingAction"
              value="update-address"
              checked={shippingAction === "update-address"}
              onChange={(event) => setShippingAction(event.target.value)}
            />
            <strong>Update my shipping address</strong>
            <span>I need EFF to use the address I enter below.</span>
          </label>
          <label className={shippingAction === "no-packet" ? "chosen" : ""}>
            <input
              type="radio"
              name="shippingAction"
              value="no-packet"
              checked={shippingAction === "no-packet"}
              onChange={(event) => setShippingAction(event.target.value)}
            />
            <strong>Do not ship a packet</strong>
            <span>I cannot receive a packet or I am no longer serving.</span>
          </label>
        </div>

        {shippingAction === "update-address" && (
          <div className="shipping-address-box">
            <div className="shipping-field-grid">
              <label>
                <span>Name on label</span>
                <input name="labelName" autoComplete="name" required />
              </label>
              <label>
                <span>Campus, dorm, or organization (optional)</span>
                <input name="organization" autoComplete="organization" />
              </label>
            </div>
            <label>
              <span>Street address or P.O. box</span>
              <input name="address1" autoComplete="address-line1" required />
            </label>
            <label>
              <span>Apartment, suite, dorm, or room (optional)</span>
              <input name="address2" autoComplete="address-line2" />
            </label>
            <div className="shipping-city-grid">
              <label>
                <span>City</span>
                <input name="city" autoComplete="address-level2" required />
              </label>
              <label>
                <span>State</span>
                <input name="state" autoComplete="address-level1" required />
              </label>
              <label>
                <span>ZIP code</span>
                <input name="postalCode" autoComplete="postal-code" required />
              </label>
            </div>
            <input type="hidden" name="country" value="United States" />
          </div>
        )}

        <div className="shipping-field-grid">
          <label>
            <span>Best phone number for delivery questions (optional)</span>
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            <span>Delivery notes (optional)</span>
            <input name="deliveryNotes" placeholder="Mailroom, dorm desk, gate, etc." />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>3. Confirm what your campus needs</legend>
        <label>
          <span>Shipment type</span>
          <select
            name="shipmentType"
            value={shipmentType}
            onChange={(event) => setShipmentType(event.target.value)}
          >
            <option value="individual">One Lead Ambassador packet</option>
            <option value="bulk-campus">A bulk campus box</option>
            <option value="unsure">I am not sure — please review</option>
          </select>
        </label>
        {shipmentType === "bulk-campus" && (
          <label>
            <span>How many student packets does your campus expect?</span>
            <input name="packetQuantity" type="number" min="1" max="200" required />
          </label>
        )}
        <div className="shipping-field-grid">
          <label>
            <span>Interested in REACH shirts?</span>
            <select
              name="shirtInterest"
              value={shirtInterest}
              onChange={(event) => setShirtInterest(event.target.value)}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="not-sure">Not sure yet</option>
            </select>
          </label>
          {shirtInterest === "yes" && (
            <label>
              <span>Preferred size(s)</span>
              <input name="shirtSize" placeholder="Example: Adult M" required />
            </label>
          )}
        </div>
      </fieldset>

      <label className="shipping-consent">
        <input type="checkbox" name="consent" value="yes" required />
        <span>
          I confirm this information is accurate and may be used by Esther Funds
          Foundation to prepare and deliver REACH materials.
        </span>
      </label>

      {message && status === "error" && (
        <p className="shipping-form-error" role="alert">{message}</p>
      )}

      <button className="shipping-submit" disabled={status === "sending"}>
        {status === "sending" ? "Saving confirmation…" : "Confirm my REACH shipment"}
      </button>
      <p className="shipping-privacy-note">
        Do not enter passwords, Social Security numbers, student IDs, payment
        information, or private medical information.
      </p>
    </form>
  );
}
