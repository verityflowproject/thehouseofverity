/**
 * lib/auth/auth.ts — NextAuth v5 configuration
 *
 * Strategy : database sessions (not JWT) via MongoDBAdapter.
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
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { v4 as uuidv4 } from 'uuid'

import clientPromise from '@/lib/db/mongo-client'
import { connectMongoose } from '@/lib/db/mongoose'
import { User } from '@/lib/models/User'
import { PLAN_CALL_LIMITS } from '@/lib/types'
import type { Plan } from '@/lib/types'

// ─── Env guard ────────────────────────────────────────────────────────────────

if (!process.env.AUTH_SECRET) {
  throw new Error('[VerityFlow] AUTH_SECRET is not set. Run: openssl rand -hex 32')
}

if (!process.env.DB_NAME) {
  throw new Error('[VerityFlow] DB_NAME is not set. Add it to your .env file.')
}

// ─── NextAuth v5 configuration ─────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  /**
   * Pass the already-cached Promise<MongoClient> from our db layer.
   * The MongoDBAdapter manages users / accounts / sessions / verificationTokens
   * in their own collections (separate from our vf_users Mongoose model).
   */
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.DB_NAME,
    collections: {
      Users:              'auth_users',
      Accounts:           'auth_accounts',
      Sessions:           'auth_sessions',
      VerificationTokens: 'auth_verification_tokens',
    },
  }) as any,  // Type assertion to bypass adapter version conflict

  secret: process.env.AUTH_SECRET,

  session: {
    strategy: 'database',
    maxAge:    30 * 24 * 60 * 60, // 30 days
    updateAge:      24 * 60 * 60, // refresh every 24 h
  },

  providers: [
    /**
     * Google OAuth 2.0
     * Redirect URI: {origin}/api/auth/callback/google
     */
    Google({
      clientId:     process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      /**
       * Allow accounts with identical emails to be linked automatically.
       * Safe here because Google verifies email ownership.
       */
      allowDangerousEmailAccountLinking: true,
    }),

    /**
     * Nodemailer magic-link provider.
     * Reads SMTP config from AUTH_EMAIL_SERVER env var:
     *   smtp://user:pass@smtp.example.com:587
     * Falls back gracefully when the var is absent (dev / CI).
     */
    Nodemailer({
      server:   process.env.AUTH_EMAIL_SERVER ?? 'smtp://localhost:1025',
      from:     process.env.AUTH_EMAIL_FROM   ?? 'VerityFlow <noreply@verityflow.io>',
    }),
  ],

  callbacks: {
    /**
     * signIn — runs on every successful authentication.
     *
     * We use it to upsert a VerityFlow-specific User document (in the
     * vf_users Mongoose model collection) on first login. On subsequent
     * logins this is a lightweight no-op (findOne only).
     */
    async signIn({ user }) {
      const email = user.email
      if (!email) return true  // shouldn’t happen with Google/Email providers

      try {
        await connectMongoose()

        const existing = await User.findOne({ email: email.toLowerCase() })

        if (!existing) {
          /**
           * First login — create the VerityFlow user document.
           * UUID id keeps our system consistent (not MongoDB ObjectId).
           */
          await User.create({
            id:               uuidv4(),
            email:            email.toLowerCase(),
            name:             user.name   ?? undefined,
            image:            user.image  ?? undefined,
            plan:             'free' satisfies Plan,
            modelCallsUsed:   0,
            modelCallsLimit:  PLAN_CALL_LIMITS.free,  // 50
          })
        }
      } catch (err) {
        // Log but don’t block sign-in — the user can still authenticate
        // even if our custom document creation fails.
        console.error('[VerityFlow] signIn upsert error:', err)
      }

      return true
    },

    /**
     * session — runs every time session.user is read.
     *
     * Fetches the VerityFlow User document and injects
     * plan / modelCallsUsed / modelCallsLimit into session.user.
     * This is a lightweight read (indexed by email).
     */
    async session({ session }) {
      if (!session.user?.email) return session

      try {
        await connectMongoose()

        const vfUser = await User.findOne(
          { email: session.user.email.toLowerCase() },
          'id plan modelCallsUsed modelCallsLimit',
        ).lean()

        if (vfUser) {
          session.user.id               = vfUser.id as string
          session.user.plan             = (vfUser.plan as Plan) ?? 'free'
          session.user.modelCallsUsed   = (vfUser.modelCallsUsed   as number) ?? 0
          session.user.modelCallsLimit  = (vfUser.modelCallsLimit  as number) ?? PLAN_CALL_LIMITS.free
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
