'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, Menu, X, Zap, ChevronRight } from 'lucide-react'

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    tagline: 'No credit card required',
    sessions: 50,
    features: [
      '50 Council sessions/month',
      'All 5 AI models',
      'ProjectState memory system',
      'Hallucination firewall',
      'Full review log',
      'BYOK supported — zero markup'
    ],
    cta: 'Get started free',
    ctaLink: '/register',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: 'month',
    tagline: '',
    sessions: 2000,
    features: [
      '2,000 Council sessions/month',
      'Everything in Free',
      'Priority model routing',
      'Extended session history',
      'Email support',
      'BYOK supported'
    ],
    cta: 'Start Pro trial',
    ctaLink: '/register?plan=pro',
    popular: true
  },
  {
    id: 'teams',
    name: 'Teams',
    price: '$99',
    period: 'month',
    tagline: '',
    sessions: 10000,
    features: [
      '10,000 Council sessions/month',
      'Everything in Pro',
      'Team project sharing',
      'Usage analytics per member',
      'Priority support',
      'BYOK supported'
    ],
    cta: 'Start Teams trial',
    ctaLink: '/register?plan=teams',
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
    question: 'What counts as a Council session?',
    answer: 'A Council session is triggered when you send a prompt to VerityFlow. The AI council collaborates to verify dependencies, design architecture, generate code, and review output. All of this coordination counts as one session, regardless of how many models are involved.'
  },
  {
    question: 'Do credits expire?',
    answer: 'No. Credits purchased through one-time credit packs never expire. You can use them at your own pace without any time pressure or subscription commitment.'
  },
  {
    question: 'Can I use my own API keys?',
    answer: 'Yes. All plans support BYOK (Bring Your Own Keys). Connect your Anthropic, OpenAI, Mistral, Google AI, and Perplexity keys directly. VerityFlow never marks up provider costs — you pay providers directly at their standard rates.'
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
              <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">
                Compare
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
              <Link href="/compare" className="block text-gray-400 hover:text-white transition-colors">
                Compare
              </Link>
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
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-400">
              Choose a subscription or buy credits. All plans include the full AI council.
            </p>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-20">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-gray-900/50 border rounded-2xl p-8 flex flex-col ${
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
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-400">/ {plan.period}</span>
                  </div>
                  {plan.tagline && (
                    <p className="text-sm text-gray-500">{plan.tagline}</p>
                  )}
                </div>

                <div className="border-t border-gray-800 pt-6 mb-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-800">
                  <Link
                    href={plan.ctaLink}
                    className={`w-full px-6 py-3 rounded-lg font-semibold text-center transition-colors flex items-center justify-center gap-2 ${
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

          {/* BYOK Callout */}
          <div className="max-w-5xl mx-auto mb-20">
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">All plans support Bring Your Own Keys</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Connect your Anthropic, OpenAI, Mistral, Google AI, and Perplexity keys — or use a single OpenRouter key to cover all five models. Pay providers directly at cost. VerityFlow charges only for orchestration.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credit Packs */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Or buy credits — no subscription required
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
                Start building free. No credit card required.
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
              <div className="flex items-center gap-3 pt-2">
                <a href="https://twitter.com/verityflow" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://github.com/verityflowproject" target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
              <p className="text-xs text-gray-600 pt-4">© 2026 VerityFlow. All rights reserved.</p>
            </div>

            {/* Product Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">How it works</a></li>
                <li><a href="/#council" className="text-gray-400 hover:text-white transition-colors">The AI Council</a></li>
                <li><Link href="/compare" className="text-gray-400 hover:text-white transition-colors">Compare tools</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            {/* Developers Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><a href="https://github.com/verityflowproject" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1">GitHub <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
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
