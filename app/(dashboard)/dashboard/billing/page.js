import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { auth } from '@/lib/auth'
import { UsageDashboard } from '@/components/dashboard/UsageDashboard'

export default async function BillingPage() {
  const session = await auth()
  const currentPlan = session?.user?.plan || 'free'
  const isPaidUser = currentPlan !== 'free'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Billing & Usage
          </h1>
          <p className="text-gray-400">
            Monitor your council sessions and manage your subscription
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pricing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            View plans
          </Link>

          {isPaidUser && (
            <form action="/api/billing/portal" method="POST">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
              >
                <span>Manage billing</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Usage Dashboard */}
      <UsageDashboard />
    </div>
  )
}
