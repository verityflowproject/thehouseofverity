'use client'

import LegalLayout from '@/components/LegalLayout'

const sections = [
  { id: 'service', title: '1. The Service' },
  { id: 'account', title: '2. Your Account' },
  { id: 'acceptable-use', title: '3. Acceptable Use' },
  { id: 'your-content', title: '4. Your Content' },
  { id: 'ai-providers', title: '5. AI Provider Terms' },
  { id: 'billing', title: '6. Billing' },
  { id: 'availability', title: '7. Service Availability' },
  { id: 'ip', title: '8. Intellectual Property' },
  { id: 'liability', title: '9. Limitation of Liability' },
  { id: 'termination', title: '10. Termination' },
  { id: 'law', title: '11. Governing Law' },
  { id: 'changes', title: '12. Changes' },
  { id: 'contact', title: '13. Contact' }
]

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      lastUpdated="March 26, 2026"
      sections={sections}
    >
      <div className="space-y-12 text-gray-400">
        {/* Intro */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <p className="text-base leading-relaxed">
            By using VerityFlow you agree to these terms. Please read them carefully.
          </p>
        </section>

        {/* Section 1 */}
        <section id="service">
          <h2 className="text-2xl font-semibold text-white mb-4">1. The Service</h2>
          <p className="leading-relaxed">
            VerityFlow provides an AI-assisted coding platform. We do not guarantee any specific output quality, uptime, or fitness for any particular purpose. AI outputs should be reviewed by a qualified developer before use in production.
          </p>
        </section>

        {/* Section 2 */}
        <section id="account">
          <h2 className="text-2xl font-semibold text-white mb-4">2. Your Account</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>You must be 13 or older to use the Service</li>
            <li>You are responsible for keeping your login credentials secure</li>
            <li>One account per person — no shared accounts on the Free plan</li>
            <li>You may not use the Service for automated abuse or to resell access</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section id="acceptable-use">
          <h2 className="text-2xl font-semibold text-white mb-4">3. Acceptable Use</h2>
          <p className="mb-4 leading-relaxed">You may not use VerityFlow to:</p>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>Generate malware, exploits, or tools designed to harm systems</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Generate content that is illegal in your jurisdiction</li>
            <li>Attempt to reverse-engineer or extract our proprietary orchestration logic</li>
            <li>Abuse the platform (automated mass requests, credential stuffing, etc.)</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section id="your-content">
          <h2 className="text-2xl font-semibold text-white mb-4">4. Your Content</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>You retain ownership of prompts you submit and outputs you receive</li>
            <li>You grant VerityFlow a limited license to process your content to provide the Service</li>
            <li>We do not use your content to train AI models</li>
            <li>You are responsible for ensuring your prompts do not contain confidential information you're not authorized to share</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section id="ai-providers">
          <h2 className="text-2xl font-semibold text-white mb-4">5. AI Provider Terms</h2>
          <p className="leading-relaxed">
            Use of VerityFlow is subject to the terms of the underlying AI providers: Anthropic, OpenAI, Mistral AI, Google, and Perplexity. VerityFlow manages all provider credentials on your behalf; by using the platform you agree to those providers' acceptable use policies.
          </p>
        </section>

        {/* Section 6 */}
        <section id="billing">
          <h2 className="text-2xl font-semibold text-white mb-4">6. Billing</h2>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>Subscriptions are billed monthly and renew automatically</li>
            <li>Credits are one-time purchases and non-refundable once used</li>
            <li>We reserve the right to change pricing with 30 days' notice</li>
            <li>Chargebacks will result in immediate account suspension</li>
          </ul>
        </section>

        {/* Section 7 */}
        <section id="availability">
          <h2 className="text-2xl font-semibold text-white mb-4">7. Service Availability</h2>
          <p className="leading-relaxed">
            We target 99.5% uptime but make no guarantees. We may perform maintenance with reasonable notice. We are not liable for losses due to service interruptions.
          </p>
        </section>

        {/* Section 8 */}
        <section id="ip">
          <h2 className="text-2xl font-semibold text-white mb-4">8. Intellectual Property</h2>
          <p className="leading-relaxed">
            The VerityFlow platform, brand, and orchestration system are our intellectual property. You may not copy, modify, or resell them.
          </p>
        </section>

        {/* Section 9 */}
        <section id="liability">
          <h2 className="text-2xl font-semibold text-white mb-4">9. Limitation of Liability</h2>
          <p className="leading-relaxed">
            VerityFlow is provided "as is." To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the Service. Our total liability is limited to the amount you paid in the 12 months preceding the claim.
          </p>
        </section>

        {/* Section 10 */}
        <section id="termination">
          <h2 className="text-2xl font-semibold text-white mb-4">10. Termination</h2>
          <p className="leading-relaxed">
            We may suspend or terminate accounts that violate these terms. You may delete your account at any time from your dashboard settings.
          </p>
        </section>

        {/* Section 11 */}
        <section id="law">
          <h2 className="text-2xl font-semibold text-white mb-4">11. Governing Law</h2>
          <p className="leading-relaxed">
            These terms are governed by the laws of [Your jurisdiction — add state/country before launch]. Disputes will be resolved through binding arbitration except where prohibited by law.
          </p>
        </section>

        {/* Section 12 */}
        <section id="changes">
          <h2 className="text-2xl font-semibold text-white mb-4">12. Changes</h2>
          <p className="leading-relaxed">
            We'll notify you of material changes by email. Continued use constitutes acceptance.
          </p>
        </section>

        {/* Section 13 */}
        <section id="contact">
          <h2 className="text-2xl font-semibold text-white mb-4">13. Contact</h2>
          <p className="leading-relaxed">
            For legal inquiries, contact us at: <a href="mailto:legal@verityflow.io" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">legal@verityflow.io</a>
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
