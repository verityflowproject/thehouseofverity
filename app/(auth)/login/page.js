'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'

const MODELS = [
  { name: 'Claude',      role: 'Architect',    color: '#FF6B6B' },
  { name: 'GPT',         role: 'Reviewer',     color: '#4ECDC4' },
  { name: 'Codestral',   role: 'Implementer',  color: '#F9C74F' },
  { name: 'Gemini',      role: 'Context',      color: '#F38181' },
  { name: 'Perplexity',  role: 'Researcher',   color: '#AA96DA' },
]

export default function LoginPage() {
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
            backgroundSize: '60px 60px',
          }}
        />

        {/* Radial glow accent */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20"
          style={{
            background: 'radial-gradient(circle, #6366f1 0%, #8b5cf6 50%, transparent 70%)',
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

          {/* Quote + Model showcase */}
          <div className="space-y-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="space-y-4">
              <div className="text-3xl font-semibold text-white leading-tight">
                &ldquo;Other tools forget.
                <br />
                <span className="text-indigo-400">VerityFlow remembers.&rdquo;</span>
              </div>
              <p className="text-gray-400">
                Your entire project context persists across sessions.
                <br />
                No need to repeat yourself.
              </p>
            </div>

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
                      boxShadow: `0 0 10px ${model.color}`,
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
        <Suspense fallback={<div className="text-gray-500 text-sm">Loading...</div>}>
          <AuthForm mode="login" className="animate-fade-up" />
        </Suspense>
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
