import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function AboutPage() {
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

          <h1 className="text-5xl font-bold mb-6">About VerityFlow</h1>
          <div className="space-y-6 text-lg text-gray-400 leading-relaxed">
            <p>
              VerityFlow is an AI engineering platform that coordinates five specialized models to build production-ready code.
            </p>
            <p>
              Every decision is debated. Every line is reviewed. Nothing ships without passing through our multi-model council.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
