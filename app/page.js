'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Check, ArrowRight, ArrowDown, Menu, X, User } from 'lucide-react'
import { useUser } from '@/hooks/use-user'

// Model colors
const MODEL_COLORS = {
  claude: '#FF6B6B',
  gpt: '#4ECDC4',
  codestral: '#F9C74F',
  gemini: '#F38181',
  perplexity: '#AA96DA',
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { data: session, status } = useUser()
  const isAuthenticated = status === 'authenticated' && session?.user

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-xs px-2 py-0.የ rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Beta
              </span>
            </Link>

            {/* Center: Nav Links (desktop only) */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded-full border border-indigo-500/40 text-indigo-300 hover:text-white transition-colors animate-gradient-glow"
              >
                Dashboard
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
            </div>

            {/* Right: CTAs (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              {status === 'loading' ? (
                <div className="w-24 h-8 rounded-lg bg-gray-800/50 animate-pulse" />
              ) : isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                    </div>
                    <span className="max-w-[160px] truncate">{session.user.email}</span>
                  </div>
                  <Link href="/dashboard" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                    Sign in
                  </Link>
                  <Link href="/register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-800 pt-4 space-y-4 animate-slide-down">
              <a href="/#how-it-works" className="block text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="block text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">
                Dashboard
              </Link>
              <Link href="/pricing" className="block text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="block text-gray-400 hover:text-white transition-colors">
                Contact
              </Link>
              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400">
                      <User className="w-4 h-4 text-indigo-300" />
                      <span className="truncate">{session.user.email}</span>
                    </div>
                    <Link href="/dashboard" className="block w-full px-5 py-2 text-center bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                      Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block w-full px-4 py-2 text-center text-gray-300 hover:text-white border border-gray-700 rounded-lg transition-colors">
                      Sign in
                    </Link>
                    <Link href="/register" className="block w-full px-5 py-2 text-center bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                      Get started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
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
              <Link href="/register" className="px-9 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                Start building free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a href="#how-it-works" className="px-9 py-4 text-gray-300 hover:text-white transition-colors flex items-center gap-2 group border border-gray-700 hover:border-gray-600 rounded-lg">
                See how it works
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </a>
            </div>

            {/* Feature badges */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚡</span>
                <span>Just buy credits — we handle everything</span>
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
                <span>No API keys needed</span>
              </div>
            </div>
          </div>
        </div>
        {/* Bottom gradient fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#0a0a0f] pointer-events-none" />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 relative">
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

          {/* Animated Council Session */}
          <LiveCouncilSession />

          {/* Enhanced Process Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mt-20">
            {/* Card 1: Zero Hallucinations */}
            <div className="group bg-gradient-to-br from-emerald-500/10 to-emerald-900/5 border border-emerald-500/20 rounded-xl p-6 hover:border-emerald-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🛡️</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Zero Hallucinations</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Perplexity verifies every package, API, and method against live documentation before a single line is written.
                </p>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-gray-500">Unverified</span>
                    <span className="text-red-400 font-semibold">BLOCKED</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded">
                    <span className="text-gray-500">Verified</span>
                    <span className="text-emerald-400 font-semibold">✓ PROCEED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Persistent Memory */}
            <div className="group bg-gradient-to-br from-blue-500/10 to-blue-900/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Persistent Memory</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Every decision, pattern, and architectural choice is stored in ProjectState—persists forever.
                </p>
                <div className="mt-4 p-3 bg-gray-900/50 rounded-lg font-mono text-xs">
                  <div className="text-blue-400 mb-2">ProjectState.json</div>
                  <div className="space-y-1 text-gray-500">
                    <div>→ architecture: <span className="text-gray-300">"REST API"</span></div>
                    <div>→ database: <span className="text-gray-300">"MongoDB"</span></div>
                    <div>→ auth: <span className="text-gray-300">"NextAuth v5"</span></div>
                  </div>
                  <div className="text-gray-600 text-xs mt-2">Updated 2m ago</div>
                </div>
              </div>
            </div>

            {/* Card 3: Cross-Model Review */}
            <div className="group bg-gradient-to-br from-purple-500/10 to-purple-900/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Cross-Model Review</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Different model reviews every output. No model grades its own homework.
                </p>
                <div className="space-y-3 mt-4">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-orange-400" />
                    <div className="text-xs">
                      <div className="text-white font-semibold">Codestral writes</div>
                      <div className="text-gray-500">Implementation</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-gray-600">↓</div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full mt-1.5 bg-blue-400" />
                    <div className="text-xs">
                      <div className="text-white font-semibold">GPT reviews</div>
                      <div className="text-gray-500">Catches errors</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Full Audit Trail */}
            <div className="group bg-gradient-to-br from-indigo-500/10 to-indigo-900/5 border border-indigo-500/20 rounded-xl p-6 hover:border-indigo-500/40 transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-lg font-semibold mb-2 text-white">Full Audit Trail</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Every session produces a complete review log. See which model wrote what, what was flagged, and why.
                </p>
                <div className="mt-4 space-y-2 font-mono text-xs">
                  <div className="p-2 bg-gray-900/50 rounded flex items-center gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-gray-400">Architecture approved</span>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded flex items-center gap-2">
                    <span className="text-yellow-400">⚠</span>
                    <span className="text-gray-400">Edge case flagged</span>
                  </div>
                  <div className="p-2 bg-gray-900/50 rounded flex items-center gap-2">
                    <span className="text-blue-400">→</span>
                    <span className="text-gray-400">Arbitration resolved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom gradient fade for smooth transition */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-b from-transparent to-[#0a0a0f] pointer-events-none" />
      </section>

      {/* Comparison Table Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-10"
            style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
          />
          <div 
            className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="text-sm text-indigo-400 uppercase tracking-wider mb-4">Comparison</div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6">
                Built different from every tool you've tried.
              </h2>
              <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                Other tools are good at what they do. VerityFlow solves a different problem: code quality and context drift at the orchestration layer, not the editor layer.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <div className="overflow-hidden border border-gray-800 rounded-2xl">
                  <table className="min-w-full">
                    {/* Sticky Header */}
                    <thead className="sticky top-0 z-20">
                      <tr className="bg-[#0a0a0f] border-b border-gray-800">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400 w-1/4">
                          Feature
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold bg-indigo-500/10 border-x-2 border-indigo-500/50">
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-indigo-400 text-base">VerityFlow</span>
                            <span className="text-xs text-indigo-400/60 font-normal">Your AI Engineering Firm</span>
                          </div>
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                          Cursor
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                          Copilot
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                          Bolt/Lovable
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                          Direct LLM
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="divide-y divide-gray-800">
                      {/* Row 1: Persistent project memory */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Persistent project memory</div>
                          <div className="text-xs text-gray-500 mt-1">Remembers decisions across sessions</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-yellow-500 text-sm">Partial</span>
                          <div className="text-xs text-gray-600 mt-1">Codebase indexing only</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                      </tr>

                      {/* Row 2: Hallucination firewall */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Hallucination firewall</div>
                          <div className="text-xs text-gray-500 mt-1">Verifies packages before writing code</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                      </tr>

                      {/* Row 3: Cross-model review */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Cross-model output review</div>
                          <div className="text-xs text-gray-500 mt-1">Different model checks every output</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                      </tr>

                      {/* Row 4: Conflict arbitration */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Conflict arbitration</div>
                          <div className="text-xs text-gray-500 mt-1">Third model resolves disagreements</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                      </tr>

                      {/* Row 5: Multiple specialized models */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Multiple specialized models</div>
                          <div className="text-xs text-gray-500 mt-1">5 models, each with defined role</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-yellow-500 text-sm">Partial</span>
                          <div className="text-xs text-gray-600 mt-1">Can switch, no collaboration</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                      </tr>

                      {/* Row 6: Non-technical builders */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Built for non-technical builders</div>
                          <div className="text-xs text-gray-500 mt-1">No coding knowledge required</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                          <div className="text-xs text-gray-600 mt-1">IDE-first, assumes coding</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-yellow-500 text-sm">Partial</span>
                          <div className="text-xs text-gray-600 mt-1">Great for UI, weaker on logic</div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-yellow-500 text-sm">Partial</span>
                          <div className="text-xs text-gray-600 mt-1">Requires strong prompting</div>
                        </td>
                      </tr>

                      {/* Row 7: Full review log */}
                      <tr className="bg-gray-900/20 hover:bg-gray-900/40 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="text-sm font-medium text-white">Full review log & audit trail</div>
                          <div className="text-xs text-gray-500 mt-1">Every decision is logged and readable</div>
                        </td>
                        <td className="px-6 py-5 text-center bg-indigo-500/5 border-x border-indigo-500/20">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-400">✓</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-gray-600">—</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Acknowledgment & CTA */}
            <div className="mt-16 text-center max-w-3xl mx-auto">
              <p className="text-gray-400 leading-relaxed mb-8">
                Cursor is exceptional for experienced developers working in an IDE. Copilot is a great autocomplete layer. Bolt is fast for UI prototyping. <span className="text-white font-medium">VerityFlow is for when you need a full project built correctly, not just fast.</span>
              </p>
              
              <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/25">
                Start building free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
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

      {/* Essential FAQs Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="text-sm text-indigo-400 uppercase tracking-wider mb-4">FAQ</div>
              <h2 className="text-5xl font-bold mb-4">Questions, answered.</h2>
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              <details className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-medium text-white">Why not just open five tabs?</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  You could. But each tab would forget what the others decided, work from different assumptions, and give you five disconnected outputs to manually reconcile. VerityFlow coordinates them — shared context, structured review, conflict resolution, and a single ProjectState document that every model reads and updates. Five tabs give you five siloed answers. VerityFlow gives you one coherent build.
                </p>
              </details>

              <details className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-medium text-white">How is VerityFlow different from GitHub Copilot or Cursor?</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Copilot and Cursor are single-model tools — one AI writes the code and reviews the code. VerityFlow uses five specialized models that check each other's work. No model grades its own homework. We also maintain a persistent project state document so context never drifts across a long build session.
                </p>
              </details>

              <details className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-medium text-white">How does VerityFlow actually prevent hallucinations?</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Before any implementation begins, Perplexity Sonar Pro scans the task for external dependencies and verifies them against current documentation in real time. If a package can't be verified, the task is blocked until it's confirmed. This prevents the most common failure mode in AI coding tools: confidently using a library method that doesn't exist.
                </p>
              </details>

              <details className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-medium text-white">Does context persist between sessions?</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  Yes. ProjectState is a living document that persists across sessions. Architectural decisions, naming conventions, design patterns — anything the council agrees on in session one is still respected in session fifty. Other tools start fresh every time. We remember.
                </p>
              </details>

              <details className="group bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <span className="text-lg font-medium text-white">What happens if a better model comes along for a role?</span>
                  <span className="text-gray-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                </summary>
                <p className="mt-4 text-gray-400 leading-relaxed">
                  We swap it. The council architecture is permanent. Which model fills each role is not. If GPT-6 outperforms GPT-5.4 on review precision, it replaces it. If a new Gemini beats the 2M context window, we upgrade. The roles stay. The roster evolves.
                </p>
              </details>
            </div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <Link href="/faq" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-lg group">
                See all questions
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <p className="text-sm text-gray-600 mt-2">Pricing, privacy, technical details, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[150px] opacity-20"
            style={{ 
              background: `radial-gradient(circle, ${MODEL_COLORS.gpt} 0%, ${MODEL_COLORS.claude} 50%, transparent 70%)`
            }}
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-sm text-indigo-400 uppercase tracking-wider mb-4">READY TO BUILD?</div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Put the whole council to work on your project.
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Five AI specialists available 24/7 — no onboarding, no context loss, no hallucinations.
            </p>
            
            <Link href="/register" className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 rounded-lg font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-indigo-500/25">
              Start building free
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <p className="text-sm text-gray-600 mt-8">
              Free tier: 50 credits included. No API keys needed. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900">
        <div className="container mx-auto px-6 py-16">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Column 1: Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">
                  Verity<span className="text-indigo-400">Flow</span>
                </span>
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Your AI Engineering Firm.
              </p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Five specialized models. One persistent context. Code you can trust.
              </p>
              
              <p className="text-xs text-gray-600 pt-2">
                © 2026 VerityFlow. All rights reserved.
              </p>
            </div>

            {/* Column 2: Product */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    How it works
                  </a>
                </li>
                <li>
                  <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">
                    Compare tools
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Developers */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Developers
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/docs/getting-started" className="text-gray-400 hover:text-white transition-colors">
                    Getting Started
                  </Link>
                </li>
                <li>
                  <Link href="/docs/credits" className="text-gray-400 hover:text-white transition-colors">
                    Credit System
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-gray-400 hover:text-white transition-colors">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Company & Legal */}
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-gray-400 hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-800">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
              <p>
                VerityFlow is not affiliated with Anthropic, OpenAI, Google, Mistral, or Perplexity.
              </p>
              <p className="text-gray-500">
                Made for builders who ship.
              </p>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      
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

function LiveCouncilSession() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  const steps = [
    {
      id: 0,
      type: 'input',
      content: '$ Build a full-stack SaaS with Stripe billing, user auth, and a dashboard'
    },
    {
      id: 1,
      model: 'Perplexity',
      role: 'Researcher',
      color: MODEL_COLORS.perplexity,
      content: 'Verifying dependencies... stripe@14.21.0 confirmed. next-auth@5.0.0 stable. MongoDBAdapter compatible. ✓ All packages verified. Proceeding.',
      duration: 2500
    },
    {
      id: 2,
      model: 'Claude',
      role: 'Architect',
      color: MODEL_COLORS.claude,
      content: 'Architecture decision: users collection needs `plan` [enum: free/starter/pro/studio] and `stripeCustomerId`. Designing API routes: /api/billing/webhook, /api/auth/[...nextauth]. Persisting to ProjectState...',
      duration: 3000
    },
    {
      id: 3,
      model: 'Codestral',
      role: 'Implementer',
      color: MODEL_COLORS.codestral,
      content: 'Implementing /api/billing/webhook.js with Stripe signature verification. Creating users schema with plan field. Building dashboard layout with protected routes...',
      duration: 3500
    },
    {
      id: 4,
      model: 'GPT',
      role: 'Reviewer',
      color: MODEL_COLORS.gpt,
      content: 'Reviewing Codestral output... ⚠ Edge case detected: webhook signature must use raw body. Flagging for correction. Otherwise approved.',
      duration: 2800
    },
    {
      id: 5,
      model: 'Codestral',
      role: 'Implementer',
      color: MODEL_COLORS.codestral,
      content: 'Applied correction: Added express.raw() middleware for /api/billing/webhook. Signature verification now correct. Re-submitting...',
      duration: 2200
    },
    {
      id: 6,
      model: 'GPT',
      role: 'Reviewer',
      color: MODEL_COLORS.gpt,
      content: '✓ Review passed. Output approved. Shipping...',
      duration: 1800
    },
    {
      id: 7,
      type: 'output',
      content: '✅ Full-stack SaaS delivered: Auth configured, Stripe webhook secure, dashboard protected. Review log attached. ProjectState updated.',
      duration: 3000
    }
  ]

  useEffect(() => {
    if (!isPlaying) return

    const timer = setTimeout(() => {
      setStep((prev) => {
        if (prev >= steps.length - 1) {
          // Loop back to beginning after a pause
          setTimeout(() => setStep(0), 2000)
          return prev
        }
        return prev + 1
      })
    }, steps[step]?.duration || 2000)

    return () => clearTimeout(timer)
  }, [step, isPlaying, steps])

  return (
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
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-3 py-1 rounded border border-gray-700 hover:border-gray-600"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-bold mb-6">
            This is what collaboration actually looks like.
          </h3>
          
          <div className="space-y-6 font-mono text-sm min-h-[400px]">
            {/* User Input - Always visible */}
            <div className={`text-gray-400 transition-opacity duration-300 ${step >= 0 ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-gray-600">$</span> {steps[0].content}
            </div>

            {/* Render all steps up to current */}
            {steps.slice(1, step + 1).map((s, index) => {
              if (s.type === 'output') {
                return (
                  <div 
                    key={s.id} 
                    className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg animate-fade-in"
                  >
                    <div className="text-emerald-400 font-semibold mb-2">OUTPUT</div>
                    <div className="text-gray-300">{s.content}</div>
                  </div>
                )
              }

              return (
                <div 
                  key={s.id} 
                  className={`flex items-start gap-3 animate-fade-in ${
                    index === step - 1 ? 'opacity-100' : 'opacity-70'
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full mt-2 flex-shrink-0" 
                    style={{ 
                      backgroundColor: s.color, 
                      boxShadow: `0 0 8px ${s.color}`,
                      animation: index === step - 1 ? 'pulse 2s infinite' : 'none'
                    }} 
                  />
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 mb-1">
                      {s.model} <span className="text-gray-600">{s.role}</span>
                    </div>
                    <div className="text-gray-300 leading-relaxed">
                      {s.content}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Thinking indicator for current step */}
            {step < steps.length - 1 && step > 0 && (
              <div className="flex items-center gap-2 text-gray-600 animate-pulse">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs">
                  {steps[step + 1]?.model || 'Processing'}...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
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
