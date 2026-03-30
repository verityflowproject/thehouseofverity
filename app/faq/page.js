'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Menu, X, Search, ChevronDown, Mail } from 'lucide-react'

const FAQ_SECTIONS = [
  {
    title: 'About VerityFlow',
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
    questions: [
      {
        q: 'What counts as a Council session?',
        a: 'Each time you submit a prompt to the AI Council counts as one session, regardless of how many models are invoked internally. A session can involve up to five model calls depending on the task type and review pipeline.'
      },
      {
        q: 'What\'s the difference between a subscription and credits?',
        a: 'Subscriptions (Free, Pro, Teams) give you a monthly allowance of Council sessions that resets each billing period. Credits are one-time purchases that never expire — buy them when you need them, use them at your own pace. You can mix both: use your monthly allowance first, then top up with credits.'
      },
      {
        q: 'Do unused credits expire?',
        a: 'No. Credits never expire. If you buy 3,000 credits and use 1,000 this month, the remaining 2,000 will be there next month and the month after.'
      },
      {
        q: 'Do unused monthly sessions roll over?',
        a: 'No — subscription sessions reset monthly on your billing date. Credits are the better option if you have variable usage month to month.'
      },
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes. Cancel through the billing portal at any time. You keep Pro or Teams access until the end of your current billing period.'
      },
      {
        q: 'Is there a free trial?',
        a: 'The Free plan is permanently free with 50 sessions per month. There\'s no time-limited trial — you can use VerityFlow for free indefinitely and upgrade when you need more.'
      },
      {
        q: 'How much does each session cost with BYOK?',
        a: 'With BYOK, you only pay your API providers directly at their published rates (typically $0.01-0.15 per 1K tokens depending on the model). VerityFlow charges zero markup on provider costs. You only pay for the orchestration layer through your subscription or credit pack.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through Stripe. All transactions are encrypted and PCI-compliant. We do not store your payment information on our servers.'
      }
    ]
  },
  {
    title: 'Bring Your Own Keys (BYOK)',
    questions: [
      {
        q: 'What is BYOK?',
        a: 'BYOK (Bring Your Own Keys) means you connect your own API keys from Anthropic, OpenAI, Mistral, Google AI, and Perplexity directly to VerityFlow. When you use BYOK, model calls go through your accounts — you pay the providers directly at their published rates with no markup from VerityFlow. You\'re only charged for the VerityFlow orchestration layer (your subscription or credits).'
      },
      {
        q: 'Do I need five separate API accounts?',
        a: 'Not necessarily. The easiest path is a single OpenRouter account (openrouter.ai) — one key gives you access to all five Council models. Fund your OpenRouter account once and VerityFlow routes the right model to each role automatically. Alternatively you can use individual provider keys for more control.'
      },
      {
        q: 'Are my API keys safe?',
        a: 'Yes. All keys are encrypted at rest using AES-256-GCM encryption before being stored. They are never logged, never sent to third parties, and can be deleted instantly from your settings. The encryption key lives only on VerityFlow\'s servers and is never exposed to the frontend.'
      },
      {
        q: 'What happens if I don\'t add any API keys?',
        a: 'VerityFlow will use platform-managed API keys and deduct credits from your balance per session. This is the zero-setup path — buy credits and start building immediately with no API account setup required.'
      },
      {
        q: 'Can I switch between BYOK and credits?',
        a: 'Yes, at any time. VerityFlow automatically detects whether you have BYOK keys configured. If you do, it uses them. If you don\'t, it falls back to platform keys and deducts credits. You can even mix — if you have individual provider keys for some models but not others, VerityFlow uses your keys where available and falls back to platform keys for the rest.'
      },
      {
        q: 'Which API providers do I need accounts with?',
        a: 'For full BYOK coverage: Anthropic (Claude), OpenAI (GPT), Mistral (Codestral), Google AI Studio (Gemini), and Perplexity. Alternatively, a single OpenRouter account covers all five. Typical monthly costs with BYOK range from $5-50 depending on usage, significantly less than most AI coding subscriptions.'
      }
    ]
  },
  {
    title: 'Technical',
    questions: [
      {
        q: 'What models does VerityFlow use?',
        a: 'Claude Opus 4.6 (Architect), GPT-5.4 via OpenAI Responses API (Generalist), Codestral Latest (Implementer), Gemini 3.1 Pro Preview (Refactor), and Perplexity Sonar Pro (Researcher). For simple tasks, VerityFlow\'s smart routing may use lighter variants (Claude Haiku, Gemini Flash, GPT-4o mini) to reduce cost without impacting output quality.'
      },
      {
        q: 'What is the ProjectState document?',
        a: 'The ProjectState is VerityFlow\'s shared memory system. It\'s a living document stored in MongoDB that every model reads before responding. It contains architectural decisions, naming conventions, verified dependencies, the current task, and the last 20 review log entries. This is why context doesn\'t drift in VerityFlow — every model starts from the same ground truth, regardless of when it joins the session.'
      },
      {
        q: 'Does VerityFlow store my code?',
        a: 'VerityFlow stores prompt content and model outputs as part of your project session history. This is what powers the review log and persistent context. You can delete a project and its associated data at any time from the dashboard. We never use your code to train models or share it with third parties.'
      },
      {
        q: 'What happens when models disagree?',
        a: 'When the reviewing model flags issues with the implementing model\'s output, VerityFlow triggers an arbitration protocol. Claude re-reads both outputs, compares them against the project\'s architectural decisions, picks the correct approach (or produces a corrected version itself), and writes a rationale you can read in the session log. Every arbitration decision is logged and auditable.'
      },
      {
        q: 'Can I export my project code?',
        a: 'Yes. Pro and Teams plans include full project export. You can download all generated code, the complete ProjectState document, and the full session history as a ZIP archive. The Free plan allows copying individual outputs but not bulk export.'
      },
      {
        q: 'Does VerityFlow work offline?',
        a: 'No. VerityFlow requires an internet connection because all AI model calls happen server-side through provider APIs. The ProjectState is also stored in the cloud for persistence across devices and sessions.'
      },
      {
        q: 'How fast is a typical Council session?',
        a: 'Simple tasks (generate a function, fix a bug) complete in 10-30 seconds. Complex tasks (design a full feature, refactor a module) take 1-3 minutes depending on the number of review rounds. The hallucination firewall adds 3-5 seconds upfront but prevents costly mistakes downstream.'
      },
      {
        q: 'Can I integrate VerityFlow with my IDE?',
        a: 'Not yet. VerityFlow currently runs as a web application. IDE extensions (VS Code, JetBrains) are on our roadmap for Q2 2026. For now, you can copy-paste between VerityFlow and your editor, or use the export feature to download generated files directly.'
      }
    ]
  },
  {
    title: 'Account & Billing',
    questions: [
      {
        q: 'How do I change my plan?',
        a: 'Go to Dashboard → Billing. You can upgrade or downgrade at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.'
      },
      {
        q: 'Can I get a refund?',
        a: 'Subscription charges are non-refundable after the billing period starts. Credit purchases are non-refundable once credits have been used. If you have unused credits and want a refund, contact support@verityflow.io and we\'ll review it case by case.'
      },
      {
        q: 'Do you offer team billing?',
        a: 'The Teams plan includes team features. Each team member uses the shared session pool. Contact support@verityflow.io for invoicing or custom team arrangements.'
      },
      {
        q: 'What happens to my data if I cancel?',
        a: 'Your projects, code, and session history remain accessible for 90 days after cancellation. You can download everything during this period. After 90 days, all data is permanently deleted. Reactivating your subscription within 90 days restores full access immediately.'
      },
      {
        q: 'Can I transfer my account to someone else?',
        a: 'No. Accounts are non-transferable. If you\'re part of a team and need to change ownership, the team admin can remove you and add the new owner through the Teams dashboard. For individual accounts, the new user must create their own account.'
      },
      {
        q: 'Do you offer student or nonprofit discounts?',
        a: 'Yes. Students with a valid .edu email and registered nonprofits receive 50% off Pro plans. Contact support@verityflow.io with proof of eligibility (student ID or nonprofit documentation) and we\'ll apply the discount manually.'
      }
    ]
  },
  {
    title: 'Security & Privacy',
    questions: [
      {
        q: 'Is my data encrypted?',
        a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). API keys use an additional encryption layer (AES-256-GCM) with keys stored in a secure vault, never in the database alongside encrypted data.'
      },
      {
        q: 'Who can see my projects?',
        a: 'Only you. Projects are private by default. On Teams plans, projects can be shared with specific team members you invite. VerityFlow staff never access your projects except during support requests when you explicitly grant temporary access.'
      },
      {
        q: 'Do you train AI models on my code?',
        a: 'No. VerityFlow does not train models. We use third-party AI providers (Anthropic, OpenAI, etc.) via their APIs. Your prompts and outputs are subject to those providers\' data policies. When using BYOK, you control the relationship directly with each provider.'
      },
      {
        q: 'Is VerityFlow SOC 2 compliant?',
        a: 'We are working toward SOC 2 Type II certification, expected Q3 2026. Our infrastructure is hosted on AWS in SOC 2-compliant regions, and we follow SOC 2 security best practices today. Enterprise customers can request our current security documentation.'
      },
      {
        q: 'Can I use VerityFlow for proprietary or confidential code?',
        a: 'Yes. With BYOK, your code goes through your own API accounts with providers like Anthropic and OpenAI, subject to their enterprise data policies (most offer zero-retention options for business accounts). VerityFlow itself stores only what\'s necessary for the review log and can delete it on request.'
      }
    ]
  }
]

