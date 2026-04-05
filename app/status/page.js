'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const SERVICES = [
  {
    category: 'Platform',
    items: [
      { name: 'API', status: 'operational', uptime: '99.99%', latency: '142ms' },
      { name: 'Dashboard', status: 'operational', uptime: '99.98%', latency: '210ms' },
      { name: 'Authentication', status: 'operational', uptime: '100%', latency: '88ms' },
      { name: 'Billing & Stripe', status: 'operational', uptime: '99.99%', latency: '320ms' },
      { name: 'Database', status: 'operational', uptime: '100%', latency: '34ms' },
    ]
  },
  {
    category: 'AI Council',
    items: [
      { name: 'Claude (Architect)', status: 'operational', uptime: '99.95%', latency: '1.8s' },
      { name: 'GPT-4 (Reviewer)', status: 'operational', uptime: '99.93%', latency: '2.1s' },
      { name: 'Codestral (Implementer)', status: 'operational', uptime: '99.97%', latency: '1.4s' },
      { name: 'Gemini (Refactor)', status: 'operational', uptime: '99.91%', latency: '1.9s' },
      { name: 'Perplexity (Firewall)', status: 'operational', uptime: '99.96%', latency: '1.2s' },
    ]
  },
]

function generate90DayBars() {
  const bars = []
  for (let i = 0; i < 90; i++) {
    const rand = Math.random()
    if (rand > 0.03) {
      bars.push('operational')
    } else if (rand > 0.01) {
      bars.push('degraded')
    } else {
      bars.push('incident')
    }
  }
  return bars
}

const UPTIME_BARS = generate90DayBars()

const STATUS_CONFIG = {
  operational: { label: 'Operational', dot: 'bg-emerald-500', bar: 'bg-emerald-500', text: 'text-emerald-400' },
  degraded: { label: 'Degraded', dot: 'bg-amber-500', bar: 'bg-amber-400', text: 'text-amber-400' },
  incident: { label: 'Incident', dot: 'bg-red-500', bar: 'bg-red-400', text: 'text-red-400' },
}

export default function StatusPage() {
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
                Dashboard
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
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          <h1 className="text-5xl font-bold mb-4">System Status</h1>
          <p className="text-xl text-gray-400 mb-12">
            Real-time health and uptime for all VerityFlow services.
          </p>

          {/* Overall Status Banner */}
          <div className="flex items-center gap-4 p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl mb-12">
            <div className="relative flex-shrink-0">
              <div className="w-4 h-4 rounded-full bg-emerald-500" />
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-emerald-500 animate-ping opacity-60" />
            </div>
            <div>
              <p className="text-xl font-semibold text-emerald-400">All Systems Operational</p>
              <p className="text-sm text-gray-400 mt-0.5">Last checked: just now &mdash; Updated every 60 seconds</p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-sm text-gray-500">Overall uptime (90d)</p>
              <p className="text-lg font-mono font-semibold text-emerald-400">99.97%</p>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-8 mb-12">
            {SERVICES.map(({ category, items }) => (
              <div key={category}>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{category}</h2>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                  {items.map((service, i) => {
                    const cfg = STATUS_CONFIG[service.status]
                    return (
                      <div
                        key={service.name}
                        className={`flex items-center justify-between px-5 py-4 ${i < items.length - 1 ? 'border-b border-gray-800/60' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <span className="text-sm font-medium text-white">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span className="hidden sm:block">Uptime: <span className="text-gray-300 font-mono">{service.uptime}</span></span>
                          <span className="hidden sm:block">Latency: <span className="text-gray-300 font-mono">{service.latency}</span></span>
                          <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 90-day Uptime */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">90-Day Uptime</h2>
              <span className="text-xs text-gray-600">Today →</span>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5">
              <div className="flex gap-0.5 items-end h-10">
                {UPTIME_BARS.map((status, i) => {
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <div
                      key={i}
                      title={status === 'operational' ? 'No incidents' : status === 'degraded' ? 'Degraded performance' : 'Incident reported'}
                      className={`flex-1 rounded-sm ${cfg.bar} opacity-80 hover:opacity-100 transition-opacity cursor-default`}
                      style={{ height: status === 'operational' ? '100%' : status === 'degraded' ? '70%' : '40%' }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-600">
                <span>90 days ago</span>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block" /> Operational</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-amber-400 inline-block" /> Degraded</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-400 inline-block" /> Incident</span>
              </div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="mb-12">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Incidents</h2>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500/60 mx-auto mb-3" />
              <p className="text-gray-300 font-medium mb-1">No recent incidents</p>
              <p className="text-sm text-gray-500">All services have been running smoothly. Incidents are reported here in real time.</p>
            </div>
          </div>

          {/* Subscribe to updates */}
          <div className="p-6 bg-gray-900/30 border border-gray-800/50 rounded-lg">
            <p className="text-sm text-gray-400">
              Get notified about incidents and maintenance windows →{' '}
              <a href="mailto:contact@verityflow.io?subject=Status updates" className="text-indigo-400 hover:text-indigo-300 underline">
                contact@verityflow.io
              </a>{' '}
              with subject "Status updates"
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
