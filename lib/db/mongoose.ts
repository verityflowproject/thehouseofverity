/**
 * lib/db/mongoose.ts — Mongoose connection with global hot-reload-safe caching
 *
 * In Next.js development mode the module cache is cleared on every hot reload,
 * which would create a new mongoose connection on every request without this
 * global cache. We attach the cached promise to `globalThis` so it survives
 * across module reloads.
 *
 * Usage (server-side only):
 *   import { connectMongoose } from '@/lib/db/mongoose'
 *   await connectMongoose()
 */

import mongoose, { type Mongoose } from 'mongoose'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME   = process.env.DB_NAME

if (!MONGO_URL) {
  throw new Error(
    '[VerityFlow] MONGO_URL environment variable is not set. ' +
    'Add it to your .env file.',
  )
}

if (!DB_NAME) {
  throw new Error(
    '[VerityFlow] DB_NAME environment variable is not set. ' +
    'Add it to your .env file.',
  )
}

// ─── Global cache type ────────────────────────────────────────────────────────

interface MongooseCache {
  conn:    Mongoose | null
  promise: Promise<Mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var __vf_mongoose: MongooseCache | undefined
}

// Initialise the global cache slot once.
globalThis.__vf_mongoose ??= { conn: null, promise: null }

const cache: MongooseCache = globalThis.__vf_mongoose

// ─── Connection options ───────────────────────────────────────────────────────

const MONGOOSE_OPTS: mongoose.ConnectOptions = {
  dbName:              DB_NAME,
  maxPoolSize:         10,
  serverSelectionTimeoutMS: 5_000,
  socketTimeoutMS:     45_000,
  family:              4,       // force IPv4
  bufferCommands:      false,   // surface errors immediately instead of buffering
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a shared Mongoose instance, creating the connection on the first
 * call and reusing the cached one thereafter.
 *
 * Safe to call multiple times concurrently — the pending promise is shared.
 */
export async function connectMongoose(): Promise<Mongoose> {
  if (cache.conn) return cache.conn

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGO_URL!, MONGOOSE_OPTS)
      .then((mg) => {
        console.info('[VerityFlow] Mongoose connected to', DB_NAME)
        return mg
      })
      .catch((err) => {
        // Reset so the next call can retry.
        cache.promise = null
        throw err
      })
  }

  cache.conn = await cache.promise
  return cache.conn
}

/**
 * Closes the Mongoose connection and clears the cache.
 * Call this in tests or scripts that need a clean teardown.
 */
export async function disconnectMongoose(): Promise<void> {
  if (cache.conn) {
    await cache.conn.disconnect()
    cache.conn    = null
    cache.promise = null
  }
}

/** The underlying mongoose instance (useful for accessing `mongoose.Schema`, etc.). */
export { mongoose }
