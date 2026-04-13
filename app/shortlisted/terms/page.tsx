const serif = "var(--font-cormorant), 'Cormorant Garamond', serif";
const sans = "var(--font-inter), 'Inter', sans-serif";

export default function ShortlistedTermsPage() {
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
          Terms &amp; Conditions
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
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>1. About this service</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                Shortlisted is an AI-powered UCAS personal statement review tool operated by GradeStack.
                It provides automated, AI-generated feedback on personal statements submitted by users.
                The service is not affiliated with UCAS or any UK university.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>2. Pricing</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                A free summary of your first criterion is provided at no charge. Full analysis — covering
                all five criteria, paragraph-by-paragraph annotations, and rewrite suggestions — is
                available for a one-time payment of <strong style={{ color: "#1a1a1a" }}>£4.99</strong> (including VAT where applicable).
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>3. No refund policy</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                Because Shortlisted delivers digital content that is made available immediately upon
                payment, you lose your statutory right to cancel under the Consumer Contracts Regulations
                2013 once the analysis has been delivered to you. By completing payment you confirm you
                consent to immediate delivery and acknowledge that the right of withdrawal does not apply.
              </p>
              <p style={{ marginTop: "12px", fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                This does not affect your rights under the Consumer Rights Act 2015 if the service is
                faulty or not as described. If you believe your analysis was not delivered or was
                materially defective, contact us at{" "}
                <a href="mailto:results@gradestack.co.uk" style={{ color: "#0d2244", textDecoration: "underline" }}>
                  results@gradestack.co.uk
                </a>{" "}
                within 7 days and we will investigate.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>4. Data retention</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                Your personal statement and analysis results are stored for 48 hours from the time of
                submission, after which they are automatically and permanently deleted. We strongly
                recommend saving or downloading your results before the 48-hour window expires. We are
                unable to recover results after deletion.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>5. Nature of the analysis</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                The feedback provided by Shortlisted is generated by an AI model and is intended as a
                study aid only. It does not constitute professional admissions advice and does not
                guarantee admission to any university. GradeStack accepts no responsibility for
                decisions made in reliance on the analysis.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>6. Acceptable use</h2>
              <p style={{ marginBottom: "12px", fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>You agree not to:</p>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", margin: 0, fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                <li>Submit content that is defamatory, unlawful, or harmful.</li>
                <li>Attempt to reverse-engineer, scrape, or abuse the service.</li>
                <li>Use automated tools to submit statements in bulk.</li>
              </ul>
              <p style={{ marginTop: "12px", fontSize: "14px", color: "#4a4540", lineHeight: 1.8 }}>
                We reserve the right to suspend access to users who breach these terms without notice
                or refund.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>7. Limitation of liability</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                To the fullest extent permitted by law, GradeStack&apos;s total liability to you in
                connection with Shortlisted shall not exceed the amount you paid for the analysis
                (£4.99). We are not liable for any indirect, consequential, or special losses,
                including loss of university place or opportunity.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>8. Governing law</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                These terms are governed by the laws of England and Wales. Any disputes shall be
                subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            <section>
              <h2 style={{ fontSize: "15px", fontWeight: 500, color: "#0d2244", marginBottom: "10px" }}>9. Contact</h2>
              <p style={{ fontSize: "14px", color: "#4a4540", lineHeight: 1.8, margin: 0 }}>
                For any queries regarding these terms, contact us at{" "}
                <a href="mailto:results@gradestack.co.uk" style={{ color: "#0d2244", textDecoration: "underline" }}>
                  results@gradestack.co.uk
                </a>.
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
