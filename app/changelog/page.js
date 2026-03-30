import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ChangelogPage() {
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

          <h1 className="text-5xl font-bold mb-6">Changelog</h1>
          <p className="text-xl text-gray-400 mb-12">
            Product updates and improvements to VerityFlow.
          </p>

          <div className="space-y-8">
            <div className="border-l-2 border-indigo-500 pl-6">
              <div className="text-sm text-gray-500 mb-2">January 2026</div>
              <h3 className="text-xl font-semibold mb-2">Beta Launch</h3>
              <p className="text-gray-400">VerityFlow beta is now live with all five AI models integrated.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
