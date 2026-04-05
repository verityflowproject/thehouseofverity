import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

const PRINCIPLES = [
  {
    title: 'Quality over speed',
    desc: 'A session takes 30–90 seconds because five models are working in sequence. That\'s intentional. Fast and wrong is worse than thorough and right. We optimized for output you can actually ship, not output that appears instantly.'
  },
  {
    title: 'No model grades its own homework',
    desc: 'Every piece of output is reviewed by a different model than the one that produced it. Codestral implements. GPT reviews. Gemini refactors. The model that wrote the code never evaluates its own work.'
  },
  {
    title: 'Persistent context, always',
    desc: 'ProjectState is a living document that follows every session. Architectural decisions, naming conventions, file structure, open tasks — all persisted and referenced automatically. Context drift is one of the biggest causes of inconsistent AI output. We built to eliminate it.'
  },
  {
    title: 'Verify before you build',
    desc: 'The hallucination firewall runs before any implementation begins. Perplexity Sonar Pro checks every external dependency against live documentation in real time. If a package or API can\'t be verified, the task is blocked. We\'d rather slow down than build on a foundation that doesn\'t exist.'
  },
  {
    title: 'Transparency over opacity',
    desc: 'Every session\'s review log is available to you. You can see what each model flagged, what was auto-fixed, what went to arbitration, and exactly what it cost in credits. There are no black boxes in VerityFlow.'
  },
]

const COUNCIL_ROLES = [
  { model: 'Claude', role: 'Architect', desc: 'Designs the solution structure, defines file organization, and creates the implementation plan before any code is written.', color: '#FF6B6B' },
  { model: 'Perplexity', role: 'Researcher', desc: 'Verifies all external dependencies, APIs, and libraries against live documentation. The hallucination firewall.', color: '#AA96DA' },
  { model: 'Codestral', role: 'Implementer', desc: 'Writes the actual code based on Claude\'s architecture plan. Specialized in code generation across all major languages.', color: '#F9C74F' },
  { model: 'Gemini', role: 'Refactor', desc: 'Reviews the implementation for code quality, patterns, redundancy, and optimization opportunities.', color: '#F38181' },
  { model: 'GPT-4', role: 'Reviewer', desc: 'Performs the final review for correctness, completeness, and alignment with the original requirements.', color: '#4ECDC4' },
]

export default function AboutPage() {
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
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          {/* Hero */}
          <div className="mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-6">
              About VerityFlow
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              AI should work like an<br />
              <span className="text-indigo-400">engineering team</span>,<br />
              not a single intern.
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed max-w-2xl">
              We built VerityFlow because we were tired of AI tools that confidently produce wrong code. The problem isn't the models — it's using one model for everything.
            </p>
          </div>

          {/* Why We Built It */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-6">Why we built this</h2>
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                Every AI coding tool in 2024 was built on the same flawed assumption: one very smart model, working alone, is enough. Give it the right prompt, and it'll produce production-ready code.
              </p>
              <p>
                It doesn't. Not reliably. Not at scale. Not for codebases that need to be maintained, extended, and shipped to real users.
              </p>
              <p>
                The failure modes are predictable: the model hallucinates a library that doesn't exist. It forgets architectural decisions made twenty prompts ago. It reviews its own output and concludes it's correct. It uses a deprecated API because its training data is months old.
              </p>
              <p>
                These aren't model intelligence problems. They're structural problems. No engineer works in isolation, never has their code reviewed, never checks documentation before using an unfamiliar library. So why would AI?
              </p>
              <p className="text-white font-medium">
                VerityFlow applies the same structure that makes human engineering teams reliable: specialization, peer review, and shared persistent context.
              </p>
            </div>
          </div>

          {/* How the Council Works */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-4">How the Council works</h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed">
              Five models. Each with a defined role. Each checking the work of the others. None reviewing their own output.
            </p>

            <div className="relative">
              <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-indigo-500/40 via-purple-500/20 to-transparent hidden md:block" />
              <div className="space-y-4">
                {COUNCIL_ROLES.map(({ model, role, desc, color }, i) => (
                  <div key={model} className="flex gap-6 items-start">
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-black z-10"
                      style={{ backgroundColor: color }}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-semibold text-lg">{model}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 font-mono">{role}</span>
                      </div>
                      <p className="text-gray-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
              <p className="text-gray-300 leading-relaxed">
                Every session also maintains a shared <strong className="text-white">ProjectState</strong> document — a living record of architectural decisions, naming conventions, file structure, and open tasks. This document is read at the start of every session and updated at the end. Models 2 through 5 always know what Model 1 decided.
              </p>
            </div>
          </div>

          {/* Our Principles */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-10">Our principles</h2>
            <div className="space-y-6">
              {PRINCIPLES.map(({ title, desc }) => (
                <div key={title} className="flex gap-5 p-6 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
                  <span className="text-indigo-400 text-lg flex-shrink-0 mt-0.5">✦</span>
                  <div>
                    <p className="text-white font-semibold mb-2">{title}</p>
                    <p className="text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Built for Builders */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold mb-6">Built for builders who ship</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              VerityFlow isn't a toy. It's not for generating boilerplate or writing README files. It's built for engineers and teams who are building real products — products with users, with databases, with APIs that need to be maintained.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full-stack engineers', desc: 'Building across frontend, backend, and database layers where consistency across all three matters.' },
                { label: 'Early-stage startups', desc: 'Moving fast without a large team. VerityFlow extends your capacity without adding headcount.' },
                { label: 'Solo developers', desc: 'Working on production systems that need code quality beyond what a solo reviewer can catch.' },
                { label: 'Technical teams', desc: 'Using AI as a genuine force multiplier, not a shortcut that creates more problems than it solves.' },
              ].map(({ label, desc }) => (
                <div key={label} className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
                  <p className="text-white font-medium mb-2">{label}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl text-center">
            <h3 className="text-2xl font-bold mb-3">Ready to try it?</h3>
            <p className="text-gray-400 mb-6">
              Create a free account and run your first Council session in minutes.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
              >
                Get started free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-700 hover:border-gray-600 text-gray-300 hover:text-white rounded-lg font-medium transition-colors"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>

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
