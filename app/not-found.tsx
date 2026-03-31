'use client'

import Link from 'next/link'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="max-w-lg w-full text-center">
        {/* Large 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 text-transparent bg-clip-text">
            404
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Page not found
        </h2>

        {/* Message */}
        <p className="text-lg text-gray-400 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. 
          The council cannot locate this resource.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors"
          >
            <Home className="w-5 h-5" />
            <span>Go to dashboard</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go back</span>
          </button>
        </div>

        {/* Brand Footer */}
        <div className="mt-12 text-sm text-gray-500">
          <span className="font-bold">
            Verity<span className="text-indigo-400">Flow</span>
          </span>
          {' — Your AI Engineering Firm'}
        </div>
      </div>
    </div>
  )
}
