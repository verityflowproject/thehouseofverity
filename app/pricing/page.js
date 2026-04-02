'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Menu, X, Zap, ChevronRight, Coins } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'No credit card required',
    credits: '50 on signup',
    dailyLimit: '~3 sessions/day',
    features: [
      '50 credits on signup',
      'All 5 AI models',
      '3 projects',
      '~3 council sessions/day',
      'Hallucination firewall',
      'Full review log',
      'No API keys needed — we handle everything'
    ],
    cta: 'Get started free',
    ctaLink: '/register',
    popular: false
  },
  {
    id: 'starter',
    name: 'Starter',
    price: '$19',
    period: 'month',
    tagline: '',
    credits: '2,500/mo',
    dailyLimit: '~10 sessions/day',
    features: [
      '2,500 credits/month',
      'Everything in Free',
      '10 projects',
      '~10 council sessions/day',
      'Extended session history',
      'Email support',
      'All models managed, zero setup'
    ],
    cta: 'Start Starter plan',
    ctaLink: '/register?plan=starter',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$49',
    period: 'month',
    tagline: '',
    credits: '8,000/mo',
    dailyLimit: '~50 sessions/day',
    features: [
      '8,000 credits/month',
      'Everything in Starter',
      '50 projects',
      '~50 council sessions/day',
      'Priority model routing',
      'Usage analytics dashboard',
      'Priority support',
      'Transparent cost breakdowns'
    ],
    cta: 'Start Pro plan',
    ctaLink: '/register?plan=pro',
    popular: true
  },
  {
    id: 'studio',
    name: 'Studio',
    price: '$99',
    period: 'month',
    tagline: '',
    credits: '20,000/mo',
    dailyLimit: 'Unlimited',
    features: [
      '20,000 credits/month',
      'Everything in Pro',
      'Unlimited projects',
      'Unlimited daily usage',
      'Custom model routing rules',
      'Team collaboration',
      'Dedicated support & SLA',
      'Full unit economics reporting'
    ],
    cta: 'Start Studio plan',
    ctaLink: '/register?plan=studio',
    popular: false
  }
]

const CREDIT_PACKS = [
  {
    name: 'Starter',
    credits: 500,
    price: '$5',
    sessions: '~15 sessions',
    save: null
  },
  {
    name: 'Builder',
    credits: 1200,
    price: '$10',
    sessions: '~35 sessions',
    save: 'save 17%'
  },
  {
    name: 'Pro Pack',
    credits: 3000,
    price: '$20',
    sessions: '~90 sessions',
    save: 'save 25%',
    bestValue: true
  },
  {
    name: 'Studio',
    credits: 8000,
    price: '$40',
    sessions: '~240 sessions',
    save: 'save 33%'
  }
]

const FAQ_TEASER = [
  {
    question: 'How do credits work?',
    answer: 'Credits are VerityFlow\'s universal currency. Each council session costs approximately 30 credits, depending on task complexity and which models are used. Credits are deducted in real-time based on actual token usage — you only pay for what you use. Simple tasks use fewer credits (routed to efficient models), while complex tasks may use more.'
  },
  {
    question: 'Do credits expire?',
    answer: 'No. Credits purchased through one-time credit packs never expire. Monthly subscription credits are also persistent — they roll over and never disappear. You can use them at your own pace.'
  },
  {
    question: 'What do credits actually pay for?',
    answer: 'Credits cover the full intelligent system: raw LLM API calls across five specialized models, intelligent routing to the right model for each task, the hallucination firewall, multi-model review pipeline, arbitration, and platform infrastructure. We apply a transparent markup on top of our actual API costs — so you get the complete expert AI team, not just raw tokens. Every session shows you an itemized cost breakdown.'
  }
]

