export default function ShortlistedPrivacyPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-gray-100 px-6 py-5">
        <div className="max-w-3xl mx-auto flex items-baseline gap-3">
          <a
            href="/shortlisted"
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: "Georgia, serif", color: "inherit", textDecoration: "none" }}
          >
            Shortlisted
          </a>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <h1
          className="text-3xl font-bold text-gray-900 mb-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-400 mb-10">Last updated: April 2025</p>

        <div className="prose prose-gray max-w-none space-y-8 text-sm text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">1. Who we are</h2>
            <p>
              Shortlisted is a service operated by GradeStack. If you have any questions about
              this policy, contact us at{" "}
              <a href="mailto:results@gradestack.co.uk" className="text-[#C24E2A] underline">
                results@gradestack.co.uk
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">2. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Email address</strong> — provided by you on the submission form, used to deliver your results.</li>
              <li><strong>Personal statement</strong> — the text you submit for analysis.</li>
              <li><strong>Marketing preference</strong> — whether you opted in to receive tips and updates.</li>
              <li><strong>Payment data</strong> — processed directly by Stripe; we never see or store card details.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To run the AI analysis of your personal statement and return scored feedback.</li>
              <li>To email you your results after purchase.</li>
              <li>If you opted in, to send you occasional tips on improving your personal statement.</li>
            </ul>
            <p className="mt-3">We do not sell or share your personal statement or email address with third parties for marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">4. Storage and retention</h2>
            <p>
              Your email address and personal statement are stored in Upstash Redis with a 48-hour TTL.
              After 48 hours the data is automatically and permanently deleted. If you opted in to
              marketing emails, your email address is retained in our mailing list until you unsubscribe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">5. Third-party processors</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Anthropic</strong> — your personal statement is sent to the Claude API to generate the analysis. Anthropic&apos;s API data is not used to train models.</li>
              <li><strong>Stripe</strong> — handles payment processing. Subject to Stripe&apos;s own Privacy Policy.</li>
              <li><strong>Resend</strong> — used to send results emails and (where opted in) marketing emails.</li>
              <li><strong>Upstash</strong> — provides the Redis database used for temporary session storage.</li>
              <li><strong>Vercel</strong> — hosts the application. Vercel may log request metadata per its own Privacy Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">6. Your rights (UK GDPR)</h2>
            <p>Under UK GDPR you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>Access</strong> the personal data we hold about you.</li>
              <li><strong>Erasure</strong> — request deletion of your data at any time.</li>
              <li><strong>Rectification</strong> — correct any inaccurate data.</li>
              <li><strong>Object</strong> to processing for direct marketing.</li>
              <li><strong>Withdraw consent</strong> — unsubscribe from marketing emails at any time via the unsubscribe link in any email we send.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email{" "}
              <a href="mailto:results@gradestack.co.uk" className="text-[#C24E2A] underline">
                results@gradestack.co.uk
              </a>.
              Note that because session data is deleted automatically after 48 hours, we may not be able
              to locate data submitted before that window.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              Shortlisted does not use cookies or tracking pixels. No cookie consent banner is required.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. The date at the top of this page will reflect
              the most recent revision.
            </p>
          </section>

        </div>
      </div>

      <footer className="border-t border-gray-100 px-6 py-5 text-center text-xs text-gray-400">
        <p>
          <a href="/shortlisted/privacy" className="hover:text-gray-600 transition">Privacy Policy</a>
          {" · "}
          <a href="/shortlisted/terms" className="hover:text-gray-600 transition">Terms &amp; Conditions</a>
          {" · "}
          &copy; 2026 Shortlisted
        </p>
      </footer>
    </main>
  );
}
