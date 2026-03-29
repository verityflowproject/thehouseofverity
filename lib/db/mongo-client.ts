/**
 * lib/db/mongo-client.ts — Raw MongoClient singleton for NextAuth MongoDB Adapter
 *
 * NextAuth's `@auth/mongodb-adapter` expects a `Promise<MongoClient>`, not a
 * Mongoose connection, so we maintain a separate raw client here.
 *
 * The same global-cache trick used in mongoose.ts prevents duplicate clients
 * across hot reloads in development.
 *
 * Usage:
 *   import clientPromise from '@/lib/db/mongo-client'
 *   const adapter = MongoDBAdapter(clientPromise)
 */

import { MongoClient, type MongoClientOptions } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL

if (!MONGO_URL) {
  throw new Error(
    '[VerityFlow] MONGO_URL environment variable is not set.',
  )
}

// ─── Global cache type ────────────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __vf_mongoClient: Promise<MongoClient> | undefined
}

// ─── Client options ───────────────────────────────────────────────────────────

const CLIENT_OPTS: MongoClientOptions = {
  maxPoolSize:              10,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS:          45_000,
  // NextAuth writes sessions frequently; prefer acknowledged writes.
  writeConcern: { w: 'majority' },
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  /**
   * In development we attach the promise to `globalThis` so it persists
   * across hot reloads without opening a new connection each time.
   */
  if (!globalThis.__vf_mongoClient) {
    const client = new MongoClient(MONGO_URL!, CLIENT_OPTS)
    globalThis.__vf_mongoClient = client.connect().then((c) => {
      console.info('[VerityFlow] MongoClient connected (dev cache)')
      return c
    })
  }
  clientPromise = globalThis.__vf_mongoClient
} else {
  /**
   * In production we create a new promise per module load.
   * Module caching means this only ever runs once.
   */
  const client = new MongoClient(MONGO_URL!, CLIENT_OPTS)
  clientPromise = client.connect().then((c) => {
    console.info('[VerityFlow] MongoClient connected (production)')
    return c
  })
}

/**
 * A `Promise<MongoClient>` that resolves to an open, pooled MongoDB client.
 * Pass directly to `MongoDBAdapter(clientPromise)` in `[...nextauth].ts`.
 */
export default clientPromise
