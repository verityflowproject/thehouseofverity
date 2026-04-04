'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, AlertCircle, Mail, CheckCircle2 } from 'lucide-react'
import { getSupabaseBrowser } from '@/lib/db/supabase-browser'

const ERROR_MESSAGES = {
  auth_callback_failed:   'Authentication failed. Please try again.',
  code_exchange_failed:   'Could not complete sign-in. The link may have expired — please try again.',
  no_code:                'Invalid sign-in link. Please start again.',
  provider_not_enabled:   'Google sign-in is not available right now. Please use email instead.',
  access_denied:          'Access was denied. If you closed the Google window by mistake, please try again.',
}

function getErrorMessage(code) {
  if (!code) return null
  return ERROR_MESSAGES[code] ?? 'Something went wrong. Please try again.'
}

/**
 * Shared authentication form used by both /register and /login.
 *
 * @param {'register'|'login'} mode  - Controls copy (Create account vs Sign in)
 * @param {string} [className]       - Optional wrapper class
 */
export default function AuthForm({ mode = 'login', className = '' }) {
  const isRegister = mode === 'register'

  const [email, setEmail]               = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading]   = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [magicLinkSent, setMagicLinkSent]     = useState(false)

  const searchParams = useSearchParams()

  // Read error and callbackUrl from URL on mount
  const urlError      = searchParams.get('error')
  const callbackUrl   = searchParams.get('callbackUrl')

  useEffect(() => {
    const msg = getErrorMessage(urlError)
    if (msg) setErrorMessage(msg)
  }, [urlError])

  // Build the post-auth redirect target
  const getRedirectTo = useCallback(() => {
    const next = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard'
    return `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`
  }, [callbackUrl])

  const handleGoogleSignIn = async () => {
    setErrorMessage(null)
    setIsGoogleLoading(true)

    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectTo(),
        },
      })
      if (error) {
        // signInWithOAuth only errors before the redirect — e.g. provider disabled
        setErrorMessage(getErrorMessage('provider_not_enabled') + ` (${error.message})`)
        setIsGoogleLoading(false)
      }
      // If no error, the browser is redirecting — keep spinner visible
    } catch (err) {
      console.error('Google sign-in error:', err)
      setErrorMessage('An unexpected error occurred. Please try again.')
      setIsGoogleLoading(false)
    }
  }

  const handleEmailSignIn = async (e) => {
    e.preventDefault()
    if (!email) return

    setErrorMessage(null)
    setIsEmailLoading(true)

    try {
      const supabase = getSupabaseBrowser()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: getRedirectTo(),
          shouldCreateUser: true,
        },
      })
      if (error) throw error
      setMagicLinkSent(true)
    } catch (err) {
      console.error('Email sign-in error:', err)
      setErrorMessage(err.message ?? 'Failed to send magic link. Please try again.')
    } finally {
      setIsEmailLoading(false)
    }
  }

  const isLoading = isGoogleLoading || isEmailLoading

  // ── Magic link sent state ─────────────────────────────────────────────────
  if (magicLinkSent) {
    return (
      <div className={`w-full max-w-[384px] space-y-8 ${className}`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Check your email</h2>
          <p className="text-gray-400">
            We sent a magic link to{' '}
            <span className="text-white font-medium">{email}</span>.
            Click it to {isRegister ? 'create your account' : 'sign in'}.
          </p>
          <p className="text-sm text-gray-500">
            Didn't receive it? Check your spam folder or{' '}
            <button
              onClick={() => { setMagicLinkSent(false); setEmail('') }}
              className="text-indigo-400 hover:text-indigo-300 underline transition-colors"
            >
              try a different email
            </button>
            .
          </p>
        </div>
      </div>
    )
  }

  // ── Auth form ─────────────────────────────────────────────────────────────
  return (
    <div className={`w-full max-w-[384px] space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-gray-400">
          {isRegister
            ? 'Get started with VerityFlow for free'
            : 'Sign in to continue building'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Error banner */}
        {errorMessage && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Google Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200"
        >
          {isGoogleLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-800" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-[#0a0a0f] text-gray-500">or</span>
          </div>
        </div>

        {/* Email / Magic Link */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              disabled={isLoading}
              className="w-full px-4 py-3.5 bg-gray-900/50 border border-gray-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEmailLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? 'Create free account' : 'Continue with email'}
          </button>
        </form>

        {/* Terms */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          By continuing, you agree to VerityFlow's{' '}
          <Link href="/terms" className="text-indigo-400 hover:text-indigo-300 underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300 underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Footer link */}
      <div className="text-center text-sm text-gray-500">
        {isRegister ? (
          <>
            Already have an account?{' '}
            <Link
              href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </>
        ) : (
          <>
            Don&apos;t have an account?{' '}
            <Link
              href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Create free account
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
