import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
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

          <h1 className="text-5xl font-bold mb-6">Cookie Policy</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: January 2026</p>

          <div className="space-y-8 text-gray-400">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What Are Cookies?</h2>
              <p>Cookies are small text files stored on your device that help us provide and improve our service.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">How We Use Cookies</h2>
              <p>We use essential cookies for authentication and session management. We do not use tracking or advertising cookies.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
