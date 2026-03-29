/**
 * lib/db/index.ts — Database client barrel
 *
 * Import from '@/lib/db' to access all database clients.
 */
export { connectMongoose, disconnectMongoose, mongoose } from './mongoose'
export { default as clientPromise } from './mongo-client'

