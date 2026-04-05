'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ChevronDown, Mail, ArrowLeft, Sparkles } from 'lucide-react'

const FAQ_SECTIONS = [
  {
    title: 'About VerityFlow',
    icon: '⚡',
    color: '#6366f1',
    questions: [
      {
        q: 'What is VerityFlow?',
        a: 'VerityFlow is an AI coding platform that deploys five specialized models as a structured engineering team — the AI Council. Unlike tools that use a single AI model for everything, VerityFlow assigns each model a specific role: Claude as the Architect, GPT-5.4 as the Generalist, Codestral as the Implementer, Gemini as the Refactor specialist, and Perplexity as the Researcher. Every output is reviewed by a different model before you see it.'
      },
      {
        q: 'How is VerityFlow different from Cursor or GitHub Copilot?',
        a: 'Cursor and Copilot are single-model tools — one AI writes the code and reviews the code. VerityFlow uses five specialized models that check each other\'s work. No model grades its own homework. We also maintain a persistent project state document so context never drifts across a long build session.'
      },
      {
        q: 'What is the "AI Council"?',
        a: 'The AI Council is VerityFlow\'s five-model team. Each model has a defined role and only works within that role. Claude designs. Codestral builds. GPT-5.4 reviews. Gemini refactors the full codebase. Perplexity verifies every dependency against live documentation before a single line is written. They share a living project memory document so decisions made in step one are still respected in step fifty.'
      },
      {
        q: 'What is the hallucination firewall?',
        a: 'Before any implementation begins, Perplexity Sonar Pro scans the task for external dependencies and verifies them against current documentation in real time. If a package can\'t be verified, the task is blocked until it\'s confirmed. This prevents the most common failure mode in AI coding tools: confidently using a library method that doesn\'t exist.'
      },
      {
        q: 'Who is VerityFlow for?',
        a: 'VerityFlow is built for software engineers and technical teams who need production-ready code, not prototypes. If you\'re shipping to users, need maintainable architecture, or can\'t afford hallucinated dependencies breaking production, VerityFlow is built for you. It\'s especially valuable for full-stack projects where consistency across frontend, backend, and database layers matters.'
      },
      {
        q: 'What languages and frameworks does VerityFlow support?',
        a: 'VerityFlow supports all major programming languages and frameworks. The AI Council is trained on modern stacks including JavaScript/TypeScript (React, Next.js, Node.js), Python (Django, Flask, FastAPI), Go, Rust, and more. The council adapts to your tech stack — just describe your project and the models will work within your constraints.'
      }
    ]
  },
  {
    title: 'Pricing & Credits',
    icon: '💳',
    color: '#10b981',
    questions: [
      {
        q: 'What counts as a Council session?',
        a: 'Each time you submit a prompt to the AI Council counts as one session. A session can involve up to five model calls depending on the task type and review pipeline. Each session costs approximately 30 credits, with the actual cost depending on task complexity and which models are used.'
      },
      {
        q: 'What\'s the difference between a subscription and credit packs?',
        a: 'Subscriptions (Free, Starter, Pro, Studio) give you a monthly credit allocation that replenishes each billing period, plus daily usage limits and extra features. Credit packs are one-time top-up purchases that never expire — buy them when you need them, use them at your own pace. Both types of credits are equivalent and never expire.'
      },
      {
        q: 'Do unused credits expire?',
        a: 'No. Credits never expire. If you buy 3,000 credits and use 1,000 this month, the remaining 2,000 will be there next month and the month after. Both subscription credits and top-up credits persist indefinitely.'
      },
      {
        q: 'What are daily credit limits?',
        a: 'Each plan has a daily credit usage limit to ensure fair access: Free (~90/day), Starter (~300/day), Pro (~1,500/day), Studio (unlimited). Daily limits reset at midnight UTC. This prevents any single user from consuming disproportionate resources.'
      },
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes. Cancel through the billing portal at any time. You keep your plan access until the end of your current billing period, and all remaining credits are preserved.'
      },
      {
        q: 'Is there a free trial?',
        a: 'The Free plan is permanently free with 50 credits on signup. There\'s no time-limited trial — you can use VerityFlow for free and upgrade when you need more credits or higher daily limits.'
      },
      {
        q: 'What do credits actually pay for?',
        a: 'Credits cover the full intelligent system: raw LLM API calls across five specialized models, intelligent routing to the right model for each task, the hallucination firewall, multi-model review pipeline, arbitration, and platform infrastructure. We apply a transparent markup on top of our actual API costs so you get the complete expert AI team. Every session includes an itemized cost breakdown so you always know exactly what you paid for.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through Stripe. All transactions are encrypted and PCI-compliant. We do not store your payment information on our servers.'
      }
    ]
  },
  {
    title: 'Technical',
    icon: '⚙️',
    color: '#8b5cf6',
    questions: [
      {
        q: 'Does context persist between sessions?',
        a: 'Yes. Every project has a ProjectState document that persists across all sessions. Architectural decisions, naming conventions, design patterns, dependencies — anything the council agrees on is stored and referenced in future sessions. Other tools start fresh every time. VerityFlow remembers.'
      },
      {
        q: 'How does the review pipeline work?',
        a: 'After Perplexity verifies dependencies, the task is categorized (architecture, implementation, refactor). The assigned model generates output. A different model reviews it — GPT reviews Codestral, Codestral reviews Claude. If conflicts arise, a third model arbitrates. The full review log is attached to every output you receive.'
      },
      {
        q: 'What happens if two models disagree?',
        a: 'Arbitration. A third model (not the generator, not the reviewer) evaluates both positions with full context and makes the final call. The decision is logged in ProjectState. If the same conflict appears in a later session, the arbitration is already resolved.'
      },
      {
        q: 'Can I see which model wrote what?',
        a: 'Yes. Every Council session produces a review log showing: which model handled the task, which model reviewed it, what issues were flagged, and whether arbitration occurred. Transparency is structural, not optional.'
      },
      {
        q: 'What if a better model comes along?',
        a: 'We swap it. The council architecture is permanent. Which model fills each role is not. Roles are reviewed when benchmarks shift. If a model earns a better position, it gets one. You\'ll be notified when roster changes happen.'
      },
      {
        q: 'Do you train on my code?',
        a: 'No. Your prompts and outputs are never used to train AI models — not ours (we don\'t train models), not the providers\' (our terms with Anthropic, OpenAI, Mistral, Google, and Perplexity prohibit it). Your code stays yours.'
      }
    ]
  }
]

