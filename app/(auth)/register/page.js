'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import AuthForm from '@/components/auth/AuthForm'

const FREE_FEATURES = [
  'Access to all 5 specialized AI models',
  '50 credits included — no credit card needed',
  'Persistent project context across sessions',
  'Full review log and audit trail',
  'Hallucination firewall protection',
]

export default function RegisterPage() {
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
            background: 'radial-gradient(circle, #10b981 0%, #6366f1 50%, transparent 70%)',
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

          {/* Free Plan Callout */}
          <div className="space-y-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                  Free Forever
                </span>
              </div>

              <div className="text-3xl font-semibold text-white leading-tight">
                Start building with the full council.
                <br />
                <span className="text-indigo-400">No credit card required.</span>
              </div>
            </div>

            {/* Features List */}
            <div className="space-y-4 pt-4">
              {FREE_FEATURES.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 animate-fade-up"
                  style={{ animationDelay: `${200 + i * 50}ms` }}
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-gray-300 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="pt-6 text-sm text-gray-500 animate-fade-up" style={{ animationDelay: '450ms' }}>
              Need more? Upgrade anytime to Pro or Team plans for higher limits and priority support.
            </div>
          </div>
        </div>
      </div>

      {/* Right Functional Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Suspense fallback={<div className="text-gray-500 text-sm">Loading...</div>}>
          <AuthForm mode="register" className="animate-fade-up" />
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
