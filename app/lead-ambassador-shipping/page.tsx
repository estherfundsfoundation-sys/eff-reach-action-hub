import Link from "next/link";

export const metadata = {
  title: "REACH Packet Confirmations Closed | Esther Funds Foundation",
  description:
    "REACH Lead Ambassador packet confirmations are now closed while Esther Funds Foundation prepares the current shipment.",
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
          <p className="kicker">REACH LEAD AMBASSADORS · CONFIRMATIONS CLOSED</p>
          <h1>
            Current responses are in.
            <br />
            <em>Lead your campus.</em>
          </h1>
          <p>
            The confirmation period has ended while the Esther Funds Foundation
            team reviews the current orders and prepares shipping labels.
          </p>
        </div>
        <aside>
          <span>📦</span>
          <strong>Submissions are now closed</strong>
          <p>Previously submitted confirmations remain safely on file.</p>
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

      <section className="lead-shipping-form-shell" id="confirm">
        <header>
          <p className="kicker">CURRENT SHIPPING ROUND</p>
          <h2>We are preparing the confirmed orders.</h2>
          <p>
            No additional confirmations are being accepted for this round. If
            you already submitted, no further action is needed. For an urgent
            correction, email the REACH team directly.
          </p>
        </header>
        <a className="button primary" href="mailto:reach@estherfundsinc.org?subject=Urgent%20REACH%20shipping%20correction">
          Email an urgent correction
        </a>
      </section>

      <footer className="workshop-request-footer">
        <div><strong>Esther Funds Foundation</strong><span>REACH · Every Future Fulfilled.</span></div>
        <a href="mailto:reach@estherfundsinc.org">Questions? Email the REACH team</a>
      </footer>
    </main>
  );
}
