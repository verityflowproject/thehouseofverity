'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight, ArrowDown } from 'lucide-react'

// Model colors
const MODEL_COLORS = {
  claude: '#FF6B6B',
  gpt: '#4ECDC4',
  codestral: '#F9C74F',
  gemini: '#F38181',
  perplexity: '#AA96DA',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Beta
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
              <a href="#lab" className="hover:text-white transition-colors">Lab</a>
              <a href="#field-data" className="hover:text-white transition-colors">Field Data</a>
              <a href="#council" className="hover:text-white transition-colors">AI Council</a>
              <a href="#hallucinations" className="hover:text-white transition-colors">Zero Hallucinations</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
              Sign in
            </button>
            <button className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Multi-layered gradient background with varying intensities */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large primary glow - left/center blue */}
          <div 
            className="absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full blur-[140px] opacity-30 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, #4A90E2 0%, #2E5C8A 30%, transparent 70%)`,
              animationDuration: '10s'
            }}
          />
          
          {/* Medium cyan/teal glow - right side */}
          <div 
            className="absolute top-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-25 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.gpt} 0%, #2A7A7A 40%, transparent 70%)`,
              animationDelay: '2s',
              animationDuration: '12s'
            }}
          />
          
          {/* Purple glow - bottom center */}
          <div 
            className="absolute bottom-1/4 left-1/3 w-[700px] h-[700px] rounded-full blur-[130px] opacity-20 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.perplexity} 0%, #6B4FA0 35%, transparent 65%)`,
              animationDelay: '5s',
              animationDuration: '11s'
            }}
          />
          
          {/* Pink/red glow - top right */}
          <div 
            className="absolute top-1/5 right-1/3 w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.gemini} 0%, #D15F5F 30%, transparent 60%)`,
              animationDelay: '1s',
              animationDuration: '9s'
            }}
          />
          
          {/* Small accent spots */}
          <div 
            className="absolute top-1/2 left-1/2 w-[400px] h-[400px] rounded-full blur-[90px] opacity-10 animate-float"
            style={{ 
              background: `radial-gradient(circle, #5B9EE8 0%, transparent 70%)`,
              animationDuration: '14s'
            }}
          />
          
          <div 
            className="absolute bottom-1/3 right-1/2 w-[350px] h-[350px] rounded-full blur-[85px] opacity-12 animate-float"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.codestral} 0%, transparent 70%)`,
              animationDelay: '3s',
              animationDuration: '13s'
            }}
          />
          
          <div 
            className="absolute top-2/3 left-2/3 w-[300px] h-[300px] rounded-full blur-[75px] opacity-08 animate-float"
            style={{ 
              background: `radial-gradient(circle, #8B7FD8 0%, transparent 65%)`,
              animationDelay: '4s',
              animationDuration: '15s'
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Navigation links above hero */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-gray-900/50 border border-gray-800 mb-12 text-sm text-gray-400">
              <a href="#lab" className="hover:text-white transition-colors">Lab</a>
              <span className="text-gray-700">|</span>
              <a href="#field-data" className="hover:text-white transition-colors">Field Data</a>
              <span className="text-gray-700">|</span>
              <a href="#council" className="hover:text-white transition-colors">AI Council</a>
              <span className="text-gray-700">|</span>
              <a href="#hallucinations" className="hover:text-white transition-colors">Zero Hallucinations</a>
            </div>

            {/* Headline */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-bold mb-8 leading-[0.95]">
              <span className="text-white">Your AI</span>
              <br />
              <span 
                className="inline-block bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text"
                style={{
                  textShadow: '0 0 80px rgba(99, 102, 241, 0.3)'
                }}
              >
                Engineering
              </span>{' '}
              <span className="text-white">Firm.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              VerityFlow deploys <span className="text-white font-medium">five specialized AI models</span> that collaborate as a structured team — reviewing each other's work, resolving conflicts, and shipping code you can{' '}
              <span className="text-white font-semibold">actually trust</span>.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <button className="px-9 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                Start building free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-9 py-4 text-gray-300 hover:text-white transition-colors flex items-center gap-2 group border border-gray-700 hover:border-gray-600 rounded-lg">
                See how it works
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                <span>Bring your own keys - no API markup</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Zero hallucinations</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Context never drifts</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Every line reviewed</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Bring your own keys</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom gradient fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#0a0a0f] pointer-events-none" />
      </section>

      {/* Transition Spacer with subtle glow */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] rounded-full blur-[150px] opacity-5"
            style={{ 
              background: `linear-gradient(90deg, ${MODEL_COLORS.perplexity} 0%, ${MODEL_COLORS.claude} 50%, ${MODEL_COLORS.gpt} 100%)`
            }}
          />
        </div>
        {/* Subtle separator line */}
        <div className="container mx-auto px-6">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent mx-auto" />
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-32 relative">
        {/* Top gradient fade */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#0a0a0f] to-transparent pointer-events-none" />
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="text-sm text-indigo-400 uppercase tracking-wider mb-4">How It Works</div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              A structured engineering process.
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Models don't take turns — they collaborate, verify, review, and only ship output<br />
              that passes every gate.
            </p>
          </div>

          {/* Collaboration Example */}
          <div className="max-w-7xl mx-auto mb-20">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-950/80 rounded-2xl border border-gray-800 overflow-hidden backdrop-blur-sm">
              {/* Header */}
              <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-400">COUNCIL SESSION</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs text-emerald-400 uppercase tracking-wider">Live</span>
                  </div>
                </div>
              </div>

              <div className="p-8">
                <h3 className="text-2xl font-bold mb-6">This is what collaboration actually looks like.</h3>
                
                <div className="space-y-6 font-mono text-sm">
                  {/* User Input */}
                  <div className="text-gray-400">
                    <span className="text-gray-600">$</span> Build a full-stack SaaS with auth, billing, and user dashboard
                  </div>

                  {/* Perplexity */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: MODEL_COLORS.perplexity, boxShadow: `0 0 8px ${MODEL_COLORS.perplexity}` }} />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Perplexity <span className="text-gray-600">Researcher</span></div>
                      <div className="text-gray-300">next-auth@0.5.0-beta.30 confirmed stable. MongoDBAdapter compatible. No breaking changes. Proceeding.</div>
                    </div>
                  </div>

                  {/* Claude */}
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: MODEL_COLORS.claude, boxShadow: `0 0 8px ${MODEL_COLORS.claude}` }} />
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Claude <span className="text-gray-600">Architect</span></div>
                      <div className="text-gray-300">
                        Architecture decision: users collection needs <code className="text-blue-400">`plan`</code> [enum: free/pro/teams] and <code className="text-blue-400">`usageCount`</code> [int]. Persisting to ProjectState.
                      </div>
                    </div>
                  </div>

                  <div className="text-gray-600 text-center py-2">...</div>
                </div>
              </div>
            </div>
          </div>

          {/* Process Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            <ProcessCard
              badge="REVIEW OUTCOMES"
              title="Every output has a verdict."
              description="Output passes review unchanged. Ships axis."
              icon="✓"
              iconColor="text-emerald-400"
            />
            <ProcessCard
              badge="SHARED MEMORY"
              title="Context that outlives every session."
              description="ProjectState.json • updated 4m ago"
              code={['architecture: "REST"', 'MongoDB', 'NextAuth.js']}
            />
            <ProcessCard
              badge="THE PIPELINE"
              title="Five roles. One output."
              models={[
                { name: 'Perplexity', desc: 'Verifies every dependency before anything is written', color: MODEL_COLORS.perplexity },
                { name: 'Claude', desc: 'Designs architecture. Arbitrates conflicts.', color: MODEL_COLORS.claude },
              ]}
            />
            <ProcessCard
              badge="HALLUCINATION FIREWALL"
              title="Perplexity checks before anyone writes a line."
              status={[
                { label: 'Unverified request', value: 'BLOCKED', color: 'text-red-400' },
                { label: 'After check', value: 'VERIFIED', color: 'text-emerald-400' }
              ]}
            />
          </div>
        </div>
        
        {/* Bottom gradient fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#0a0a0f] pointer-events-none" />
      </section>

      {/* Transition Spacer */}
      <div className="relative py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/3 w-[600px] h-[300px] rounded-full blur-[120px] opacity-5"
            style={{ background: `radial-gradient(circle, ${MODEL_COLORS.codestral} 0%, transparent 70%)` }}
          />
          <div 
            className="absolute top-1/2 right-1/3 w-[600px] h-[300px] rounded-full blur-[120px] opacity-5"
            style={{ background: `radial-gradient(circle, ${MODEL_COLORS.gemini} 0%, transparent 70%)` }}
          />
        </div>
      </div>

      {/* Role Assignment Section */}
      <section className="py-32 relative bg-gradient-to-b from-transparent via-indigo-950/10 to-transparent">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="text-sm text-indigo-400 uppercase tracking-wider mb-4">Role Assignment</div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                The right model.
                <br />
                <span className="text-indigo-400">For the right reason.</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Every role in your AI Council was earned. These aren't arbitrary assignments —
                each model holds its position because it has a documented, measurable
                advantage over every other model at that specific job.
              </p>
            </div>

            <div className="space-y-12">
              {/* Claude */}
              <RoleCard
                indicator="left"
                color={MODEL_COLORS.claude}
                name="Claude"
                version="v3 opus 4.6"
                role="Architect"
                tagline="Architecture needs a reasoner, not just a coder."
                benchmark="Highest benchmark: Long-horizon reasoning"
                description="Claude Opus consistently outperforms every other model on complex multi-step reasoning and decisions with cascading consequences. When an architecture choice made today shapes 40 files a week from now, you need a model that thinks in systems — not just syntax. Claude is also the only model in the council given arbitration authority, because resolving conflict requires explaining why one position is more defensible than another. That's a reasoning task, not a generation task."
              />

              {/* Perplexity */}
              <RoleCard
                indicator="left"
                color={MODEL_COLORS.perplexity}
                name="Perplexity"
                version="vSonar Pro"
                role="Researcher"
                tagline="Real-time truth beats trained-in memory."
                benchmark="Purpose-built for live web retrieval"
                description="Every other model in the council works from training data with a knowledge cutoff. Perplexity Sonar Pro queries live documentation in real time. When a package releases a breaking change the morning of your build, Claude doesn't know it happened. Perplexity does. No other model was even considered for this role — it's the only one in the industry purpose-built for live retrieval. Asking a generalist model to verify a package version is asking it to guess. Perplexity asks the internet."
              />

              {/* Codestral */}
              <RoleCard
                indicator="left"
                color={MODEL_COLORS.codestral}
                name="Codestral"
                version="v1.4.10"
                role="Implementer"
                tagline="A model trained only on code writes better code."
                benchmark="80+ Languages, code-native training"
                description="Mistral's Codestral is trained exclusively on code — not conversations, not essays, not general knowledge. That focused training translates directly to higher token efficiency and lower error rates on raw generation tasks compared to generalist models. When you need 300 lines of TypeScript written correctly on the first pass, you don't want a model that spent half its training data learning to write blog posts. Codestral is faster, lighter, and makes fewer implementation mistakes than any model outside its category."
              />

              {/* GPT */}
              <RoleCard
                indicator="left"
                color={MODEL_COLORS.gpt}
                name="GPT"
                version="v5.4"
                role="Generalist & Reviewer"
                tagline="The best reviewer is the one most likely to disagree."
                benchmark="Highest structured evaluation precision"
                description="Reviewing your own work is the most common failure mode in software engineering — and in AI. GPT-5.4 wasn't chosen for its code generation quality. It was chosen for its precision in structured evaluation: catching logical errors, security gaps, and edge cases that generation-focused models overlook precisely because they were optimized to produce output, not critique it. GPT-5.4 reviews Codestral's work because it thinks differently. That difference is the only difference that matters."
              />

              {/* Gemini */}
              <RoleCard
                indicator="left"
                color={MODEL_COLORS.gemini}
                name="Gemini"
                version="v3.1 Pro"
                role="Refactor Specialist"
                tagline="Only one model can hold your entire codebase in memory."
                benchmark="2M token context window"
                description="Gemini 3.1 Pro has a 2 million token context window. No other model in the council is even close. Sweeping 200 files for naming inconsistencies, architectural drift, and cross-module contradictions requires holding all of it in memory simultaneously — not sampling, not summarizing, but genuinely processing the full document. On large codebases, every other model has to make educated guesses about what they haven't seen. Gemini doesn't. That's not a feature. It's a structural advantage."
              />
            </div>

            <div className="mt-16 text-center text-sm text-gray-500">
              <p>Roles are reviewed when benchmarks shift. If a model earns a better position, it gets one.</p>
              <p className="mt-1">The council architecture is permanent. Which model fills each role is not.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 mt-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-sm text-gray-500">Your AI Engineering Firm</span>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 VerityFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.30; transform: scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.08; }
          33% { transform: translate(30px, -30px) scale(1.1); opacity: 0.12; }
          66% { transform: translate(-30px, 30px) scale(0.9); opacity: 0.10; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 10s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function ProcessCard({ badge, title, description, icon, iconColor, code, models, status }) {
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="text-xs text-indigo-400 uppercase tracking-wider mb-3">{badge}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-400">{description}</p>}
      {icon && <div className={`text-3xl mt-4 ${iconColor}`}>{icon}</div>}
      {code && (
        <div className="mt-4 space-y-1 font-mono text-xs text-gray-400">
          {code.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
      {models && (
        <div className="mt-4 space-y-3">
          {models.map((model, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: model.color }} />
              <div className="text-xs">
                <div className="font-semibold text-white">{model.name}</div>
                <div className="text-gray-400">{model.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {status && (
        <div className="mt-4 space-y-2 font-mono text-xs">
          {status.map((s, i) => (
            <div key={i}>
              <span className="text-gray-500">{s.label}</span>{' '}
              <span className={`font-semibold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function RoleCard({ indicator, color, name, version, role, tagline, benchmark, description }) {
  return (
    <div className="grid md:grid-cols-12 gap-8 items-start">
      {/* Left: Model Info */}
      <div className="md:col-span-3">
        <div className="flex items-center gap-3 mb-3">
          {indicator === 'left' && (
            <div 
              className="w-1 h-12 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 12px ${color}` }}
            />
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <h3 className="text-xl font-bold">{name}</h3>
            </div>
            <div className="text-sm text-gray-500">{version}</div>
          </div>
        </div>
        <div 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {role}
        </div>
        <div className="text-xs text-gray-500">{benchmark}</div>
      </div>

      {/* Right: Description */}
      <div className="md:col-span-9">
        <h4 className="text-2xl font-semibold mb-4">{tagline}</h4>
        <p className="text-gray-400 leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
