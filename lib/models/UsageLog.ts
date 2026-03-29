/**
 * lib/models/UsageLog.ts — Per-model-call usage and cost record
 *
 * Written after every successful (or failed) model invocation.
 * Powers:
 *   - The usage dashboard
 *   - Quota enforcement (modelCallsUsed gate)
 *   - Cost attribution per project / user
 *   - Monthly cron reset (zero out counters, keep historical records)
 *
 * Cost estimation uses rough blended per-1k-token rates for each model
 * (weighted average of observed input/output token ratios, June 2025).
 *
 * Relationships (UUID refs):
 *   userId    → User.id
 *   projectId → Project.id
 *   sessionId → orchestrator session UUID
 */

import { Schema, model, models, type Document, type Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { ModelRole, TaskType } from '@/lib/types'

// ─── Cost table ───────────────────────────────────────────────────────────────

/**
 * Blended per-1,000-token USD rates (prompt + completion, weighted 70/30).
 * Updated June 2025 based on published provider pricing.
 *
 * claude    : Sonnet 3.5 — $3/M input · $15/M output → blended ~$7.2/M → $0.0072/1k
 * gpt5.4o   : GPT-4.5o   — $2.5/M input · $10/M output → blended ~$4.75/M → $0.00475/1k
 * codestral : Codestral  — $0.3/M input · $0.9/M output → blended ~$0.48/M → $0.00048/1k
 * gemini    : 1.5 Pro    — $1.25/M input · $5/M output → blended ~$2.375/M → $0.0024/1k
 * perplexity: pplx-70b   — $1/M (flat)                              → $0.001/1k
 */
export const MODEL_COST_PER_1K_TOKENS: Record<ModelRole, number> = {
  claude:      0.0072,
  'gpt5.4o':   0.00475,
  codestral:   0.00048,
  gemini:      0.0024,
  perplexity:  0.001,
} as const

/**
 * Estimate the USD cost for a given model and token count.
 *
 * @param model       - The ModelRole that generated the tokens.
 * @param totalTokens - Combined prompt + completion token count.
 * @returns           Estimated cost in USD, rounded to 8 decimal places.
 *
 * @example
 *   estimateCost('claude', 2500)  // → 0.018 USD
 *   estimateCost('codestral', 10_000) // → 0.0048 USD
 */
export function estimateCost(model: ModelRole, totalTokens: number): number {
  const rate = MODEL_COST_PER_1K_TOKENS[model] ?? MODEL_COST_PER_1K_TOKENS['gpt5.4o']
  const raw  = (totalTokens / 1_000) * rate
  // Round to 8 decimal places to avoid floating-point drift in aggregations.
  return Math.round(raw * 1e8) / 1e8
}

// ─── Document interface ───────────────────────────────────────────────────────

export interface IUsageLog extends Document {
  readonly id:      string
  userId:           string   // UUID → User.id
  projectId:        string   // UUID → Project.id
  sessionId:        string   // UUID → orchestrator session
  /**
   * The AI model that handled this task.
   * Named 'aiModel' in the TypeScript interface to avoid conflicting
   * with the Mongoose Document.model() method; the MongoDB field is 'model'.
   */
  aiModel:          ModelRole
  taskType:         TaskType
  promptTokens:     number
  completionTokens: number
  totalTokens:      number
  estimatedCostUsd: number
  success:          boolean
  /** Wall-clock ms from task dispatch to completion (or failure). */
  durationMs:       number
  /** HTTP status code returned by the model adapter, if applicable. */
  adapterStatusCode?: number
  /** Short error message if success === false. */
  errorMessage?:    string
  createdAt:        Date
  updatedAt:        Date
}

export interface IUsageLogModel extends Model<IUsageLog> {
  /**
   * Estimate cost for a model + token count without creating a document.
   * Exposed as a static so callers can use it before writing.
   */
  estimateCost(model: ModelRole, totalTokens: number): number

  /** Return aggregated usage totals for a user in a date range. */
  aggregateForUser(
    userId:    string,
    from:      Date,
    to:        Date,
  ): Promise<UserUsageAggregate>

  /** Return per-model token breakdown for a project. */
  aggregateForProject(
    projectId: string,
  ): Promise<ProjectUsageAggregate[]>

  /** Count calls in the current billing window for quota checks. */
  countCallsForUser(userId: string, since: Date): Promise<number>
}

// ─── Aggregate result shapes ──────────────────────────────────────────────────

export interface UserUsageAggregate {
  totalCalls:   number
  totalTokens:  number
  totalCostUsd: number
  successRate:  number  // 0.0 – 1.0
}

export interface ProjectUsageAggregate {
  model:        ModelRole
  totalCalls:   number
  totalTokens:  number
  totalCostUsd: number
}

// ─── Schema definition ────────────────────────────────────────────────────────

const MODEL_ROLE_ENUM = ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[]
const TASK_TYPE_ENUM  = ['architecture', 'implementation', 'research', 'refactor', 'review', 'arbitration'] satisfies TaskType[]

const UsageLogSchema = new Schema<IUsageLog, IUsageLogModel>(
  {
    id: {
      type:      String,
      default:   uuidv4,
      unique:    true,
      index:     true,
      immutable: true,
    },

    userId: {
      type:     String,
      required: [true, 'userId is required'],
      index:    true,
    },

    projectId: {
      type:     String,
      required: [true, 'projectId is required'],
      index:    true,
    },

    sessionId: {
      type:     String,
      required: [true, 'sessionId is required'],
      index:    true,
    },

    aiModel: {
      type:     String,
      enum:     MODEL_ROLE_ENUM,
      required: [true, 'model is required'],
      index:    true,
    },

    taskType: {
      type:     String,
      enum:     TASK_TYPE_ENUM,
      required: [true, 'taskType is required'],
      index:    true,
    },

    promptTokens: {
      type:    Number,
      default: 0,
      min:     0,
    },

    completionTokens: {
      type:    Number,
      default: 0,
      min:     0,
    },

    totalTokens: {
      type:    Number,
      default: 0,
      min:     0,
    },

    estimatedCostUsd: {
      type:    Number,
      default: 0,
      min:     0,
    },

    success: {
      type:    Boolean,
      default: true,
      index:   true,
    },

    durationMs: {
      type:    Number,
      default: 0,
      min:     0,
    },

    adapterStatusCode: {
      type: Number,
    },

    errorMessage: {
      type:      String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
)

// ─── Compound indexes ─────────────────────────────────────────────────────────

UsageLogSchema.index({ userId:    1, createdAt: -1 })
UsageLogSchema.index({ projectId: 1, createdAt: -1 })
UsageLogSchema.index({ userId:    1, model:     1, createdAt: -1 })
UsageLogSchema.index({ userId:    1, success:   1, createdAt: -1 })
// TTL index: auto-delete raw logs after 2 years (adjust as needed)
UsageLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 730 })

// ─── Pre-save: auto-calculate cost if not provided ───────────────────────────

UsageLogSchema.pre('save', async function () {
  if (this.isModified('totalTokens') || this.isNew) {
    const totalTokens = this.get('totalTokens') as number
    const aiModel     = this.get('aiModel') as ModelRole
    if ((this.get('estimatedCostUsd') as number) === 0 && totalTokens > 0) {
      this.set('estimatedCostUsd', estimateCost(aiModel, totalTokens))
    }
  }
})

// ─── Static methods ───────────────────────────────────────────────────────────

/**
 * Static cost estimator — identical to the module-level function but
 * accessible via the model class: `UsageLog.estimateCost('claude', 2000)`.
 */
UsageLogSchema.statics.estimateCost = estimateCost

UsageLogSchema.statics.aggregateForUser = async function (
  userId: string,
  from:   Date,
  to:     Date,
): Promise<UserUsageAggregate> {
  const [result] = await this.aggregate<UserUsageAggregate & { _id: null }>([
    {
      $match: {
        userId,
        createdAt: { $gte: from, $lte: to },
      },
    },
    {
      $group: {
        _id:          null,
        totalCalls:   { $sum: 1 },
        totalTokens:  { $sum: '$totalTokens' },
        totalCostUsd: { $sum: '$estimatedCostUsd' },
        successCount: { $sum: { $cond: ['$success', 1, 0] } },
      },
    },
    {
      $project: {
        _id:          0,
        totalCalls:   1,
        totalTokens:  1,
        totalCostUsd: 1,
        successRate:  {
          $cond: [
            { $eq: ['$totalCalls', 0] },
            0,
            { $divide: ['$successCount', '$totalCalls'] },
          ],
        },
      },
    },
  ])

  return result ?? {
    totalCalls: 0, totalTokens: 0, totalCostUsd: 0, successRate: 1,
  }
}

UsageLogSchema.statics.aggregateForProject = async function (
  projectId: string,
): Promise<ProjectUsageAggregate[]> {
  return this.aggregate<ProjectUsageAggregate>([
    { $match: { projectId } },
    {
      $group: {
        _id:          '$aiModel',
        totalCalls:   { $sum: 1 },
        totalTokens:  { $sum: '$totalTokens' },
        totalCostUsd: { $sum: '$estimatedCostUsd' },
      },
    },
    {
      $project: {
        _id:          0,
        model:        '$_id',
        totalCalls:   1,
        totalTokens:  1,
        totalCostUsd: 1,
      },
    },
    { $sort: { totalCalls: -1 } },
  ])
}

UsageLogSchema.statics.countCallsForUser = function (
  userId: string,
  since:  Date,
): Promise<number> {
  return this.countDocuments({
    userId,
    createdAt: { $gte: since },
  })
}

// ─── Model export ─────────────────────────────────────────────────────────────

export const UsageLog: IUsageLogModel =
  (models.UsageLog as IUsageLogModel) ??
  model<IUsageLog, IUsageLogModel>('UsageLog', UsageLogSchema)
