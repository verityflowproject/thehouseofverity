import LegalLayout from '@/components/LegalLayout'

const SECTIONS = [
  { id: 'how-credits-work', title: 'How Credits Work' },
  { id: 'cost-per-session', title: 'Cost Per Session' },
  { id: 'plans', title: 'Subscriptions vs Credit Packs' },
  { id: 'usage-dashboard', title: 'Reading Your Usage Dashboard' },
  { id: 'billing', title: 'Billing Cycle and Renewal' },
  { id: 'refunds', title: 'Refunds and Disputes' },
]

export default function CreditSystemPage() {
  return (
    <LegalLayout
      title="Credit System"
      lastUpdated="April 2026"
      sections={SECTIONS}
    >
      <div className="space-y-16 text-gray-400">

        {/* How Credits Work */}
        <section id="how-credits-work">
          <h2 className="text-2xl font-semibold text-white mb-4">How Credits Work</h2>
          <p className="mb-4 leading-relaxed">
            Credits are VerityFlow's unified currency for AI compute. Every action that invokes one or more AI models — primarily Council sessions — costs a fixed number of credits based on the complexity of the task and which models are engaged.
          </p>
          <p className="mb-6 leading-relaxed">
            Credits abstract away the per-token billing of individual model providers. You don't need to track token counts, manage API keys, or deal with rate limits from five separate services. VerityFlow handles all provider relationships and bills you a predictable credit amount per session.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              {
                label: 'Predictable cost',
                detail: 'A typical Council session costs approximately 25–40 credits. The exact amount depends on task complexity, output length, and how many review passes are triggered.'
              },
              {
                label: 'Never expire',
                detail: 'Both subscription credits and credit pack purchases never expire. Unused monthly credits roll into your pack balance if you cancel or downgrade your plan.'
              },
              {
                label: 'Transparent billing',
                detail: 'Every session shows the exact credit cost breakdown in the review log — including per-model costs and review/arbitration overhead.'
              },
            ].map(({ label, detail }) => (
              <div key={label} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-white font-medium mb-2">{label}</p>
                <p className="text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cost Per Session */}
        <section id="cost-per-session">
          <h2 className="text-2xl font-semibold text-white mb-4">Cost Per Session</h2>
          <p className="mb-6 leading-relaxed">
            A Council session involves multiple model calls across different pipeline stages. Each stage contributes to the total credit cost. Below is a breakdown of what happens in a typical session and the approximate credit cost of each stage:
          </p>

          <div className="space-y-3 mb-8">
            {[
              {
                stage: 'Hallucination Firewall',
                model: 'Perplexity Sonar Pro',
                role: 'Verifies all external dependencies against live documentation before any code is written.',
                cost: '3–6 credits',
                badge: 'firewall'
              },
              {
                stage: 'Architecture & Planning',
                model: 'Claude Sonnet',
                role: 'Designs the solution architecture, defines file structure, and sets the implementation plan.',
                cost: '5–10 credits',
                badge: 'architect'
              },
              {
                stage: 'Implementation',
                model: 'Codestral',
                role: 'Writes the actual code based on the architecture plan.',
                cost: '4–8 credits',
                badge: 'implementer'
              },
              {
                stage: 'Refactor Pass',
                model: 'Gemini',
                role: 'Reviews the implementation for code quality, patterns, and optimization opportunities.',
                cost: '4–8 credits',
                badge: 'refactor'
              },
              {
                stage: 'Final Review',
                model: 'GPT-4',
                role: 'Performs a final review for correctness, completeness, and alignment with requirements.',
                cost: '4–8 credits',
                badge: 'review'
              },
              {
                stage: 'Arbitration',
                model: 'Claude Sonnet',
                role: 'Resolves conflicts between reviewer outputs when they disagree. Only triggered when conflicts are detected.',
                cost: '0–6 credits',
                badge: 'arbitration'
              },
            ].map(({ stage, model, role, cost, badge }) => (
              <div key={stage} className="flex items-start gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white font-medium">{stage}</p>
                    <span className="text-xs text-gray-500 font-mono">{model}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{role}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-indigo-400 font-mono text-sm font-medium">{cost}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white font-medium">Typical session total</p>
              <p className="text-indigo-400 font-mono font-medium">25–40 credits</p>
            </div>
            <p className="text-sm">Simple tasks (e.g., a single component or utility function) cost closer to 25. Complex multi-file builds with many arbitration triggers cost closer to 40. Arbitration is only charged when conflicts are found and resolved.</p>
          </div>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
            <p className="text-sm"><span className="text-indigo-300 font-medium">Transparency:</span> You can see the exact credit cost breakdown for every session in the Review Log, including per-model costs and any arbitration overhead. Nothing is billed without a clear record.</p>
          </div>
        </section>

        {/* Plans */}
        <section id="plans">
          <h2 className="text-2xl font-semibold text-white mb-4">Subscriptions vs Credit Packs</h2>
          <p className="mb-6 leading-relaxed">
            VerityFlow offers two ways to hold credits: subscription plans and one-time credit packs. Most active users use a combination of both.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Subscription Plans</h3>
              <ul className="space-y-3 text-sm">
                {[
                  'Monthly credit allocation that renews each billing period',
                  'Higher daily usage limits than credit packs alone',
                  'Access to priority queue during peak demand',
                  'Cancel anytime — unused credits convert to pack balance',
                  'Plans: Free, Starter, Pro, Studio',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-indigo-400 flex-shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-3">Credit Packs</h3>
              <ul className="space-y-3 text-sm">
                {[
                  'One-time purchase, no recurring charge',
                  'Credits never expire',
                  'Available in multiple sizes (100, 250, 500, 1000+ credits)',
                  'Work alongside any subscription plan',
                  'Consumed after subscription credits are exhausted each day',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-indigo-400 flex-shrink-0">✦</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-4">
            <p className="text-sm"><span className="text-amber-300 font-medium">How they work together:</span> If you're on the Pro plan and hit your daily subscription limit, VerityFlow automatically draws from your credit pack balance. Your sessions continue without interruption. Subscription credits reset each billing cycle; pack credits do not.</p>
          </div>

          <p className="text-sm">
            See <a href="/pricing" className="text-indigo-400 hover:text-indigo-300 underline">Pricing</a> for current plan costs and credit amounts.
          </p>
        </section>

        {/* Usage Dashboard */}
        <section id="usage-dashboard">
          <h2 className="text-2xl font-semibold text-white mb-4">Reading Your Usage Dashboard</h2>
          <p className="mb-6 leading-relaxed">
            The Billing tab in your dashboard shows a real-time view of your credit situation and historical usage. Here's how to read it:
          </p>

          <div className="space-y-4 mb-6">
            {[
              {
                label: 'Total balance',
                detail: 'Your combined credit balance — subscription credits plus any pack credits. This is what you have available to spend right now.'
              },
              {
                label: 'Daily limit',
                detail: 'Your plan\'s maximum per-day spend. This resets at midnight UTC. Free accounts have a lower daily limit than paid plans to prevent abuse. Credit packs do not count toward daily limits on paid plans.'
              },
              {
                label: 'Usage history',
                detail: 'A chronological list of every session, showing the project name, date, and credit cost. Click any row to see the full credit breakdown for that session (per-model and per-pipeline-stage costs).'
              },
              {
                label: 'Subscription status',
                detail: 'Shows your current plan, the next renewal date, and how many subscription credits are remaining in the current billing period.'
              },
              {
                label: 'Pack balance',
                detail: 'If you\'ve purchased credit packs, this shows the total non-expiring pack balance separately from your subscription allocation.'
              },
            ].map(({ label, detail }) => (
              <div key={label} className="flex gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <div>
                  <p className="text-white font-medium mb-1">{label}</p>
                  <p className="text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Billing */}
        <section id="billing">
          <h2 className="text-2xl font-semibold text-white mb-4">Billing Cycle and Renewal</h2>
          <p className="mb-6 leading-relaxed">
            Subscriptions bill on the same day each month (the anniversary of when you subscribed). Here's what happens at each renewal:
          </p>

          <ol className="space-y-4 mb-6">
            {[
              'Your subscription is charged via Stripe using the card on file.',
              'Your subscription credit allocation is refreshed to the full plan amount.',
              'Any unused subscription credits from the previous period are discarded — they do not roll over. Pack credits are not affected.',
              'Your daily usage limit resets immediately at renewal.',
              'If payment fails, you receive an email and a 3-day grace period before your plan downgrades to Free.',
            ].map((item, i) => (
              <li key={i} className="flex gap-4 text-sm">
                <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</div>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ol>

          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-lg">
            <p className="text-sm"><span className="text-indigo-300 font-medium">Upgrading or downgrading:</span> Plan changes take effect immediately. Upgrades are prorated — you pay the difference for the remaining period. Downgrades apply at the next renewal date; your current plan benefits continue until then.</p>
          </div>
        </section>

        {/* Refunds */}
        <section id="refunds">
          <h2 className="text-2xl font-semibold text-white mb-4">Refunds and Disputes</h2>
          <p className="mb-4 leading-relaxed">
            VerityFlow's refund policy is straightforward:
          </p>

          <div className="space-y-4 mb-6">
            {[
              {
                label: 'Credit pack purchases',
                detail: 'Refundable within 7 days of purchase if no credits from the pack have been used. If partial credits have been spent, a prorated refund for the unused portion can be requested.'
              },
              {
                label: 'Subscription fees',
                detail: 'Monthly subscription fees are non-refundable once the billing period has started. If you cancel during a period, your plan remains active until the end of that period. You will not be charged again after cancellation.'
              },
              {
                label: 'Technical errors',
                detail: 'If a session fails due to a VerityFlow error (not an AI model failure or user error), credits are automatically refunded to your balance. You\'ll see a note in your usage history for any auto-refunded sessions.'
              },
              {
                label: 'Disputed charges',
                detail: 'If you believe a charge is incorrect, contact us at contact@verityflow.io with your account email and the date of the charge. We investigate all disputes within 3 business days.'
              },
            ].map(({ label, detail }) => (
              <div key={label} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                <p className="text-white font-medium mb-2">{label}</p>
                <p className="text-sm leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>

          <div className="p-5 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl">
            <p className="text-white font-medium mb-2">Questions about billing?</p>
            <p className="text-sm text-gray-400 mb-4">Our support team handles billing questions directly. Reach out and we'll resolve it quickly.</p>
            <a href="/contact" className="inline-block px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">
              Contact billing support
            </a>
          </div>
        </section>

      </div>
    </LegalLayout>
  )
}
