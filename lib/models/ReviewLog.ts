/**
 * lib/models/ReviewLog.ts — Per-invocation model review record
 *
 * Every time one model reviews, critiques, or arbitrates another model's
 * output, a ReviewLog document is written. This forms the auditable
 * paper trail for every AI decision in a project.
 *
 * Relationships (UUID refs, not ObjectId):
 *   - projectId  → Project.id
 *   - sessionId  → the orchestrator session UUID
 */

import { Schema, model, models, type Document, type Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { ModelRole, TaskType, Severity } from '@/lib/types'

// ─── Outcome enum ─────────────────────────────────────────────────────────────

export type ReviewOutcome =
  | 'approved'   // Reviewer accepted the output as-is
  | 'rejected'   // Output discarded; task re-queued
  | 'patched'    // Reviewer applied a correction and accepted
  | 'escalated'  // Sent to council / arbitration

// ─── Embedded FlaggedIssue ────────────────────────────────────────────────────

const FlaggedIssueSchema = new Schema(
  {
    severity:   {
      type: String,
      enum: ['info', 'warning', 'error', 'critical'] satisfies Severity[],
      required: true,
    },
    code:       { type: String },
    message:    { type: String, required: true },
    file:       { type: String },
    line:       { type: Number, min: 1 },
    column:     { type: Number, min: 1 },
    suggestion: { type: String },
    autoFixed:  { type: Boolean, default: false },
  },
  { _id: false },
)

// ─── Embedded TokenUsage ──────────────────────────────────────────────────────

const TokenUsageSchema = new Schema(
  {
    promptTokens:     { type: Number, default: 0, min: 0 },
    completionTokens: { type: Number, default: 0, min: 0 },
    totalTokens:      { type: Number, default: 0, min: 0 },
    estimatedCostUsd: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
)

// ─── Document interface ───────────────────────────────────────────────────────

export interface IReviewLog extends Document {
  readonly id:          string
  projectId:            string           // UUID → Project.id
  sessionId:            string           // UUID → orchestrator session
  /** The model that performed the review / arbitration. */
  reviewingModel:       ModelRole
  /** The model whose output is being reviewed. */
  authorModel:          ModelRole
  taskType:             TaskType
  /** Short summary of the input given to the author model. */
  inputSummary:         string
  /** Short summary of the author model's output. */
  outputSummary:        string
  flaggedIssues:        Array<{
    severity:   Severity
    code?:      string
    message:    string
    file?:      string
    line?:      number
    column?:    number
    suggestion?: string
    autoFixed:  boolean
  }>
  outcome:              ReviewOutcome
  /** The patch applied by the reviewer, if outcome === 'patched'. */
  patchApplied?:        string
  arbitrationRequired:  boolean
  /** Rationale written by the arbitrator model, if arbitration occurred. */
  arbitrationRationale?: string
  tokensUsed:           {
    promptTokens:     number
    completionTokens: number
    totalTokens:      number
    estimatedCostUsd: number
  }
  /** Wall-clock ms from task dispatch to this review completing. */
  durationMs:           number
  /** Reviewer's self-reported confidence (0.0 – 1.0). */
  confidence:           number
  createdAt:            Date
  updatedAt:            Date

  // Helpers
  isEscalated(): boolean
  criticalIssueCount(): number
}

export interface IReviewLogModel extends Model<IReviewLog> {
  findByProject(projectId: string, limit?: number): Promise<IReviewLog[]>
  findBySession(sessionId: string): Promise<IReviewLog[]>
  countByOutcome(
    projectId: string,
  ): Promise<Record<ReviewOutcome, number>>
}

// ─── Schema definition ────────────────────────────────────────────────────────

const MODEL_ROLE_ENUM = ['claude', 'gpt5.4o', 'codestral', 'gemini', 'perplexity'] satisfies ModelRole[]
const TASK_TYPE_ENUM  = ['architecture', 'implementation', 'research', 'refactor', 'review', 'arbitration'] satisfies TaskType[]

const ReviewLogSchema = new Schema<IReviewLog, IReviewLogModel>(
  {
    id: {
      type:      String,
      default:   uuidv4,
      unique:    true,
      index:     true,
      immutable: true,
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

    reviewingModel: {
      type:     String,
      enum:     MODEL_ROLE_ENUM,
      required: [true, 'reviewingModel is required'],
      index:    true,
    },

    authorModel: {
      type:     String,
      enum:     MODEL_ROLE_ENUM,
      required: [true, 'authorModel is required'],
      index:    true,
    },

    taskType: {
      type:     String,
      enum:     TASK_TYPE_ENUM,
      required: [true, 'taskType is required'],
      index:    true,
    },

    inputSummary: {
      type:     String,
      required: [true, 'inputSummary is required'],
      maxlength: 2000,
    },

    outputSummary: {
      type:     String,
      required: [true, 'outputSummary is required'],
      maxlength: 2000,
    },

    flaggedIssues: {
      type:    [FlaggedIssueSchema],
      default: [],
    },

    outcome: {
      type:     String,
      enum:     ['approved', 'rejected', 'patched', 'escalated'] satisfies ReviewOutcome[],
      required: [true, 'outcome is required'],
      index:    true,
    },

    patchApplied: {
      type: String,
      // Large field — store full diff; no maxlength enforced here.
    },

    arbitrationRequired: {
      type:    Boolean,
      default: false,
      index:   true,
    },

    arbitrationRationale: {
      type:      String,
      maxlength: 4000,
    },

    tokensUsed: {
      type:     TokenUsageSchema,
      required: true,
      default:  {},
    },

    durationMs: {
      type:    Number,
      default: 0,
      min:     0,
    },

    confidence: {
      type:    Number,
      min:     0,
      max:     1,
      default: 0.8,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
)

// ─── Compound indexes ─────────────────────────────────────────────────────────

ReviewLogSchema.index({ projectId: 1, createdAt: -1 })
ReviewLogSchema.index({ projectId: 1, outcome: 1 })
ReviewLogSchema.index({ sessionId: 1, taskType: 1 })
ReviewLogSchema.index({ reviewingModel: 1, authorModel: 1, outcome: 1 })

// ─── Instance methods ─────────────────────────────────────────────────────────

ReviewLogSchema.methods.isEscalated = function (this: IReviewLog): boolean {
  return this.outcome === 'escalated' || this.arbitrationRequired
}

ReviewLogSchema.methods.criticalIssueCount = function (this: IReviewLog): number {
  return this.flaggedIssues.filter((i) => i.severity === 'critical').length
}

// ─── Static methods ───────────────────────────────────────────────────────────

ReviewLogSchema.statics.findByProject = function (
  projectId: string,
  limit = 100,
): Promise<IReviewLog[]> {
  return this.find({ projectId }).sort({ createdAt: -1 }).limit(limit)
}

ReviewLogSchema.statics.findBySession = function (
  sessionId: string,
): Promise<IReviewLog[]> {
  return this.find({ sessionId }).sort({ createdAt: 1 })
}

ReviewLogSchema.statics.countByOutcome = async function (
  projectId: string,
): Promise<Record<ReviewOutcome, number>> {
  const results = await this.aggregate<{ _id: ReviewOutcome; count: number }>([
    { $match: { projectId } },
    { $group: { _id: '$outcome', count: { $sum: 1 } } },
  ])

  const base: Record<ReviewOutcome, number> = {
    approved: 0, rejected: 0, patched: 0, escalated: 0,
  }
  for (const r of results) base[r._id] = r.count
  return base
}

// ─── Model export ─────────────────────────────────────────────────────────────

export const ReviewLog: IReviewLogModel =
  (models.ReviewLog as IReviewLogModel) ??
  model<IReviewLog, IReviewLogModel>('ReviewLog', ReviewLogSchema)
