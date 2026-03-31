/**
 * lib/models/index.ts — Mongoose model barrel
 *
 * Import from '@/lib/models' to access all five Mongoose models.
 * Always call `await connectMongoose()` before using any model.
 *
 * @example
 *   import { User, Project, ProjectState, ReviewLog, UsageLog } from '@/lib/models'
 *   import { connectMongoose } from '@/lib/db'
 *   await connectMongoose()
 *   const user = await User.findByEmail('alice@example.com')
 */

export { User }               from './User'
export { Project }            from './Project'
export { ProjectState }       from './ProjectState'
export { ReviewLog }          from './ReviewLog'
export { UsageLog, estimateCost, MODEL_COST_PER_1K_TOKENS } from './UsageLog'
export { CreditTransaction }  from './CreditTransaction'

// Re-export document interfaces for typed consumers
export type { IUser,         IUserModel         } from './User'
export type { IProject,      IProjectModel,  ProjectStatus  } from './Project'
export type { IProjectState, IProjectStateModel } from './ProjectState'
export type { IReviewLog,    IReviewLogModel, ReviewOutcome  } from './ReviewLog'
export type {
  IUsageLog,
  IUsageLogModel,
  UserUsageAggregate,
  ProjectUsageAggregate,
} from './UsageLog'
export type {
  ICreditTransaction,
  ICreditTransactionModel,
  CreditTransactionType,
} from './CreditTransaction'