export default function FAQPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openQuestion, setOpenQuestion] = useState(null)

  // Filter questions based on search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return FAQ_SECTIONS

    const query = searchQuery.toLowerCase()
    return FAQ_SECTIONS.map(section => ({
      ...section,
      questions: section.questions.filter(
        q => q.q.toLowerCase().includes(query) || q.a.toLowerCase().includes(query)
      )
    })).filter(section => section.questions.length > 0)
  }, [searchQuery])

  const toggleQuestion = (sectionIndex, questionIndex) => {
    const key = `${sectionIndex}-${questionIndex}`
    setOpenQuestion(openQuestion === key ? null : key)
  }

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
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
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
              <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">
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
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold mb-4">
                Frequently asked questions
              </h1>
              <p className="text-xl text-gray-400">
                Everything you need to know about VerityFlow.
              </p>
            </div>

            {/* Search Input */}
            <div className="mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* FAQ Sections */}
            <div className="space-y-12 mb-12">
              {filteredSections.map((section, sectionIndex) => (
                <div key={sectionIndex}>
                  <h2 className="text-2xl font-bold mb-6 text-white">
                    {section.title}
                  </h2>
                  <div className="space-y-3">
                    {section.questions.map((item, questionIndex) => {
                      const isOpen = openQuestion === `${sectionIndex}-${questionIndex}`
                      return (
                        <div
                          key={questionIndex}
                          className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden transition-colors hover:border-gray-700"
                        >
                          <button
                            onClick={() => toggleQuestion(sectionIndex, questionIndex)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left"
                          >
                            <span className="text-lg font-semibold text-white pr-4">
                              {item.q}
                            </span>
                            <ChevronDown
                              className={`w-5 h-5 flex-shrink-0 transition-transform ${
                                isOpen ? 'rotate-180 text-indigo-400' : 'text-gray-500'
                              }`}
                            />
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-6 animate-slide-down">
                              <p className="text-gray-400 leading-relaxed">
                                {item.a}
                              </p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredSections.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No questions found matching "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Contact CTA */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/30 rounded-2xl p-8 text-center">
              <Mail className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold mb-3">
                Can't find your answer?
              </h3>
              <p className="text-gray-400 mb-6">
                Email us and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@verityflow.io"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
              >
                support@verityflow.io
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 mt-32">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
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

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><a href="https://github.com/verityflowproject" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1">GitHub <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a></li>
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

      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
