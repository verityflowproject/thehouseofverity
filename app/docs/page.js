import Link from 'next/link'
import { ArrowLeft, Book, Code, Key } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold">
                Verity<span className="text-indigo-400">Flow</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Beta
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8 text-sm">
              <a href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                How it works
              </a>
              <a href="/#council" className="text-gray-400 hover:text-white transition-colors">
                The Council
              </a>
              <Link href="/compare" className="text-gray-400 hover:text-white transition-colors">
                Compare
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login" className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors">
                Sign in
              </Link>
              <Link href="/register" className="px-5 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors font-medium">
                Get started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <h1 className="text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-gray-400 mb-16">
            Guides, references, and everything you need to build with VerityFlow.
          </p>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Book className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Getting Started</h3>
              <p className="text-sm text-gray-400 mb-4">
                Set up your account, add your API keys, and run your first Council session.
              </p>
              <span className="text-sm text-gray-600">→ Coming soon</span>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Code className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">API Reference</h3>
              <p className="text-sm text-gray-400 mb-4">
                Integrate VerityFlow into your own tools via our REST API.
              </p>
              <Link href="/docs/api" className="text-sm text-indigo-400 hover:text-indigo-300">
                → Learn more
              </Link>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Key className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">BYOK Setup</h3>
              <p className="text-sm text-gray-400 mb-4">
                Connect OpenRouter or individual provider keys. Zero markup, full control.
              </p>
              <Link href="/faq" className="text-sm text-indigo-400 hover:text-indigo-300">
                → View FAQ
              </Link>
            </div>
          </div>

          {/* Note */}
          <div className="p-6 bg-gray-900/30 border border-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">
              Full docs are in progress. In the meantime, the FAQ covers most common questions →{' '}
              <Link href="/faq" className="text-indigo-400 hover:text-indigo-300 underline">
                View FAQ
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-900 bg-[#0a0a0f]">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">
                  Verity<span className="text-indigo-400">Flow</span>
                </span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                Your AI Engineering Firm.<br />Five models. One team.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/compare" className="text-gray-400 hover:text-white transition-colors">Compare</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/api" className="text-gray-400 hover:text-white transition-colors">API Reference</Link></li>
                <li><Link href="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-800">
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-900">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-mono">
              <p>VerityFlow is not affiliated with Anthropic, OpenAI, Google, Mistral, or Perplexity.</p>
              <p className="text-gray-500">Made for builders who ship.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
