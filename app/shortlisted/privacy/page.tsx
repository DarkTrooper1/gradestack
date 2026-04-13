const S = "var(--font-instrument-serif)";
const N = "var(--font-instrument-sans), system-ui, sans-serif";

export default function ShortlistedPrivacyPage() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", fontFamily: N }}>

      {/* Nav */}
      <header style={{
        background: "rgba(13,31,60,0.8)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <a href="/shortlisted" style={{ fontFamily: S, fontSize: "20px", color: "#ffffff", textDecoration: "none" }}>
            Shortlisted
          </a>
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, maxWidth: "720px", margin: "0 auto", width: "100%", padding: "48px 24px" }}>
        <div style={{
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: "12px",
          padding: "40px",
        }}>
          <h1 style={{ fontFamily: S, fontSize: "32px", fontWeight: 400, color: "#ffffff", marginBottom: "4px" }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", marginBottom: "40px" }}>
            Last updated: April 2025
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "32px", fontSize: "14px", color: "rgba(255,255,255,0.6)", lineHeight: 1.75 }}>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>1. Who we are</h2>
              <p>
                Shortlisted is a service operated by GradeStack. If you have any questions about
                this policy, contact us at{" "}
                <a href="mailto:results@gradestack.co.uk" className="sl-content-link">
                  results@gradestack.co.uk
                </a>.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>2. Data we collect</h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Email address</strong> — provided by you on the submission form, used to deliver your results.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Personal statement</strong> — the text you submit for analysis.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Marketing preference</strong> — whether you opted in to receive tips and updates.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Payment data</strong> — processed directly by Stripe; we never see or store card details.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>3. How we use your data</h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>To run the AI analysis of your personal statement and return scored feedback.</li>
                <li>To email you your results after purchase.</li>
                <li>If you opted in, to send you occasional tips on improving your personal statement.</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                We do not sell or share your personal statement or email address with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>4. Storage and retention</h2>
              <p>
                Your email address and personal statement are stored in Upstash Redis with a 48-hour TTL.
                After 48 hours the data is automatically and permanently deleted. If you opted in to
                marketing emails, your email address is retained in our mailing list until you unsubscribe.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>5. Third-party processors</h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Anthropic</strong> — your personal statement is sent to the Claude API to generate the analysis. Anthropic&apos;s API data is not used to train models.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Stripe</strong> — handles payment processing. Subject to Stripe&apos;s own Privacy Policy.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Resend</strong> — used to send results emails and (where opted in) marketing emails.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Upstash</strong> — provides the Redis database used for temporary session storage.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Vercel</strong> — hosts the application. Vercel may log request metadata per its own Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>6. Your rights (UK GDPR)</h2>
              <p style={{ marginBottom: "12px" }}>Under UK GDPR you have the right to:</p>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Access</strong> the personal data we hold about you.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Erasure</strong> — request deletion of your data at any time.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Rectification</strong> — correct any inaccurate data.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Object</strong> to processing for direct marketing.</li>
                <li><strong style={{ color: "rgba(255,255,255,0.85)" }}>Withdraw consent</strong> — unsubscribe from marketing emails at any time via the unsubscribe link in any email we send.</li>
              </ul>
              <p style={{ marginTop: "12px" }}>
                To exercise any of these rights, email{" "}
                <a href="mailto:results@gradestack.co.uk" className="sl-content-link">
                  results@gradestack.co.uk
                </a>.
                {" "}Note that because session data is deleted automatically after 48 hours, we may not be able
                to locate data submitted before that window.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>7. Cookies</h2>
              <p>
                Shortlisted does not use cookies or tracking pixels. No cookie consent banner is required.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff", marginBottom: "12px" }}>8. Changes to this policy</h2>
              <p>
                We may update this policy from time to time. The date at the top of this page will reflect
                the most recent revision.
              </p>
            </section>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "20px 24px", textAlign: "center" }}>
        <p style={{ fontSize: "12px" }}>
          <a href="/shortlisted/privacy" className="sl-footer-link">Privacy Policy</a>
          {" · "}
          <a href="/shortlisted/terms" className="sl-footer-link">Terms &amp; Conditions</a>
          {" · "}
          <span style={{ color: "rgba(255,255,255,0.25)" }}>&copy; 2026 Shortlisted</span>
        </p>
      </footer>
    </main>
  );
}
