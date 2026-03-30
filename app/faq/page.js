import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const FAQS = [
  {
    question: 'What counts as a Council session?',
    answer: 'A Council session is triggered when you send a prompt to VerityFlow. The AI council collaborates to verify dependencies, design architecture, generate code, and review output. All of this coordination counts as one session, regardless of how many models are involved or how many rounds of review occur.'
  },
  {
    question: 'Do credits expire?',
    answer: 'No. Credits purchased through one-time credit packs never expire. You can use them at your own pace without any time pressure or subscription commitment. Subscription-based sessions reset monthly on your billing date.'
  },
  {
    question: 'Can I use my own API keys?',
    answer: 'Yes. All plans support BYOK (Bring Your Own Keys). Connect your Anthropic, OpenAI, Mistral, Google AI, and Perplexity keys directly. VerityFlow never marks up provider costs — you pay providers directly at their standard rates. Alternatively, use a single OpenRouter key to cover all five models.'
  },
  {
    question: 'What happens when I run out of sessions?',
    answer: 'If you reach your monthly session limit on a subscription plan, you can either wait for your limit to reset at the start of your next billing period, upgrade to a higher-tier plan, or purchase credit packs for immediate access. Credit pack purchases are one-time and never expire.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes. You can cancel your Pro or Teams subscription at any time from the billing portal. You\'ll retain full access until the end of your current billing period, then your account will automatically downgrade to the Free plan. All your projects and data remain intact.'
  },
  {
    question: 'How does BYOK pricing work?',
    answer: 'When using your own API keys, you pay providers (Anthropic, OpenAI, etc.) directly at their standard per-token rates. VerityFlow charges only for orchestration through our subscription plans or credit packs. This ensures complete cost transparency — we never mark up model provider costs.'
  },
  {
    question: 'What\'s the difference between subscriptions and credits?',
    answer: 'Subscriptions provide recurring monthly sessions that reset each billing period. Credits are one-time purchases that never expire and can be used at any time. Subscriptions are best for consistent usage, while credits are ideal for occasional projects or supplementing subscription limits.'
  },
  {
    question: 'Do unused sessions roll over to the next month?',
    answer: 'No. Subscription-based session limits reset at the start of each billing period. If you use 30 of your 50 free sessions in January, you\'ll start February with a fresh 50 sessions. However, credits purchased through credit packs never expire and carry forward indefinitely.'
  },
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer: 'Yes. You can upgrade your plan at any time and the change takes effect immediately. When downgrading, the change takes effect at the end of your current billing period to ensure you receive full value for your payment.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express, Discover) processed securely through Stripe. We do not store your payment information — all transactions are handled by Stripe\'s PCI-compliant infrastructure.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'We don\'t offer traditional free trials because our Free plan is genuinely free forever with 50 sessions per month. You can test the full AI council before committing to a paid plan. When you\'re ready for more sessions, upgrade to Pro or Teams.'
  },
  {
    question: 'What happens to my projects if I downgrade?',
    answer: 'All your projects, code, and ProjectState memory remain fully accessible when you downgrade. The only limitation is the reduced session count. You can always upgrade again or purchase credit packs if you need more sessions.'
  }
]

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Simple Header */}
      <nav className="border-b border-gray-900">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              Verity<span className="text-indigo-400">Flow</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Link href="/pricing" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to pricing</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-400 mb-12">
            Everything you need to know about VerityFlow plans, billing, and usage.
          </p>

          <div className="space-y-6">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
                <h2 className="text-xl font-semibold mb-4">{faq.question}</h2>
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 p-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl text-center">
            <h3 className="text-2xl font-semibold mb-3">Still have questions?</h3>
            <p className="text-gray-400 mb-6">
              Our team is here to help. Get in touch and we'll respond as soon as possible.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
