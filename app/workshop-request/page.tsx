import Link from "next/link";

export const metadata = {
  title: "REACH Workshop & Pizza Support Request | Esther Funds Foundation",
  description:
    "REACH Ambassadors can submit campus workshop plans, request pizza support, and share interest in REACH shirts.",
};

const FORM_URL = "https://form.jotform.com/262293112402041";

export default function WorkshopRequestPage() {
  return (
    <main className="workshop-request-page">
      <nav className="journey-nav">
        <Link href="/reach-your-campus">← REACH Your Campus</Link>
        <Link className="portal-link" href="/">
          REACH Action Hub
        </Link>
      </nav>

      <section className="workshop-request-hero">
        <div>
          <p className="kicker">REACH AMBASSADOR ACTION FORM</p>
          <h1>
            Plan the workshop.
            <br />
            <em>We’ll plan the support.</em>
          </h1>
          <p>
            Tell Esther Funds Foundation about your campus workshop, expected
            attendance, pizza request, and REACH shirt interest. Submit as early
            as possible so the team has time to review your plan.
          </p>
        </div>
        <aside aria-label="Pizza planning rule">
          <span>🍕</span>
          <strong>1 large pizza for every 4 students</strong>
          <p>
            The form calculates a planning estimate. Final quantities and
            support are confirmed by EFF.
          </p>
        </aside>
      </section>

      <section className="workshop-request-notes" aria-label="Before you submit">
        <div>
          <b>1</b>
          <span>
            <strong>Know your plan</strong>
            Have your date, location, workshop idea, and expected attendance.
          </span>
        </div>
        <div>
          <b>2</b>
          <span>
            <strong>Request support</strong>
            Tell us whether you need pizza and whether your team wants shirts.
          </span>
        </div>
        <div>
          <b>3</b>
          <span>
            <strong>Watch your email</strong>
            A request is not approved until EFF sends confirmation.
          </span>
        </div>
      </section>

      <section className="workshop-form-shell" id="request-form">
        <header>
          <p className="kicker">START YOUR REQUEST</p>
          <h2>Bring REACH to your campus.</h2>
          <p>
            Do not include passwords, Social Security numbers, student IDs,
            payment information, or private medical records.
          </p>
        </header>
        <iframe
          className="workshop-form-frame"
          src={FORM_URL}
          title="REACH Campus Workshop and Pizza Support Request"
          loading="eager"
          allow="geolocation; microphone; camera; fullscreen; payment"
        />
        <p className="workshop-form-fallback">
          If the form does not appear, open it directly at{" "}
          <a href={FORM_URL} target="_blank" rel="noreferrer">
            the REACH Workshop Request form
          </a>
          .
        </p>
      </section>

      <footer className="workshop-request-footer">
        <div>
          <strong>Esther Funds Foundation</strong>
          <span>Every Future Fulfilled.</span>
        </div>
        <a href="mailto:nationals@estherfundsinc.org">Questions? Email the REACH team</a>
      </footer>
    </main>
  );
}
