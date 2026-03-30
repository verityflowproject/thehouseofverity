'use client'

import { useState, useEffect } from 'react'
import { Check, ArrowRight } from 'lucide-react'

// Model colors matching the reference
const MODEL_COLORS = {
  claude: '#FF6B6B',      // Red
  gpt: '#4ECDC4',         // Teal
  codestral: '#95E1D3',   // Green/Teal
  gemini: '#F38181',      // Pink
  perplexity: '#AA96DA',  // Purple
}

export default function LandingPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        {/* Animated spotty gradient background - model colors */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Multiple gradient orbs with model colors */}
          <div 
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.claude} 0%, transparent 70%)`,
              animationDuration: '8s'
            }}
          />
          <div 
            className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-25 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.gpt} 0%, transparent 70%)`,
              animationDelay: '2s',
              animationDuration: '7s'
            }}
          />
          <div 
            className="absolute bottom-1/3 left-1/3 w-[450px] h-[450px] rounded-full blur-[110px] opacity-20 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.perplexity} 0%, transparent 70%)`,
              animationDelay: '4s',
              animationDuration: '9s'
            }}
          />
          <div 
            className="absolute top-1/2 right-1/3 w-[350px] h-[350px] rounded-full blur-[90px] opacity-15 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.gemini} 0%, transparent 70%)`,
              animationDelay: '1s',
              animationDuration: '10s'
            }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[380px] h-[380px] rounded-full blur-[100px] opacity-20 animate-pulse-slow"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.codestral} 0%, transparent 70%)`,
              animationDelay: '3s',
              animationDuration: '8s'
            }}
          />
          
          {/* Additional smaller spots for more texture */}
          <div 
            className="absolute top-1/4 right-1/2 w-[250px] h-[250px] rounded-full blur-[80px] opacity-10 animate-float"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.claude} 0%, transparent 70%)`,
              animationDuration: '12s'
            }}
          />
          <div 
            className="absolute bottom-1/3 left-1/2 w-[280px] h-[280px] rounded-full blur-[85px] opacity-15 animate-float"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.perplexity} 0%, transparent 70%)`,
              animationDelay: '5s',
              animationDuration: '11s'
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-emerald-300 font-medium">Five models. One codebase.</span>
            </div>

            {/* Headline with gradient */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
              Your AI
              <br />
              <span 
                className="inline-block bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-300 text-transparent bg-clip-text"
              >
                Engineering
              </span>
              <br />
              <span className="text-white">Firm.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              VerityFlow coordinates five specialized AI models to build production code. 
              Every decision debated. Every line reviewed. Zero hallucinations.
            </p>

            {/* CTAs */}
            <div className="flex items-center justify-center gap-4 mb-16">
              <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/20">
                Start building free
              </button>
              <button className="px-8 py-4 text-gray-300 hover:text-white transition-colors flex items-center gap-2 group">
                See how it works
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Feature badges */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400">
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
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-gray-500 rounded-full animate-scroll" />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed font-light">
              "Trust in AI doesn't come from a single model being <span className="text-white font-medium italic">smarter</span>. 
              It comes from having a <span className="text-indigo-400 font-medium">structured team</span> where 
              every decision is challenged and every output is verified."
            </p>
          </div>
        </div>
      </section>

      {/* Five Models Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Five models.
                <br />
                <span className="text-indigo-400">Zero echo chambers.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Every specialized AI plays a distinct role. Architecture. Research. Implementation. 
                Review. Context. No single model owns the truth.
              </p>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold">
                Your keys. Your costs.
                <br />
                <span className="text-indigo-400">No markup.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Bring your own API keys from Anthropic, OpenAI, Google, and Mistral. 
                Pay providers directly. We never touch your costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Council Session */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6">
                How the <span className="text-indigo-400">Council</span> Works
              </h2>
              <p className="text-xl text-gray-400">
                A structured engineering process. Not a chatbot.
              </p>
            </div>

            {/* Mock Terminal/Council Session */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
              {/* Terminal Header */}
              <div className="bg-gray-900/50 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-sm text-gray-400 font-mono">council-session-0001</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 uppercase tracking-wider">Live</span>
                </div>
              </div>

              {/* Terminal Content */}
              <div className="p-8 font-mono text-sm space-y-6">
                {/* User Prompt */}
                <div className="space-y-2">
                  <div className="text-gray-500">$ you</div>
                  <div className="text-gray-200 pl-4">
                    Build a SaaS authentication system with NextAuth, Stripe billing, and MongoDB...
                  </div>
                </div>

                {/* Council Responses */}
                <div className="space-y-4 pt-4">
                  <CouncilMessage 
                    model="perplexity" 
                    color={MODEL_COLORS.perplexity}
                    text="Verified: next-auth@5.0-beta, stripe@16.0, mongodb@6.3 ✓"
                  />
                  <CouncilMessage 
                    model="claude" 
                    color={MODEL_COLORS.claude}
                    text="Architectural decision: Use server actions for mutations. Separate auth config."
                  />
                  <CouncilMessage 
                    model="codestral" 
                    color={MODEL_COLORS.codestral}
                    text="Generated auth.ts, stripe-client.ts, user-model.ts. 487 lines."
                  />
                  <CouncilMessage 
                    model="gpt" 
                    color={MODEL_COLORS.gpt}
                    text="Review: Code follows conventions. Minor: Add error boundary to checkout flow."
                  />
                  <CouncilMessage 
                    model="gemini" 
                    color={MODEL_COLORS.gemini}
                    text="Context check: Naming consistent. userSchema matches User type across 8 files."
                  />
                </div>

                {/* Model Indicators */}
                <div className="flex items-center gap-3 pt-6 border-t border-gray-800">
                  <ModelDot color={MODEL_COLORS.claude} label="Claude" />
                  <ModelDot color={MODEL_COLORS.gpt} label="GPT" />
                  <ModelDot color={MODEL_COLORS.codestral} label="Codestral" />
                  <ModelDot color={MODEL_COLORS.gemini} label="Gemini" />
                  <ModelDot color={MODEL_COLORS.perplexity} label="Perplexity" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-16">
              <ProcessStep 
                number="1"
                title="You describe your project"
                description="Natural language prompts. No configuration files."
                badge="Start in seconds"
                color={MODEL_COLORS.gpt}
              />
              <ProcessStep 
                number="2"
                title="Perplexity verifies dependencies"
                description="Checks every package exists, current, and secure."
                badge="Hallucination firewall"
                color={MODEL_COLORS.perplexity}
              />
              <ProcessStep 
                number="3"
                title="Claude designs architecture"
                description="Makes opinionated decisions on structure and patterns."
                badge="No decision paralysis"
                color={MODEL_COLORS.claude}
              />
              <ProcessStep 
                number="4"
                title="Codestral writes implementation"
                description="Production-ready code following your conventions."
                badge="Complete, not partial"
                color={MODEL_COLORS.codestral}
              />
              <ProcessStep 
                number="5"
                title="GPT reviews for quality"
                description="Catches bugs, security issues, and convention drift."
                badge="Zero blind spots"
                color={MODEL_COLORS.gpt}
              />
              <ProcessStep 
                number="6"
                title="Gemini enforces consistency"
                description="Full-codebase context ensures nothing breaks."
                badge="Prevents regression"
                color={MODEL_COLORS.gemini}
              />
              <ProcessStep 
                number="7"
                title="Conflicts go to arbitration"
                description="Claude makes final call when models disagree."
                badge="Always decisive"
                color={MODEL_COLORS.claude}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Council */}
      <section className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold mb-6">
                Meet the <span className="text-indigo-400">Council</span>
              </h2>
              <p className="text-xl text-gray-400">
                Five specialized models, each with a distinct role. No single point of failure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <ModelCard 
                name="Claude"
                version="Opus 4.6"
                role="Architect"
                description="Makes architectural decisions with conviction."
                color={MODEL_COLORS.claude}
                tags={["Architecture", "Arbitration"]}
              />
              <ModelCard 
                name="GPT"
                version="5.4"
                role="Implementation"
                description="Reviews code for correctness and maintainability."
                color={MODEL_COLORS.gpt}
                tags={["Review", "Implementation"]}
              />
              <ModelCard 
                name="Codestral"
                version="Latest"
                role="Code Gen"
                description="Generates deterministic, production-ready code."
                color={MODEL_COLORS.codestral}
                tags={["Code Gen", "Low Temp"]}
              />
              <ModelCard 
                name="Gemini"
                version="3.1 Pro"
                role="Context"
                description="Enforces naming conventions across the entire codebase."
                color={MODEL_COLORS.gemini}
                tags={["Context", "Consistency"]}
              />
              <ModelCard 
                name="Perplexity"
                version="Sonar-Pro"
                role="Research"
                description="Verifies package versions and catches hallucinations."
                color={MODEL_COLORS.perplexity}
                tags={["Research", "Verification"]}
              />
              
              {/* CTA Card */}
              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/30 p-8 flex flex-col items-center justify-center text-center">
                <h3 className="text-2xl font-bold mb-4">
                  Put the whole council to work
                </h3>
                <p className="text-gray-400 mb-6">
                  Start building with all five models for free.
                </p>
                <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-semibold transition-colors">
                  Start free
                </button>
              </div>
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
          50% { opacity: 0.25; transform: scale(1.1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        
        @keyframes scroll {
          0% { transform: translateY(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(12px); opacity: 0; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

function CouncilMessage({ model, color, text }) {
  return (
    <div className="flex items-start gap-3">
      <div 
        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
      />
      <div className="flex-1">
        <div className="text-gray-500 text-xs mb-1">{model}</div>
        <div className="text-gray-200">{text}</div>
      </div>
    </div>
  )
}

function ModelDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div 
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}

function ProcessStep({ number, title, description, badge, color }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0">
        <div 
          className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-xl font-bold"
          style={{ borderColor: color, color }}
        >
          {number}
        </div>
      </div>
      <div className="flex-1 pt-2">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 text-lg mb-3">{description}</p>
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs font-mono"
          style={{ 
            backgroundColor: `${color}20`, 
            color,
            border: `1px solid ${color}40`
          }}
        >
          {badge}
        </span>
      </div>
    </div>
  )
}

function ModelCard({ name, version, role, description, color, tags }) {
  return (
    <div className="bg-gray-900/50 rounded-2xl border border-gray-800 p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
            />
            <h3 className="text-xl font-bold">{name}</h3>
          </div>
          <div className="text-sm text-gray-500">{version}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <span 
          className="inline-block px-3 py-1 rounded-full text-xs font-medium"
          style={{ 
            backgroundColor: `${color}20`, 
            color 
          }}
        >
          {role}
        </span>
      </div>
      
      <p className="text-gray-400 text-sm mb-4">{description}</p>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span 
            key={i}
            className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-400"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}
