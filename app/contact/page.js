import Link from 'next/link'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ContactPage() {
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
        <div className="max-w-2xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <h1 className="text-5xl font-bold mb-6">Get in touch</h1>
          <p className="text-xl text-gray-400 mb-12">
            Have questions about VerityFlow? We'd love to hear from you.
          </p>

          <div className="space-y-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Email us</h3>
                  <p className="text-gray-400 mb-4">
                    For general inquiries, support, or partnership opportunities.
                  </p>
                  <a href="mailto:contact@verityflow.io" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    contact@verityflow.io
                  </a>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-lg font-semibold mb-4">Join our community</h3>
              <p className="text-gray-400 mb-4">
                Follow us on social media for updates, tips, and community discussions.
              </p>
              <div className="flex gap-3">
                <a href="https://twitter.com/verityflow" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                  Twitter/X
                </a>
                <a href="https://github.com/verityflowproject" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors">
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
