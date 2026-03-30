'use client'

import LegalLayout from '@/components/LegalLayout'

const sections = [
  { id: 'cookie-details', title: 'Cookie Details' },
  { id: 'what-we-dont-use', title: 'What We Don\'t Use' },
  { id: 'contact', title: 'Contact' }
]

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Cookie Policy"
      lastUpdated="March 26, 2026"
      sections={sections}
    >
      <div className="space-y-12 text-gray-400">
        {/* Intro */}
        <section className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
          <p className="text-xl leading-relaxed font-semibold text-white">
            We use ONE cookie.
          </p>
        </section>

        {/* Cookie Details */}
        <section id="cookie-details">
          <h2 className="text-2xl font-semibold text-white mb-6">Cookie Details</h2>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
            <div>
              <strong className="text-white block mb-2">Name:</strong>
              <code className="px-3 py-1.5 bg-gray-900 rounded text-indigo-400 font-mono text-sm">
                authjs.session-token
              </code>
              <span className="text-gray-500 ml-2">or</span>
              <code className="ml-2 px-3 py-1.5 bg-gray-900 rounded text-indigo-400 font-mono text-sm">
                __Secure-authjs.session-token
              </code>
              <span className="text-gray-500 ml-2">(on HTTPS)</span>
            </div>
            <div>
              <strong className="text-white block mb-2">Purpose:</strong>
              <span>Authentication session — keeps you logged in</span>
            </div>
            <div>
              <strong className="text-white block mb-2">Type:</strong>
              <span className="text-indigo-400">Essential / Strictly necessary</span>
            </div>
            <div>
              <strong className="text-white block mb-2">Duration:</strong>
              <span>30 days or until sign out</span>
            </div>
            <div>
              <strong className="text-white block mb-2">Can you opt out:</strong>
              <span className="text-red-400">No — the Service cannot function without this cookie</span>
            </div>
          </div>
        </section>

        {/* What We Don't Use */}
        <section id="what-we-dont-use">
          <h2 className="text-2xl font-semibold text-white mb-4">What We Don't Use</h2>
          <p className="mb-4 leading-relaxed">That's it. We do not use:</p>
          <ul className="space-y-3 leading-relaxed list-disc list-inside">
            <li>Analytics cookies (no Google Analytics, no Mixpanel)</li>
            <li>Advertising or tracking cookies</li>
            <li>Third-party cookies</li>
            <li>Pixel trackers</li>
          </ul>
          <p className="mt-6 leading-relaxed text-gray-400">
            If this changes, we will update this policy and notify you by email.
          </p>
        </section>

        {/* Contact */}
        <section id="contact">
          <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
          <p className="leading-relaxed">
            For questions about our cookie usage, contact us at: <a href="mailto:privacy@verityflow.io" className="text-indigo-400 hover:text-indigo-300 underline font-semibold">privacy@verityflow.io</a>
          </p>
        </section>
      </div>
    </LegalLayout>
  )
}
