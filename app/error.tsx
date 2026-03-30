'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function Error({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }
  reset: () => void 
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border-2 border-red-500/30 rounded-2xl p-8 text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-white mb-3">
          Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-gray-400 mb-6 leading-relaxed">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {/* Digest ID (if available) */}
        {error?.digest && (
          <div className="mb-6 p-3 bg-gray-800 rounded-lg">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Error ID
            </div>
            <div className="text-sm text-gray-300 font-mono">
              {error.digest}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
          >
            Try again
          </button>
          <a
            href="/dashboard"
            className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors inline-block"
          >
            Return to dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
