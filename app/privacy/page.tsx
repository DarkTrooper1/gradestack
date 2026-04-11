export default function PrivacyPolicy() {
  return (
    <>
      <style>{`
        .legal-page { background: #f5f3ee; min-height: 100vh; }
        .legal-nav { border-bottom: 1px solid #e8e6e0; background: #f5f3ee; padding: 16px; }
        .legal-nav-inner { max-width: 680px; margin: 0 auto; display: flex; align-items: center; gap: 10px; }
        .legal-content { max-width: 680px; margin: 0 auto; padding: 48px 16px 80px; }
        .legal-content h1 { font-size: 32px; font-weight: 800; color: #1a1a2e; letter-spacing: -0.03em; margin-bottom: 8px; }
        .legal-content .updated { font-size: 13px; color: #9b99b0; margin-bottom: 40px; }
        .legal-content p { font-size: 15px; color: #3d3d50; line-height: 1.7; margin-bottom: 16px; }
        .legal-content h2 { font-size: 18px; font-weight: 700; color: #1a1a2e; margin-top: 40px; margin-bottom: 12px; }
        .legal-content ul { margin: 0 0 16px 0; padding-left: 24px; }
        .legal-content ul li { font-size: 15px; color: #3d3d50; line-height: 1.7; margin-bottom: 6px; }
        .legal-content a { color: #002FA7; text-decoration: none; }
        .legal-content a:hover { text-decoration: underline; }
        .legal-content table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 14px; }
        .legal-content th { text-align: left; padding: 10px 12px; background: #f5f3ee; border: 1px solid #e8e6e0; font-weight: 600; color: #1a1a2e; }
        .legal-content td { padding: 10px 12px; border: 1px solid #e8e6e0; color: #3d3d50; vertical-align: top; }
        .legal-content .intro-box { background: #ffffff; border: 1px solid #e8e6e0; border-radius: 14px; padding: 20px 24px; margin-bottom: 32px; }
      `}</style>

      <nav className="legal-nav">
        <div className="legal-nav-inner">
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{ background: "#002FA7", borderRadius: "7px", width: 28, height: 28, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 64 64" width="18" height="18" fill="none">
                <path d="M12 50 L32 14 L52 50" stroke="white" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span style={{ color: "#1a1a2e", fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", fontFamily: "'Churchward Roundsquare', sans-serif" }}>
              Gradestack
            </span>
          </a>
        </div>
      </nav>

      <div className="legal-page">
        <div className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="updated">Last updated: April 2026</p>

          <div className="intro-box">
            <p style={{ marginBottom: 0 }}>
              This Privacy Policy explains how Gradestack (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;), operated by Dimitri Ben Aris, collects, uses, and protects your personal data when you use gradestack.co.uk (&ldquo;the Site&rdquo;). We are committed to handling your data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            </p>
            <p style={{ marginBottom: 0, marginTop: 12 }}>
              If you have any questions, contact us at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a>.
            </p>
          </div>

          <h2>1. Who We Are</h2>
          <p>
            Gradestack is operated by Dimitri Ben Aris, an individual based in the United Kingdom. We are the data controller for personal data collected through this Site.
          </p>

          <h2>2. What Data We Collect</h2>
          <p><strong>a) Email address</strong></p>
          <p>
            If you choose to enter your email address on the Site to receive AI-generated tips and quick wins, we collect and store your email address. This is voluntary — you can use the core calculator without providing it.
          </p>
          <p><strong>b) Payment information</strong></p>
          <p>
            If you purchase the paid tier (£2.99), your payment is processed by Stripe, Inc. We do not receive, store, or process your card details. Stripe acts as a data processor on our behalf and handles all payment data securely. Please refer to <a href="https://stripe.com/gb/privacy" target="_blank" rel="noreferrer">Stripe&apos;s Privacy Policy</a> for details on how they handle your data.
          </p>
          <p><strong>c) Usage and analytics data</strong></p>
          <p>
            We use Vercel Analytics to understand how visitors use the Site. This tool is privacy-friendly and does not use cookies or collect personally identifiable information. Data collected includes page views, referrers, and general geographic region (country level). This data cannot be used to identify you.
          </p>

          <h2>3. How We Use Your Data</h2>
          <p>We use your email address for the following purposes:</p>
          <ul>
            <li>To send you the AI-generated UCAS tips and quick wins you requested</li>
            <li>To send occasional updates or relevant information about Gradestack, where you have consented to receive these</li>
          </ul>
          <p>We use payment data (via Stripe) solely to process your purchase and manage transactions.</p>
          <p>We use analytics data to improve the Site and understand usage patterns.</p>

          <h2>4. Legal Basis for Processing</h2>
          <p>Under UK GDPR, we process your personal data on the following legal bases:</p>
          <ul>
            <li><strong>Consent</strong> — for collecting your email address and sending you tips and updates. You can withdraw consent at any time by clicking &ldquo;unsubscribe&rdquo; in any email we send, or by contacting us directly.</li>
            <li><strong>Contract</strong> — for processing your payment when you purchase the paid tier.</li>
            <li><strong>Legitimate interests</strong> — for analysing aggregated, anonymised usage data to improve the Site.</li>
          </ul>

          <h2>5. Third Parties We Share Data With</h2>
          <p>We share data with the following third-party services:</p>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Purpose</th>
                <th>Privacy Policy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Resend</td>
                <td>Email delivery</td>
                <td><a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noreferrer">resend.com/legal/privacy-policy</a></td>
              </tr>
              <tr>
                <td>Stripe</td>
                <td>Payment processing</td>
                <td><a href="https://stripe.com/gb/privacy" target="_blank" rel="noreferrer">stripe.com/gb/privacy</a></td>
              </tr>
              <tr>
                <td>Anthropic</td>
                <td>AI-generated tips (Claude API)</td>
                <td><a href="https://www.anthropic.com/privacy" target="_blank" rel="noreferrer">anthropic.com/privacy</a></td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Site hosting and anonymised analytics</td>
                <td><a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">vercel.com/legal/privacy-policy</a></td>
              </tr>
            </tbody>
          </table>
          <p>We do not sell your personal data. We do not share your data with any other third parties.</p>

          <h2>6. International Data Transfers</h2>
          <p>
            Some of the third-party services we use are based in the United States, which means your personal data may be transferred outside the United Kingdom. Specifically:
          </p>
          <ul>
            <li>Resend (USA) — UK-US Data Bridge / Standard Contractual Clauses</li>
            <li>Stripe (USA) — UK-US Data Bridge / Standard Contractual Clauses</li>
            <li>Anthropic/Claude API (USA) — Standard Contractual Clauses</li>
            <li>Vercel (USA) — UK-US Data Bridge / Standard Contractual Clauses</li>
          </ul>
          <p>
            The UK-US Data Bridge is an adequacy arrangement recognised under UK law that permits personal data transfers to certified US organisations. Each of the above services maintains appropriate safeguards for international data transfers.
          </p>

          <h2>7. Cookies</h2>
          <p>
            The Site does not use tracking or advertising cookies. Vercel Analytics, our analytics provider, is cookie-free. Stripe may set strictly necessary cookies to process payments securely; these are exempt from consent requirements under UK PECR.
          </p>

          <h2>8. Data Retention</h2>
          <p>
            We retain your email address for as long as you remain subscribed to our communications. If you unsubscribe or request deletion, we will remove your data within 30 days.
          </p>
          <p>
            Payment records are retained for 7 years as required by UK tax law. This data is held by Stripe, not by us directly.
          </p>

          <h2>9. Children&apos;s Data</h2>
          <p>
            Gradestack is designed primarily for sixth form students and those applying to university, many of whom may be under 18. We recognise that children&apos;s personal data warrants additional protection. We do not knowingly collect data from children under 13, and we take care to handle the data of under-18 users with appropriate safeguards in line with the UK Data (Use and Access) Act 2025. If you believe a child has provided us with personal data without appropriate consent, please contact us at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a> and we will delete it promptly.
          </p>

          <h2>10. Your Rights</h2>
          <p>Under UK GDPR, you have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
            <li><strong>Rectification</strong> — ask us to correct inaccurate data</li>
            <li><strong>Erasure</strong> — ask us to delete your personal data</li>
            <li><strong>Portability</strong> — request your data in a structured, machine-readable format so you can transfer it elsewhere</li>
            <li><strong>Restriction</strong> — ask us to restrict how we process your data in certain circumstances</li>
            <li><strong>Object</strong> — object to processing based on legitimate interests</li>
            <li><strong>Withdraw consent</strong> — at any time, without affecting the lawfulness of prior processing</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a>. We will respond within 30 days.
          </p>

          <h2>11. Complaints</h2>
          <p>
            If you are unhappy with how we have handled your personal data, please contact us first at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a>. We will acknowledge your complaint within 30 days and work to resolve it promptly.
          </p>
          <p>
            If you remain unsatisfied, you have the right to lodge a complaint with the Information Commissioner&apos;s Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noreferrer">ico.org.uk</a>.
          </p>

          <h2>12. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date. We encourage you to review this policy periodically.
          </p>
        </div>
      </div>
    </>
  );
}
