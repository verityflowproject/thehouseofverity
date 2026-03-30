import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-900">
        <div className="container mx-auto px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">
              Verity<span className="text-indigo-400">Flow</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: January 2026</p>

          <div className="space-y-8 text-gray-400">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using VerityFlow, you agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Use of Service</h2>
              <p>VerityFlow provides AI-powered code generation through a multi-model architecture. You are responsible for reviewing all generated code before deployment.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. API Keys</h2>
              <p>You must provide your own API keys for third-party services. VerityFlow is not responsible for costs incurred through these services.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
