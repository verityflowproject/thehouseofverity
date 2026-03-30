import Link from 'next/link'
import { ArrowLeft, Activity } from 'lucide-react'

export default function StatusPage() {
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

          <h1 className="text-5xl font-bold mb-12">System Status</h1>

          <div className="space-y-4">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className="w-6 h-6 text-emerald-400" />
                <div>
                  <div className="font-semibold">All Systems Operational</div>
                  <div className="text-sm text-gray-500">Last updated: Just now</div>
                </div>
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