export default function PublicPricingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Beta
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/pricing" className="text-white font-medium">
                Pricing
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                Get started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 space-y-4">
              <a href="/#how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="block text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/pricing" className="block text-white font-medium">
                Pricing
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block w-full px-4 py-2 text-center text-gray-300 border border-gray-700 rounded-lg">
                  Sign in
                </Link>
                <Link href="/register" className="block w-full px-5 py-2 text-center bg-indigo-600 rounded-lg font-medium">
                  Get started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Simple, credit-based pricing
            </h1>
            <p className="text-xl text-gray-400">
              Subscribe monthly for credits, or buy packs anytime. All plans include the full AI council.
            </p>
          </div>

          {/* How Credits Work */}
          <div className="max-w-5xl mx-auto mb-16">
            <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Coins className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">How credits work</h3>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    Each council session costs approximately <span className="text-white font-semibold">~30 credits</span>. Credits are deducted in real-time based on actual token usage. 
                    Simple tasks are routed to efficient models (fewer credits), while complex tasks use premium models.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <div className="bg-gray-900/60 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-emerald-400">~30</div>
                      <div className="text-xs text-gray-400">credits per session</div>
                    </div>
                    <div className="bg-gray-900/60 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-400">5</div>
                      <div className="text-xs text-gray-400">model calls per session</div>
                    </div>
                    <div className="bg-gray-900/60 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-400">80%</div>
                      <div className="text-xs text-gray-400">tasks use efficient routing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-20">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-900/50 border rounded-2xl p-6 flex flex-col ${
                  plan.popular 
                    ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' 
                    : 'border-gray-800'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-block px-4 py-1 bg-indigo-600 text-white text-sm font-semibold rounded-full">
                      Most popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">/ {plan.period}</span>
                  </div>
                  {plan.tagline && (
                    <p className="text-sm text-gray-500">{plan.tagline}</p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-indigo-300 font-medium">{plan.credits} credits</span>
                  </div>
                </div>

                <div className="border-t border-gray-800 pt-6 mb-6">
                  <ul className="space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-800">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2 text-sm ${
                      plan.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-white'
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Managed Platform Callout */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Just buy credits — we handle everything</h3>
                  <p className="text-gray-300 leading-relaxed">
                    No API accounts to create, no keys to manage, no model selection to worry about. VerityFlow securely manages all five AI models on your behalf and routes each task to the optimal model automatically. Credits cover the complete intelligent system — raw API costs, smart routing, hallucination firewall, multi-model review, and arbitration. <span className="text-white font-medium">Every session includes a transparent cost breakdown</span> so you always know what you're paying for.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packs */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Need more credits? Top up anytime.
              </h2>
              <p className="text-xl text-gray-400">
                One-time purchases. No commitment. Credits never expire.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {CREDIT_PACKS.map((pack) => (
                <div
                  key={pack.name}
                  className={`relative bg-gray-900/50 border rounded-xl p-6 hover:border-gray-700 transition-colors ${
                    pack.bestValue ? 'border-emerald-500/50' : 'border-gray-800'
                  }`}
                >
                  {pack.bestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-block px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-full">
                        Best value
                      </span>
                    </div>
                  )}

                  <div className="text-center">
                    <h4 className="text-lg font-semibold mb-2">{pack.name}</h4>
                    <div className="text-3xl font-bold mb-1">{pack.credits.toLocaleString()}</div>
                    <div className="text-sm text-gray-500 mb-4">credits</div>
                    
                    <div className="text-2xl font-bold text-indigo-400 mb-2">{pack.price}</div>
                    <div className="text-sm text-gray-400 mb-2">{pack.sessions}</div>
                    
                    {pack.save && (
                      <div className="text-xs text-emerald-400 font-medium">{pack.save}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
              >
                Buy credits
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* FAQ Teaser */}
          <div className="max-w-4xl mx-auto mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Frequently asked questions</h2>
              <Link href="/faq" className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 text-sm">
                See all FAQs
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="space-y-6">
              {FAQ_TEASER.map((faq, i) => (
                <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-12">
              <h2 className="text-3xl font-bold mb-4">
                Start building free. 50 credits on us.
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join developers who trust VerityFlow to build production-ready code.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors text-lg"
              >
                Get started free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 mt-32">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  Verity<span className="text-indigo-400">Flow</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 font-medium">Your AI Engineering Firm.</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Five specialized models. One persistent context. Code you can trust.
              </p>
              <p className="text-xs text-gray-600 pt-4">© 2026 VerityFlow. All rights reserved.</p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</a></li>
                <li><a href="/#council" className="text-gray-400 hover:text-white transition-colors">The AI Council</a></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Developers Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
              <p>VerityFlow is not affiliated with Anthropic, OpenAI, Google, Mistral, or Perplexity.</p>
              <p className="text-gray-500">Made for builders who ship.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
