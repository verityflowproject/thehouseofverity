/**
 * app/api/health/route.ts — Health check endpoint
 *
 * Pings Firestore to verify system health.
 * Returns 200 if healthy, 503 if degraded.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db/firestore'

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    services: {
      firestore: 'ok' as 'ok' | 'error',
    },
  }

  try {
    await db.collection('_health').doc('ping').get()
    status.services.firestore = 'ok'
  } catch (error) {
    console.error('[Health] Firestore check failed:', error)
    status.services.firestore = 'error'
  }

  const isHealthy = status.services.firestore === 'ok'
  return NextResponse.json(status, { status: isHealthy ? 200 : 503 })
}