export default function FAQPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openQuestions, setOpenQuestions] = useState({})

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`
    setOpenQuestions(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  // Filter FAQs based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_SECTIONS

    const query = searchQuery.toLowerCase()
    return FAQ_SECTIONS.map(section => ({
      ...section,
      questions: section.questions.filter(
        q =>
          q.q.toLowerCase().includes(query) ||
          q.a.toLowerCase().includes(query)
      )
    })).filter(section => section.questions.length > 0)
  }, [searchQuery])

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
                Compare
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
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
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 space-y-4 animate-fade-in">
              <a href="/#how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="block text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">
                Compare
              </Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <div className="pt-4 space-y-2">
                <Link href="/login" className="block w-full px-4 py-2 text-center text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-colors">
                  Sign in
                </Link>
                <Link href="/register" className="block w-full px-5 py-2 text-center bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                  Get started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Animated background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
          />
          <div 
            className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15 animate-pulse-slow"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animationDelay: '1s' }}
          />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Frequently Asked Questions</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 text-transparent bg-clip-text">
              Questions, answered.
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              Everything you need to know about VerityFlow, the AI Council, pricing, and how we're different.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="pb-20 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="space-y-16">
            {filteredSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="relative">
                {/* Section Header */}
                <div className="mb-8 flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                    style={{ 
                      backgroundColor: `${section.color}20`,
                      border: `1px solid ${section.color}30`,
                      boxShadow: `0 0 20px ${section.color}20`
                    }}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">{section.title}</h2>
                    <p className="text-sm text-gray-500">{section.questions.length} questions</p>
                  </div>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {section.questions.map((item, questionIndex) => {
                    const key = `${sectionIndex}-${questionIndex}`
                    const isOpen = openQuestions[key]
                    
                    return (
                      <div
                        key={questionIndex}
                        className="group relative bg-gray-900/30 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300 hover:border-gray-700 hover:shadow-xl"
                        style={{
                          boxShadow: isOpen ? `0 0 30px ${section.color}15` : 'none'
                        }}
                      >
                        {/* Glow effect on hover */}
                        <div 
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                          style={{
                            background: `radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${section.color}10 0%, transparent 50%)`
                          }}
                        />

                        <button
                          onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                          className="w-full p-6 text-left flex items-start justify-between gap-4 relative z-10"
                        >
                          <span className="text-lg font-medium text-white pr-8">{item.q}</span>
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                              isOpen ? 'rotate-180 text-indigo-400' : ''
                            }`}
                          />
                        </button>

                        {/* Answer */}
                        <div 
                          className={`overflow-hidden transition-all duration-300 ${
                            isOpen ? 'max-h-96' : 'max-h-0'
                          }`}
                        >
                          <div className="px-6 pb-6 text-gray-400 leading-relaxed relative z-10">
                            <div 
                              className="pl-4 border-l-2"
                              style={{ borderColor: section.color }}
                            >
                              {item.a}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredSections.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
              <p className="text-gray-400 mb-6">
                Try a different search term or browse all questions above.
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors"
              >
                Clear search
              </button>
            </div>
          )}

          {/* Still Have Questions CTA */}
          <div className="mt-20 p-12 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl text-center relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 opacity-30">
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
                style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
              />
            </div>

            <div className="relative z-10">
              <Mail className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-3">Still have questions?</h3>
              <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                We're here to help. Send us a message and we'll get back to you within 1-2 business days.
              </p>
              <Link
                href="/contact"
                className="inline-block px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">
                  Verity<span className="text-indigo-400">Flow</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your AI Engineering Firm.<br />Five models. One team.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/getting-started" className="text-gray-400 hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="/docs/credits" className="text-gray-400 hover:text-white transition-colors">Credit System</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>

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
