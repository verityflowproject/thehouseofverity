/**
 * lib/db/index.ts — Database client barrel
 *
 * Import from '@/lib/db' to access all three clients.
 */
export { connectMongoose, disconnectMongoose, mongoose } from './mongoose'
export { default as clientPromise } from './mongo-client'
export { redis, REDIS_TTL, RedisKeys } from './redis'
