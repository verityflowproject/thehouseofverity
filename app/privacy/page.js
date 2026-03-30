import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPage() {
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

          <h1 className="text-5xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: January 2026</p>

          <div className="space-y-8 text-gray-400">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your Privacy Matters</h2>
              <p>VerityFlow is committed to protecting your privacy and data. This policy outlines how we collect, use, and protect your information.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Data Collection</h2>
              <p>We collect only the data necessary to provide our service, including account information, project data, and usage metrics.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Your API Keys</h2>
              <p>Your third-party API keys (Anthropic, OpenAI, etc.) are encrypted and never exposed to our team or other users.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
