export default function TermsAndConditions() {
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
        .legal-content .intro-box { background: #ffffff; border: 1px solid #e8e6e0; border-radius: 14px; padding: 20px 24px; margin-bottom: 32px; }
        .legal-content .warning-box { background: #faeeda; border: 1px solid #fac775; border-radius: 14px; padding: 16px 20px; margin-bottom: 16px; }
        .legal-content .warning-box p { margin-bottom: 0; color: #854f0b; }
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
          <h1>Terms &amp; Conditions</h1>
          <p className="updated">Last updated: April 2026</p>

          <div className="intro-box">
            <p>
              These Terms and Conditions (&ldquo;Terms&rdquo;) govern your use of gradestack.co.uk (&ldquo;the Site&rdquo;), operated by Dimitri Ben Aris (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By accessing or using the Site, you agree to be bound by these Terms. If you do not agree, please do not use the Site.
            </p>
            <p style={{ marginBottom: 0 }}>
              Questions? Contact us at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a>.<br />
              Our correspondence address is: 66a Bassett Road, London, W10 6JP.
            </p>
          </div>

          <h2>1. About Gradestack</h2>
          <p>
            Gradestack is an online tool that helps users calculate their UCAS tariff points, understand their current academic standing, and explore the university entry requirements their points may qualify them for. The Site is operated by Dimitri Ben Aris, an individual based in the United Kingdom.
          </p>

          <h2>2. Age and Eligibility</h2>
          <p>
            By using the paid tier of Gradestack, you confirm that you are 18 or over, or that you have obtained parental or guardian permission to make the purchase. As Gradestack&apos;s user base includes students who may be under 18, we strongly encourage parents or guardians to supervise any purchases made by minors.
          </p>

          <h2>3. Free and Paid Services</h2>
          <p>
            <strong>Free tier:</strong> The free calculator, grade simulation tool, and AI-generated tips are available at no cost. Providing your email address to receive tips is entirely optional.
          </p>
          <p>
            <strong>Paid tier (£2.99):</strong> For a one-time payment of £2.99, you receive a detailed breakdown of what your UCAS points total could qualify you for, including indicative university entry requirements matched to your points.
          </p>
          <p>
            Payment is processed securely by Stripe. By completing a purchase, you also agree to <a href="https://stripe.com/gb/legal" target="_blank" rel="noreferrer">Stripe&apos;s Terms of Service</a>.
          </p>

          <h2>4. Use of the Site</h2>
          <p>You may use the Site for personal, non-commercial purposes. You agree not to:</p>
          <ul>
            <li>Use the Site for any unlawful purpose</li>
            <li>Attempt to disrupt, damage, or gain unauthorised access to the Site or its systems</li>
            <li>Reproduce, copy, or redistribute any content from the Site without our written permission</li>
          </ul>

          <h2>5. Accuracy of Information — Important Disclaimer</h2>
          <div className="warning-box">
            <p>The information provided by Gradestack is for general guidance only. It is not a substitute for official university admissions information.</p>
          </div>
          <p>Specifically:</p>
          <ul>
            <li>UCAS tariff point data and university entry requirements are sourced manually from publicly available information and may not reflect the most current requirements.</li>
            <li>Entry requirements vary by year, course, campus, and individual applicant circumstances. They can change at any time.</li>
            <li>Contextual admissions, portfolio requirements, interviews, and other non-tariff factors are not accounted for.</li>
            <li>We make no guarantee that any university will accept an applicant who meets the points threshold shown on this Site.</li>
          </ul>
          <p>
            You should always verify entry requirements directly with the university or through the official UCAS website before making any application decisions. Do not rely solely on information provided by Gradestack for any admissions-related decision.
          </p>

          <h2>6. AI-Generated Content</h2>
          <p>
            The tips and quick wins generated through the free email capture feature are produced using an AI language model (Anthropic&apos;s Claude). While we aim for this content to be helpful and accurate, AI-generated content may contain errors or omissions. It should be treated as general guidance only, not as professional academic advice.
          </p>

          <h2>7. Consumer Rights</h2>
          <p>
            If you are a consumer based in the United Kingdom, the Consumer Rights Act 2015 applies to your purchase. Digital content sold through Gradestack is provided on the basis that it is of satisfactory quality, fit for purpose, and as described.
          </p>
          <p>
            If the digital content you receive is faulty or does not match its description, you have the right to a repair or replacement. If repair or replacement is not possible, you may be entitled to a full or partial refund. To exercise this right, contact us at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a>.
          </p>
          <p>
            Nothing in these Terms affects your statutory rights under the Consumer Rights Act 2015 or any other applicable consumer protection legislation.
          </p>

          <h2>8. Refunds</h2>
          <p>
            As the paid tier provides immediate digital access to content, we do not offer refunds once the content has been delivered, except where required by law.
          </p>
          <p>
            If you experience a technical issue that prevented you from accessing the paid content, please contact us at <a href="mailto:dimitri@gradestack.co.uk">dimitri@gradestack.co.uk</a> and we will resolve the issue promptly.
          </p>

          <h2>9. Intellectual Property</h2>
          <p>
            All content on the Site, including but not limited to text, design, code, and branding, is owned by Dimitri Ben Aris unless otherwise stated. You may not reproduce or use any of it without prior written permission.
          </p>

          <h2>10. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, Gradestack and Dimitri Ben Aris shall not be liable for:</p>
          <ul>
            <li>Any loss or damage arising from your reliance on information provided by the Site</li>
            <li>Any decisions made regarding university applications based on the Site&apos;s output</li>
            <li>Any indirect, consequential, or incidental loss arising from use of the Site</li>
          </ul>
          <p>
            Nothing in these Terms limits our liability for fraud, death, or personal injury caused by our negligence.
          </p>

          <h2>11. Changes to the Service</h2>
          <p>
            We reserve the right to modify, suspend, or discontinue any part of the Site at any time without notice. We may also update these Terms from time to time. Continued use of the Site after changes are posted constitutes your acceptance of the updated Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes arising from these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </div>
      </div>
    </>
  );
}
