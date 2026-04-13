const serif = "var(--font-cormorant), 'Cormorant Garamond', serif";
const sans = "var(--font-inter), 'Inter', sans-serif";

export default function ShortlistedPrivacyPage() {
  return (
    <main style={{ background: "#f4f1eb", minHeight: "100vh", fontFamily: sans }}>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(160deg, #0d2244 0%, #163461 40%, #1e4080 70%, #0d2244 100%)",
        paddingBottom: "48px",
      }}>
        {/* Nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 40px" }}>
          <a href="/shortlisted" style={{ fontFamily: serif, fontSize: "22px", color: "#fff", fontWeight: 600, textDecoration: "none" }}>
            Shortlisted
          </a>
        </div>
        {/* H1 */}
        <h1 style={{
          fontFamily: serif,
          fontSize: "40px",
          fontWeight: 600,
          color: "#fff",
          textAlign: "center",
          padding: "40px 40px 0",
          margin: 0,
        }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "8px" }}>
          Last updated: April 2025
        </p>
      </div>

      {/* Fade */}
      <div style={{ height: "60px", marginTop: "-60px", background: "linear-gradient(to bottom, transparent, #f4f1eb)", position: "relative", zIndex: 1 }} />

      {/* Content */}
      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          border: "1px solid #e8e3db",
          boxShadow: "0 4px 40px rgba(13,34,68,0.12)",
          padding: "40px",
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>1. Who we are</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                Shortlisted is a service operated by GradeStack. If you have any questions about
                this policy, contact us at{" "}
                <a href="mailto:results@gradestack.co.uk" style={{ color: "#0d2244", textDecoration: "underline" }}>
                  results@gradestack.co.uk
                </a>.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>2. Data we collect</h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", margin: 0, fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                <li><strong style={{ color: "#1a1a1a" }}>Email address</strong> — provided by you on the submission form, used to deliver your results.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Personal statement</strong> — the text you submit for analysis.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Marketing preference</strong> — whether you opted in to receive tips and updates.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Payment data</strong> — processed directly by Stripe; we never see or store card details.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>3. How we use your data</h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", margin: 0, fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                <li>To run the AI analysis of your personal statement and return scored feedback.</li>
                <li>To email you your results after purchase.</li>
                <li>If you opted in, to send you occasional tips on improving your personal statement.</li>
              </ul>
              <p style={{ marginTop: "12px", fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                We do not sell or share your personal statement or email address with third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>4. Storage and retention</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                Your email address and personal statement are stored in Upstash Redis with a 48-hour TTL.
                After 48 hours the data is automatically and permanently deleted. If you opted in to
                marketing emails, your email address is retained in our mailing list until you unsubscribe.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>5. Third-party processors</h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", margin: 0, fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                <li><strong style={{ color: "#1a1a1a" }}>Anthropic</strong> — your personal statement is sent to the Claude API to generate the analysis. Anthropic&apos;s API data is not used to train models.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Stripe</strong> — handles payment processing. Subject to Stripe&apos;s own Privacy Policy.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Resend</strong> — used to send results emails and (where opted in) marketing emails.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Upstash</strong> — provides the Redis database used for temporary session storage.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Vercel</strong> — hosts the application. Vercel may log request metadata per its own Privacy Policy.</li>
              </ul>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>6. Your rights (UK GDPR)</h2>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>Under UK GDPR you have the right to:</p>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", margin: 0, fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                <li><strong style={{ color: "#1a1a1a" }}>Access</strong> the personal data we hold about you.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Erasure</strong> — request deletion of your data at any time.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Rectification</strong> — correct any inaccurate data.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Object</strong> to processing for direct marketing.</li>
                <li><strong style={{ color: "#1a1a1a" }}>Withdraw consent</strong> — unsubscribe from marketing emails at any time via the unsubscribe link in any email we send.</li>
              </ul>
              <p style={{ marginTop: "12px", fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                To exercise any of these rights, email{" "}
                <a href="mailto:results@gradestack.co.uk" style={{ color: "#0d2244", textDecoration: "underline" }}>
                  results@gradestack.co.uk
                </a>.
                {" "}Note that because session data is deleted automatically after 48 hours, we may not be able
                to locate data submitted before that window.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>7. Cookies</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                Shortlisted does not use cookies or tracking pixels. No cookie consent banner is required.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>8. Changes to this policy</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                We may update this policy from time to time. The date at the top of this page will reflect
                the most recent revision.
              </p>
            </section>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "20px" }}>
        <p style={{ margin: 0 }}>
          <a href="/shortlisted/privacy" style={{ fontSize: "11px", color: "#c0b8ae", textDecoration: "none", margin: "0 8px" }}>Privacy Policy</a>
          <a href="/shortlisted/terms" style={{ fontSize: "11px", color: "#c0b8ae", textDecoration: "none", margin: "0 8px" }}>Terms &amp; Conditions</a>
          <span style={{ fontSize: "11px", color: "#c0b8ae", margin: "0 8px" }}>&copy; 2026 Shortlisted</span>
        </p>
      </footer>
    </main>
  );
}
