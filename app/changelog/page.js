import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ChangelogPage() {
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
              <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                Compare
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                Contact
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
        <div className="container mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <h1 className="text-5xl font-bold mb-4">Changelog</h1>
          <p className="text-xl text-gray-400 mb-16">
            What's new in VerityFlow.
          </p>

          {/* Timeline */}
          <div className="space-y-8">
            {/* Version 0.3.0 */}
            <div className="relative pl-8 border-l-2 border-indigo-500/30">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full" />
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-mono text-gray-300">
                    v0.3.0
                  </span>
                  <span className="text-sm text-gray-500">April 2026</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30">
                    Feature update
                  </span>
                </div>

                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Session history persistence — all council sessions are now saved to the database and accessible from the project sidebar, surviving page reloads and new visits</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Export options — download session output as .txt, ZIP archive of all parsed files, or copy individual files from the Files view</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Session cost breakdown — transparent per-model credit cost details now appear below the output panel after every completed session</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Project Brief editor — add persistent instructions in the project sidebar; the full council reads your brief on every session for consistent context</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Settings wired into the app — compact mode, welcome banner toggle, default output format, and auto-download preferences now take effect across the dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>GPT model updated to gpt-5.4 — corrected model identifier resolves the configuration error that prevented GPT-based tasks from running</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Live ProjectState merge — architecture decisions, dependencies, and review logs from each session are now accumulated into the project's persistent state</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Version 0.2.0 */}
            <div className="relative pl-8 border-l-2 border-indigo-500/30">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full" />
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-mono text-gray-300">
                    v0.2.0
                  </span>
                  <span className="text-sm text-gray-500">April 2026</span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded-full border border-indigo-500/30">
                    Feature update
                  </span>
                </div>

                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Real-time SSE streaming — Council sessions now stream live progress as each model works, replacing the static loading state</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Live rendered HTML preview — output panel now renders HTML output live in a sandboxed iframe alongside the code view</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Codebase file tree viewer — multi-file outputs are parsed and displayed as a navigable file tree with per-file content view</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Auto-determined tech stack — removed manual tech stack selection from new project flow; council selects the most appropriate stack for each task</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Dashboard settings page — appearance, notification, session defaults, and privacy preferences stored locally</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Auth-aware navigation — homepage and all marketing pages show account state and direct dashboard link when signed in</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Persistent session cookies — sign-in state is maintained across visits without requiring re-authentication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Documentation hub — Getting Started guide and Credit System reference now live at /docs</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>About, Blog, and Status pages — all previously 404 company pages are now live</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Version 0.1.0 */}
            <div className="relative pl-8 border-l-2 border-indigo-500/30">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full" />
              
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gray-800 rounded-full text-sm font-mono text-gray-300">
                    v0.1.0
                  </span>
                  <span className="text-sm text-gray-500">March 2026</span>
                  <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                    Initial release
                  </span>
                </div>

                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Five-model AI Council (Claude, GPT, Codestral, Gemini, Perplexity)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>ProjectState persistent memory system</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Cross-model review pipeline and arbitration protocol</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Hallucination firewall via Perplexity Sonar Pro</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Managed model access — all five AI providers secured by VerityFlow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Credit system for zero-setup access</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Full session review log</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-indigo-400 mt-1">✦</span>
                    <span>Stripe billing (Free, Pro, Teams)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Note */}
          <div className="mt-12 p-6 bg-gray-900/30 border border-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400 mb-3">
              Updates ship when they're ready, not on a schedule.
            </p>
            <p className="text-sm text-gray-400">
              Get notified →{' '}
              <a href="mailto:contact@verityflow.io?subject=Changelog updates" className="text-indigo-400 hover:text-indigo-300 underline">
                contact@verityflow.io
              </a>{' '}
              with subject "Changelog updates"
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
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/changelog" className="text-gray-400 hover:text-white transition-colors">Changelog</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Developers</h3>
              <ul className="space-y-3 text-sm">
                <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/docs/getting-started" className="text-gray-400 hover:text-white transition-colors">Getting Started</Link></li>
                <li><Link href="/docs/credits" className="text-gray-400 hover:text-white transition-colors">Credit System</Link></li>
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
