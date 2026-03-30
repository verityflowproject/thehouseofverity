'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

// Model colors and data
const MODELS = [
  { name: 'Claude', role: 'Architect', color: '#FF6B6B' },
  { name: 'GPT', role: 'Reviewer', color: '#4ECDC4' },
  { name: 'Codestral', role: 'Implementer', color: '#F9C74F' },
  { name: 'Gemini', role: 'Context', color: '#F38181' },
  { name: 'Perplexity', role: 'Researcher', color: '#AA96DA' },
]

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn('google', { callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Google sign-in error:', error)
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    try {
      await signIn('email', { email, callbackUrl: '/dashboard' })
    } catch (error) {
      console.error('Email sign-in error:', error)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Left Decorative Panel - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-gray-800">
        {/* Grid background */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Radial glow accent */}
        <div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 50%, transparent 70%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-12">
          {/* Logo */}
          <div className="mb-16 animate-fade-up">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Beta
              </span>
            </Link>
          </div>

          {/* Testimonial */}
          <div className="space-y-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="space-y-4">
              <div className="text-3xl font-semibold text-white leading-tight">
                "Other tools forget.
                <br />
                <span className="text-indigo-400">VerityFlow remembers.</span>"
              </div>
              <p className="text-gray-400">
                Your entire project context persists across sessions.
                <br />
                No need to repeat yourself.
              </p>
            </div>

            {/* Model list */}
            <div className="space-y-3 pt-8">
              <div className="text-sm text-gray-500 uppercase tracking-wider">
                Five specialized models
              </div>
              {MODELS.map((model, i) => (
                <div 
                  key={model.name}
                  className="flex items-center gap-3 animate-fade-up"
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ 
                      backgroundColor: model.color,
                      boxShadow: `0 0 10px ${model.color}`
                    }}
                  />
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white font-medium">{model.name}</span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-400">{model.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Functional Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[384px] space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 animate-fade-up">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400">Sign in to continue building</p>
          </div>

          {/* Auth Form */}
          <div className="space-y-4 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0a0a0f] text-gray-500">or</span>
              </div>
            </div>

            {/* Email Sign In */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Continue with email'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '200ms' }}>
            Don't have an account?{' '}
            <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create free account
            </Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          animation: fade-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}
