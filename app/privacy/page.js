'use client'

import LegalLayout from '@/components/LegalLayout'

const sections = [
  { id: 'info-collect', title: '1. Information We Collect' },
  { id: 'how-use', title: '2. How We Use Your Data' },
  { id: 'data-sharing', title: '3. Data Sharing' },
  { id: 'data-retention', title: '4. Data Retention' },
  { id: 'your-rights', title: '5. Your Rights' },
  { id: 'security', title: '6. Security' },
  { id: 'cookies', title: '7. Cookies' },
  { id: 'children', title: '8. Children' },
  { id: 'changes', title: '9. Changes to This Policy' },
  { id: 'contact', title: '10. Contact' }
]

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      lastUpdated="March 26, 2026"
      sections={sections}
    >
      <div className="space-y-12 text-gray-400">
        {/* Intro */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <p className="text-base leading-relaxed">
            VerityFlow ("we", "our", "the Service") is committed to protecting your privacy. 
            This policy explains what data we collect, why we collect it, and how you can control it.
          </p>
        </section>

        {/* Section 1 */}
        <section id="info-collect">
          <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
          <div className="space-y-4 leading-relaxed">
            <div>
              <strong className="text-white">Account information:</strong> email address, name, profile image (from Google OAuth)
            </div>
            <div>
              <strong className="text-white">Usage data:</strong> prompts submitted to the AI Council, model outputs, session timestamps, project names and descriptions
            </div>
            <div>
              <strong className="text-white">Billing information:</strong> processed by Stripe — we store only a Stripe customer ID, not card numbers
            </div>
            <div>
              <strong className="text-white">Platform API keys:</strong> VerityFlow manages all AI provider credentials on your behalf. These are platform-level secrets stored securely on our servers and never exposed to users.
            </div>
            <div>
              <strong className="text-white">Technical data:</strong> IP address, browser type, device type, pages visited (standard server logs)
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section id="how-use">
          <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Data</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>To provide the Service: run AI Council sessions, maintain project state, generate review logs</li>
            <li>To process payments via Stripe</li>
            <li>To send transactional emails (magic link login, receipts) — we do not send marketing email without consent</li>
            <li>To improve the Service: aggregate, anonymized usage patterns (never individual prompt content)</li>
            <li className="font-semibold text-white">We do NOT sell your data to third parties</li>
            <li className="font-semibold text-white">We do NOT use your prompts or outputs to train AI models</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="data-sharing">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Data Sharing</h2>
          <div className="space-y-4 leading-relaxed">
            <div>
              <strong className="text-white">AI providers:</strong> your prompts are sent to the relevant AI providers (Anthropic, OpenAI, Mistral, Google, Perplexity) via VerityFlow's managed platform credentials to generate responses. Their privacy policies govern how they handle this data.
            </div>
            <div>
              <strong className="text-white">Stripe:</strong> payment processing. Stripe's privacy policy applies.
            </div>
            <div>
              <strong className="text-white">Vercel:</strong> hosting infrastructure. Your data transits Vercel's servers.
            </div>
            <div>
              <strong className="text-white">No other third-party sharing.</strong>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section id="data-retention">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Data Retention</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li><strong className="text-white">Account data:</strong> retained while your account is active and for 90 days after deletion</li>
            <li><strong className="text-white">Project data:</strong> deleted immediately when you delete a project</li>
            <li><strong className="text-white">Usage logs:</strong> retained for 90 days for billing disputes and analytics</li>
            <li><strong className="text-white">Account data:</strong> deleted within 30 days when you close your account</li>
            <li>You can request full account deletion by emailing <a href="mailto:privacy@verityflow.io" className="text-indigo-400 hover:text-indigo-300 underline">privacy@verityflow.io</a></li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="your-rights">
          <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li><strong className="text-white">Access:</strong> request a copy of your data</li>
            <li><strong className="text-white">Correction:</strong> update incorrect information in your account settings</li>
            <li><strong className="text-white">Deletion:</strong> delete your account and all associated data</li>
            <li><strong className="text-white">Portability:</strong> export your session history (coming soon)</li>
            <li>For GDPR/CCPA requests: <a href="mailto:privacy@verityflow.io" className="text-indigo-400 hover:text-indigo-300 underline">privacy@verityflow.io</a></li>
          </ul>
        </section>

        {/* Section 6 */}
        <section id="security">
          <h2 className="text-2xl font-semibold text-white mb-4">6. Security</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>All data transmitted over HTTPS/TLS</li>
            <li>All data encrypted at rest and in transit</li>
            <li>Passwords: we use OAuth (Google) and magic links — no passwords stored</li>
            <li>Session tokens stored as httpOnly cookies</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="cookies">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Cookies</h2>
          <div className="leading-relaxed">
            <p className="mb-3">We use one essential session cookie (<code className="px-2 py-1 bg-gray-900 rounded text-indigo-400 font-mono text-sm">authjs.session-token</code>) for authentication.</p>
            <p className="mb-3">No advertising cookies, no tracking pixels.</p>
            <p>See our <a href="/cookies" className="text-indigo-400 hover:text-indigo-300 underline">Cookie Policy</a> for full details.</p>
          </div>
        </section>

        {/* Section 8 */}
        <section id="children">
          <h2 className="text-2xl font-semibold text-white mb-4">8. Children</h2>
          <p className="leading-relaxed">
            VerityFlow is not directed at children under 13. We do not knowingly collect data from children.
          </p>
        </section>

        {/* Section 9 */}
        <section id="changes">
          <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Policy</h2>
          <p className="leading-relaxed">
            We'll notify you by email of material changes. Continued use after changes constitutes acceptance.
          </p>
        </section>

        {/* Section 10 */}
        <section id="contact">
          <h2 className="text-2xl font-semibold text-white mb-4">10. Contact</h2>
          <p className="leading-relaxed">
            For privacy inquiries, contact us at: <a href="mailto:privacy@verityflow.io" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">privacy@verityflow.io</a>
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
