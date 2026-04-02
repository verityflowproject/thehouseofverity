/**
 * lib/auth/auth.ts — NextAuth v5 configuration
 *
 * Strategy : database sessions (not JWT) via FirestoreAdapter.
 * Providers : Google OAuth + Email magic link.
 * Session callback : enriches session.user with plan / usage from our User model.
 * SignIn callback  : auto-creates a VerityFlow User document on first login.
 *
 * Export pattern (NextAuth v5):
 *   { handlers, auth, signIn, signOut } = NextAuth({...})
 */

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Nodemailer from 'next-auth/providers/nodemailer'
import { FirestoreAdapter } from '@auth/firebase-adapter'
import { v4 as uuidv4 } from 'uuid'

import { db } from '@/lib/db/firestore'
import { User } from '@/lib/models/User'
import { CreditTransaction } from '@/lib/models/CreditTransaction'
import { PLAN_CALL_LIMITS } from '@/lib/types'
import { SIGNUP_FREE_CREDITS } from '@/lib/credit-costs'
import type { Plan } from '@/lib/types'

// ─── Env guard ────────────────────────────────────────────────────────────────

if (!process.env.AUTH_SECRET) {
  throw new Error('[VerityFlow] AUTH_SECRET is not set. Run: openssl rand -hex 32')
}

// ─── NextAuth v5 configuration ─────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: FirestoreAdapter(db) as Parameters<typeof NextAuth>[0]['adapter'],

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: 'database',
    maxAge:    30 * 24 * 60 * 60, // 30 days
    updateAge:      24 * 60 * 60, // refresh every 24 h
  },

  providers: [
    Google({
      clientId:     process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),

    Nodemailer({
      server: process.env.AUTH_EMAIL_SERVER ?? 'smtp://localhost:1025',
      from:   process.env.AUTH_EMAIL_FROM   ?? 'VerityFlow <noreply@verityflow.io>',
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      const email = user.email
      if (!email) return true

      try {
        const existing = await User.findByEmail(email)

        if (!existing) {
          const newUserId = uuidv4()
          await User.create({
            id:             newUserId,
            email:          email.toLowerCase(),
            name:           user.name   ?? undefined,
            image:          user.image  ?? undefined,
            plan:           'free' satisfies Plan,
            credits:        SIGNUP_FREE_CREDITS,
            modelCallsUsed: 0,
            modelCallsLimit:PLAN_CALL_LIMITS.free,
          })

          // Record the signup grant so it appears in the user's credit history
          await CreditTransaction.create({
            id:          uuidv4(),
            userId:      newUserId,
            type:        'signup_grant',
            amount:      SIGNUP_FREE_CREDITS,
            balanceAfter:SIGNUP_FREE_CREDITS,
            description: `Welcome bonus — ${SIGNUP_FREE_CREDITS} free credits to get started`,
          })
        }
      } catch (err) {
        console.error('[VerityFlow] signIn upsert error:', err)
      }

      return true
    },

    async session({ session }) {
      if (!session.user?.email) return session

      try {
        const vfUser = await User.findByEmail(session.user.email)

        if (vfUser) {
          session.user.id               = vfUser.id
          session.user.plan             = (vfUser.plan as Plan) ?? 'free'
          session.user.credits          = vfUser.credits ?? 0
          session.user.modelCallsUsed   = vfUser.modelCallsUsed   ?? 0
          session.user.modelCallsLimit  = vfUser.modelCallsLimit  ?? PLAN_CALL_LIMITS.free
        }
      } catch (err) {
        console.error('[VerityFlow] session enrichment error:', err)
      }

      return session
    },
  },

  pages: {
    signIn:        '/auth/signin',
    error:         '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser:       '/auth/welcome',
  },

  debug: process.env.NODE_ENV === 'development',
})
