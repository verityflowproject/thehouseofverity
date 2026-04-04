'use client'

import { UsageDashboard } from '@/components/dashboard/UsageDashboard'

export default function UsagePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Usage</h1>
        <p className="text-gray-400 mt-1">Credit balance, daily limits, and model activity</p>
      </div>
      <UsageDashboard />
    </div>
  )
}
