/**
 * app/api/health/route.ts — Health check endpoint
 *
 * Pings MongoDB to verify system health.
 * Returns 200 if healthy, 503 if degraded.
 */

import { NextResponse } from 'next/server'
import { connectMongoose } from '@/lib/db/mongoose'

export async function GET() {
  const status = {
    timestamp: new Date().toISOString(),
    services: {
      mongodb: 'ok' as 'ok' | 'error',
    },
  }

  // Check MongoDB
  try {
    await connectMongoose()
    status.services.mongodb = 'ok'
  } catch (error) {
    console.error('[Health] MongoDB check failed:', error)
    status.services.mongodb = 'error'
  }

  // Return 503 if any service is degraded
  const isHealthy = status.services.mongodb === 'ok'
  const httpStatus = isHealthy ? 200 : 503

  return NextResponse.json(status, { status: httpStatus })
}
