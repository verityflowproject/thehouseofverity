/**
 * lib/models/ReviewLog.ts — Firestore ReviewLog helpers
 *
 * Collection: vf_review_logs  (document ID = log UUID)
 *
 * Indexes needed:
 *   vf_review_logs: projectId ASC + createdAt DESC
 *   vf_review_logs: sessionId ASC + createdAt ASC
 */

import { v4 as uuidv4 } from 'uuid'
import { db, toDate } from '@/lib/db/firestore'
import type { ModelRole, TaskType, Severity } from '@/lib/types'

const COL = 'vf_review_logs'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewOutcome = 'approved' | 'rejected' | 'patched' | 'escalated'

export interface IReviewLog {
  readonly id:           string
  projectId:             string
  sessionId:             string
  reviewingModel:        ModelRole
  authorModel:           ModelRole
  taskType:              TaskType
  inputSummary:          string
  outputSummary:         string
  flaggedIssues:         Array<{
    severity:   Severity
    code?:      string
    message:    string
    file?:      string
    line?:      number
    column?:    number
    suggestion?: string
    autoFixed:  boolean
  }>
  outcome:               ReviewOutcome
  patchApplied?:         string
  arbitrationRequired:   boolean
  arbitrationRationale?: string
  tokensUsed: {
    promptTokens:     number
    completionTokens: number
    totalTokens:      number
    estimatedCostUsd: number
  }
  durationMs:  number
  confidence:  number
  createdAt:   Date
  updatedAt:   Date
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fromDoc(data: FirebaseFirestore.DocumentData, id: string): IReviewLog {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as IReviewLog
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const ReviewLog = {
  async create(data: Partial<IReviewLog>): Promise<IReviewLog> {
    const now = new Date()
    const id  = data.id ?? uuidv4()
    const doc = {
      ...data,
      id,
      flaggedIssues:       data.flaggedIssues ?? [],
      arbitrationRequired: data.arbitrationRequired ?? false,
      durationMs:          data.durationMs ?? 0,
      confidence:          data.confidence ?? 0.8,
      createdAt:           data.createdAt ?? now,
      updatedAt:           data.updatedAt ?? now,
    }
    await db.collection(COL).doc(id).set(doc)
    return fromDoc(doc, id)
  },

  async find(
    query: Partial<Pick<IReviewLog, 'projectId' | 'sessionId'>>,
    opts: { limit?: number; sort?: 'asc' | 'desc' } = {},
  ): Promise<IReviewLog[]> {
    let ref: FirebaseFirestore.Query = db.collection(COL)
    if (query.projectId) ref = ref.where('projectId', '==', query.projectId)
    if (query.sessionId) ref = ref.where('sessionId', '==', query.sessionId)
    ref = ref.orderBy('createdAt', opts.sort ?? 'desc')
    if (opts.limit) ref = ref.limit(opts.limit)
    const snap = await ref.get()
    return snap.docs.map((d) => fromDoc(d.data(), d.id))
  },

  async findByProject(projectId: string, limit = 100): Promise<IReviewLog[]> {
    return ReviewLog.find({ projectId }, { limit })
  },

  async findBySession(sessionId: string): Promise<IReviewLog[]> {
    return ReviewLog.find({ sessionId }, { sort: 'asc' })
  },

  async countByOutcome(projectId: string): Promise<Record<ReviewOutcome, number>> {
    const snap = await db.collection(COL)
      .where('projectId', '==', projectId)
      .get()
    const base: Record<ReviewOutcome, number> = {
      approved: 0, rejected: 0, patched: 0, escalated: 0,
    }
    snap.forEach((doc) => {
      const outcome = doc.data().outcome as ReviewOutcome
      if (outcome in base) base[outcome]++
    })
    return base
  },
}

export type IReviewLogModel = typeof ReviewLog
