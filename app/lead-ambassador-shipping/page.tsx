import Link from "next/link";
import ShippingConfirmationForm from "./ShippingConfirmationForm";

export const metadata = {
  title: "Confirm Your REACH Packet | Esther Funds Foundation",
  description:
    "REACH Lead Ambassadors can confirm their role, campus, Shopify shipping address, and packet needs for weekend fulfillment.",
};

export default function LeadAmbassadorShippingPage() {
  return (
    <main className="lead-shipping-page">
      <nav className="journey-nav">
        <Link href="/reach-your-campus">← REACH Your Campus</Link>
        <Link className="portal-link" href="/">REACH Action Hub</Link>
      </nav>

      <section className="lead-shipping-hero">
        <div>
          <p className="kicker">REACH LEAD AMBASSADORS · ACTION REQUIRED</p>
          <h1>
            Confirm your packet.
            <br />
            <em>Lead your campus.</em>
          </h1>
          <p>
            We’re preparing encouragement packets for weekend shipping. Confirm
            your Lead Ambassador status, school, and newest Shopify address so
            your label is printed correctly.
          </p>
        </div>
        <aside>
          <span>📦</span>
          <strong>Confirm by Thursday, August 20</strong>
          <p>Labels are being prepared now for weekend shipping.</p>
        </aside>
      </section>

      <section className="lead-shipping-impact">
        <div>
          <p className="kicker">THE DONATION IS IN ACTION</p>
          <h2>About $2,400 is going directly to REACH.</h2>
        </div>
        <p>
          This support is helping Esther Funds Foundation prepare program
          materials and encouragement packets for campuses. Accurate
          confirmations help every donated dollar move with purpose.
        </p>
      </section>

      <section className="lead-shipping-steps" aria-label="Shipping confirmation steps">
        <div><b>1</b><span><strong>Find your newest order</strong>Use the address on your most recent $0 REACH Shopify order.</span></div>
        <div><b>2</b><span><strong>Confirm or correct it</strong>Only enter a new address if the Shopify address is outdated.</span></div>
        <div><b>3</b><span><strong>We prepare the label</strong>EFF reviews your response before printing in Shopify.</span></div>
      </section>

      <section className="lead-shipping-form-shell" id="confirm">
        <header>
          <p className="kicker">ONE CONFIRMATION PER LEAD</p>
          <h2>Ready for the label table.</h2>
          <p>
            Use the same email you used for REACH or Shopify whenever possible.
            Submitting again updates your prior confirmation.
          </p>
        </header>
        <ShippingConfirmationForm />
      </section>

      <footer className="workshop-request-footer">
        <div><strong>Esther Funds Foundation</strong><span>REACH · Every Future Fulfilled.</span></div>
        <a href="mailto:reach@estherfundsinc.org">Questions? Email the REACH team</a>
      </footer>
    </main>
  );
}
