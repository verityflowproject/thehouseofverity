/**
 * lib/db/firestore.ts — Firebase Admin singleton
 *
 * Initialises the Firebase Admin SDK once and exports the Firestore client.
 * Safe across Next.js hot-reloads: `getApps()` prevents double-initialisation.
 *
 * Authentication uses Application Default Credentials (ADC):
 *   - On Cloud Run / GCP: ADC is injected automatically by the metadata server.
 *     No key file is needed — just grant the Cloud Run service account the
 *     "Cloud Datastore User" role in IAM.
 *   - Locally: run `gcloud auth application-default login` once, then set
 *     FIREBASE_PROJECT_ID in .env.local.
 *   - Emulator: set FIRESTORE_EMULATOR_HOST=localhost:8080 in .env.local and
 *     run `firebase emulators:start --only firestore`.
 *
 * Usage (server-side only):
 *   import { db } from '@/lib/db/firestore'
 */

import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore'

if (!process.env.FIREBASE_PROJECT_ID) {
  throw new Error('[VerityFlow] FIREBASE_PROJECT_ID environment variable is not set.')
}

if (!getApps().length) {
  initializeApp({ projectId: process.env.FIREBASE_PROJECT_ID })
}

export const db = getFirestore()

// ─── Timestamp conversion helper ──────────────────────────────────────────────

/**
 * Convert a Firestore Timestamp (or Date / ISO string) to a JS Date.
 * Used when reading Firestore documents to normalise timestamp fields.
 */
export function toDate(val: unknown): Date {
  if (val instanceof Timestamp) return val.toDate()
  if (val instanceof Date)      return val
  if (typeof val === 'string')  return new Date(val)
  if (typeof val === 'number')  return new Date(val)
  return new Date()
}

export { FieldValue, Timestamp }
