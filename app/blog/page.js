import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function BlogPage() {
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
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6">Blog</h1>
          <p className="text-xl text-gray-400 mb-12">
            Insights on AI, multi-model systems, and the future of software engineering.
          </p>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-gray-500">Blog posts coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
