'use client'

import { useState, useEffect } from 'react'
import { Check } from 'lucide-react'

// Model colors and data
const MODELS = {
  claude: { color: '#FF6B6B', name: 'Claude', version: 'Opus 4.6', role: 'Architect' },
  gpt: { color: '#4ECDC4', name: 'GPT', version: '5.4', role: 'Implementation' },
  codestral: { color: '#95E1D3', name: 'Codestral', version: 'latest', role: 'Code Gen' },
  gemini: { color: '#F38181', name: 'Gemini', version: '3.1 Pro', role: 'Context' },
  perplexity: { color: '#AA96DA', name: 'Perplexity', version: 'Sonar-Pro', role: 'Research' },
}

const COUNCIL_MESSAGES = [
  { model: 'perplexity', text: 'Verified: next-auth@5.0-beta, stripe@16.0...' },
  { model: 'claude', text: 'Architectural decision: Use server actions for mutations.' },
  { model: 'codestral', text: 'Generated auth.ts with NextAuth v5 config.' },
  { model: 'gpt', text: 'Review: Code follows conventions. Minor: Add error boundary.' },
  { model: 'gemini', text: 'Context check: Naming consistent across 12 files.' },
]

export default function LandingPage() {
  const [councilIndex, setCouncilIndex] = useState(0)
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])

  // Council message animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCouncilIndex((prev) => (prev + 1) % COUNCIL_MESSAGES.length)
    }, 1200)
    return () => clearInterval(timer)
  }, [])

  // Scroll observer for process steps
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0')
            setVisibleSteps((prev) => [...new Set([...prev, stepIndex])])
          }
        })
      },
      { threshold: 0.3 }
    )

    document.querySelectorAll('[data-step]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0A0F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold tracking-tight">
              <span className="text-white">Verity</span>
              <span className="text-indigo-400">Flow</span>
            </div>
            <div className="hidden md:flex gap-6 text-sm">
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition">
                How It Works
              </a>
              <a href="#council" className="text-gray-400 hover:text-white transition">
                Council
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm border border-white/10 rounded-lg hover:border-white/20 transition">
              Sign In
            </button>
            <button className="px-4 py-2 text-sm bg-indigo-500 rounded-lg hover:bg-indigo-600 transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a2e_1px,transparent_1px),linear-gradient(to_bottom,#1a1a2e_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px]" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <div className="space-y-8 animate-fade-in-up">
              {/* Status pill */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-mono">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Five models. One codebase.
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Your AI
                <br />
                <span className="text-indigo-400">Engineering</span>
                <br />
                Firm.
              </h1>

              {/* Subheading */}
              <p className="text-xl text-gray-400 max-w-lg">
                VerityFlow coordinates five specialized AI models to build production code.
                Every decision debated. Every line reviewed. Zero hallucinations.
              </p>

              {/* CTAs */}
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition text-lg font-medium">
                  Start building free
                </button>
                <button className="px-6 py-3 border border-white/10 rounded-lg hover:border-white/20 transition text-lg">
                  See how it works
                </button>
              </div>

              {/* Trust signals */}
              <div className="flex flex-col gap-3 pt-4">
                {[
                  'Zero hallucinations',
                  'Context never drifts',
                  'Every line reviewed',
                ].map((signal) => (
                  <div key={signal} className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-indigo-400" />
                    </div>
                    {signal}
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Council Panel */}
            <div className="relative animate-fade-in-up animation-delay-300">
              <div className="bg-[#1a1a2e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                {/* Window header */}
                <div className="flex items-center justify-between px-4 py-3 bg-[#0f0f1a] border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* Prompt bar */}
                <div className="px-4 py-3 bg-[#13131f] border-b border-white/5">
                  <div className="text-sm text-gray-400 font-mono">
                    Build a SaaS authentication system with NextAuth...
                    <span className="inline-block w-1 h-4 bg-indigo-400 ml-1 animate-blink" />
                  </div>
                </div>

                {/* Council messages */}
                <div className="p-4 space-y-3 h-[300px] overflow-hidden">
                  {COUNCIL_MESSAGES.slice(0, councilIndex + 1).map((msg, i) => {
                    const model = MODELS[msg.model as keyof typeof MODELS]
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 animate-fade-in-up"
                        style={{ animationDelay: `${i * 200}ms` }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{ backgroundColor: model.color }}
                        />
                        <div>
                          <div className="text-xs text-gray-500 font-mono mb-1">
                            {model.name} · {model.role}
                          </div>
                          <div className="text-sm text-gray-300">{msg.text}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Footer with model dots */}
                <div className="px-4 py-3 bg-[#0f0f1a] border-t border-white/10 flex items-center gap-4">
                  {Object.entries(MODELS).map(([key, model]) => (
                    <div key={key} className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: model.color }}
                      />
                      <span className="text-xs text-gray-500 font-mono">{model.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-24 relative">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            How the <span className="text-indigo-400">Council</span> Works
          </h2>

          <div className="max-w-3xl mx-auto relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/50 to-transparent" />

            {/* Steps */}
            <div className="space-y-12">
              {[
                {
                  number: 1,
                  title: 'You describe your project',
                  description: 'Natural language prompts. No configuration files.',
                  badge: 'Start in seconds',
                  color: '#4ECDC4',
                },
                {
                  number: 2,
                  title: 'Perplexity verifies dependencies',
                  description: 'Checks every package exists, current, and secure.',
                  badge: 'Hallucination firewall',
                  color: '#AA96DA',
                },
                {
                  number: 3,
                  title: 'Claude designs architecture',
                  description: 'Makes opinionated decisions on structure and patterns.',
                  badge: 'No decision paralysis',
                  color: '#FF6B6B',
                },
                {
                  number: 4,
                  title: 'Codestral writes implementation',
                  description: 'Production-ready code following your conventions.',
                  badge: 'Complete, not partial',
                  color: '#95E1D3',
                },
                {
                  number: 5,
                  title: 'GPT reviews for quality',
                  description: 'Catches bugs, security issues, and convention drift.',
                  badge: 'Zero blind spots',
                  color: '#4ECDC4',
                },
                {
                  number: 6,
                  title: 'Gemini enforces consistency',
                  description: 'Full-codebase context ensures nothing breaks.',
                  badge: 'Prevents regression',
                  color: '#F38181',
                },
                {
                  number: 7,
                  title: 'Conflicts go to arbitration',
                  description: 'Claude makes final call when models disagree.',
                  badge: 'Always decisive',
                  color: '#FF6B6B',
                },
              ].map((step, index) => (
                <div
                  key={index}
                  data-step={index}
                  className={`flex gap-6 transition-all duration-700 ${
                    visibleSteps.includes(index)
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  }`}
                >
                  {/* Number circle */}
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 border-2"
                    style={{
                      backgroundColor: step.color + '20',
                      borderColor: step.color,
                      color: step.color,
                    }}
                  >
                    {step.number}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-12">
                    <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-400 mb-3">{step.description}</p>
                    <div className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-mono text-indigo-300">
                      {step.badge}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Model Cards */}
      <section id="council" className="py-24 bg-[#0f0f1a] relative">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-4">
            Meet the <span className="text-indigo-400">Council</span>
          </h2>
          <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
            Five specialized models, each with a distinct role. No single point of failure.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Model cards */}
            {Object.entries(MODELS).map(([key, model]) => (
              <div
                key={key}
                className="bg-[#1a1a2e] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: model.color }}
                  />
                  <div>
                    <div className="font-bold">{model.name}</div>
                    <div className="text-xs text-gray-500 font-mono">{model.version}</div>
                  </div>
                </div>

                <div className="inline-block px-2 py-1 bg-white/5 rounded text-xs font-mono text-gray-400 mb-3">
                  {model.role}
                </div>

                <p className="text-sm text-gray-400 mb-4">
                  {key === 'claude' && 'Makes architectural decisions with conviction.'}
                  {key === 'gpt' && 'Reviews code for correctness and maintainability.'}
                  {key === 'codestral' && 'Generates deterministic, production-ready code.'}
                  {key === 'gemini' && 'Enforces naming conventions across the entire codebase.'}
                  {key === 'perplexity' && 'Verifies package versions and catches hallucinations.'}
                </p>

                <div className="flex flex-wrap gap-2">
                  {key === 'claude' && ['Architecture', 'Arbitration'].map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {key === 'gpt' && ['Review', 'Implementation'].map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {key === 'codestral' && ['Code Gen', 'Low Temp'].map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {key === 'gemini' && ['Context', 'Consistency'].map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                  {key === 'perplexity' && ['Research', 'Verification'].map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-white/5 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* CTA Card */}
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-2 border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-bold mb-3">
                Put the whole
                <br />
                council to work
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Start building with all five models for free.
              </p>
              <button className="px-6 py-3 bg-indigo-500 rounded-lg hover:bg-indigo-600 transition font-medium">
                Start free
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-lg font-bold mb-1">
                <span className="text-white">Verity</span>
                <span className="text-indigo-400">Flow</span>
              </div>
              <div className="text-sm text-gray-500">Your AI Engineering Firm</div>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 VerityFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animation-delay-300 {
          animation-delay: 300ms;
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </div>
  )
}
