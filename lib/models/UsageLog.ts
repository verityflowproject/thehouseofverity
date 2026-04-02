/**
 * lib/models/UsageLog.ts — Firestore UsageLog helpers
 *
 * Collection: vf_usage_logs  (document ID = log UUID)
 *
 * Indexes needed in Firestore console / firestore.indexes.json:
 *   vf_usage_logs: userId ASC + createdAt ASC
 */

import { v4 as uuidv4 } from 'uuid'
import { db, toDate } from '@/lib/db/firestore'
import type { ModelRole, TaskType } from '@/lib/types'

const COL = 'vf_usage_logs'

// ─── Cost table ───────────────────────────────────────────────────────────────

export const MODEL_COST_PER_1K_TOKENS: Record<ModelRole, number> = {
  claude:      0.0072,
  'gpt5.4o':   0.00475,
  codestral:   0.00048,
  gemini:      0.0024,
  perplexity:  0.001,
} as const

export function estimateCost(model: ModelRole, totalTokens: number): number {
  const rate = MODEL_COST_PER_1K_TOKENS[model] ?? MODEL_COST_PER_1K_TOKENS['gpt5.4o']
  return Math.round(((totalTokens / 1_000) * rate) * 1e8) / 1e8
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IUsageLog {
  readonly id:      string
  userId:           string
  projectId:        string
  sessionId:        string
  aiModel:          ModelRole
  taskType:         TaskType
  promptTokens:     number
  completionTokens: number
  totalTokens:      number
  estimatedCostUsd: number
  success:          boolean
  durationMs:       number
  adapterStatusCode?: number
  errorMessage?:    string
  createdAt:        Date
  updatedAt:        Date
}

export interface UserUsageAggregate {
  totalCalls:   number
  totalTokens:  number
  totalCostUsd: number
  successRate:  number
}

export interface ProjectUsageAggregate {
  model:        ModelRole
  totalCalls:   number
  totalTokens:  number
  totalCostUsd: number
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fromDoc(data: FirebaseFirestore.DocumentData, id: string): IUsageLog {
  return {
    ...data,
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  } as IUsageLog
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const UsageLog = {
  async find(
    query: Partial<Pick<IUsageLog, 'userId' | 'projectId' | 'sessionId'>> & {
      createdAt?: { $gte?: Date; $lte?: Date }
    },
  ): Promise<IUsageLog[]> {
    let ref: FirebaseFirestore.Query = db.collection(COL)
    if (query.userId)    ref = ref.where('userId',    '==', query.userId)
    if (query.projectId) ref = ref.where('projectId', '==', query.projectId)
    if (query.sessionId) ref = ref.where('sessionId', '==', query.sessionId)
    if (query.createdAt?.$gte) ref = ref.where('createdAt', '>=', query.createdAt.$gte)
    if (query.createdAt?.$lte) ref = ref.where('createdAt', '<=', query.createdAt.$lte)
    const snap = await ref.orderBy('createdAt', 'desc').get()
    return snap.docs.map((d) => fromDoc(d.data(), d.id))
  },

  async insertMany(logs: Partial<IUsageLog>[]): Promise<void> {
    const now   = new Date()
    const batch = db.batch()
    for (const log of logs) {
      const id = log.id ?? uuidv4()
      const totalTokens = log.totalTokens ?? 0
      const aiModel     = log.aiModel as ModelRole
      const doc = {
        ...log,
        id,
        estimatedCostUsd: log.estimatedCostUsd ?? (totalTokens > 0 ? estimateCost(aiModel, totalTokens) : 0),
        createdAt:        log.createdAt ?? now,
        updatedAt:        log.updatedAt ?? now,
      }
      batch.set(db.collection(COL).doc(id), doc)
    }
    await batch.commit()
  },

  async aggregateForUser(
    userId: string,
    from:   Date,
    to:     Date,
  ): Promise<UserUsageAggregate> {
    const logs = await UsageLog.find({ userId, createdAt: { $gte: from, $lte: to } })
    const totalCalls   = logs.length
    const totalTokens  = logs.reduce((s, l) => s + (l.totalTokens ?? 0), 0)
    const totalCostUsd = logs.reduce((s, l) => s + (l.estimatedCostUsd ?? 0), 0)
    const successCount = logs.filter((l) => l.success).length
    return {
      totalCalls,
      totalTokens,
      totalCostUsd,
      successRate: totalCalls === 0 ? 1 : successCount / totalCalls,
    }
  },

  async aggregateForProject(projectId: string): Promise<ProjectUsageAggregate[]> {
    const logs = await UsageLog.find({ projectId })
    const byModel = new Map<ModelRole, ProjectUsageAggregate>()
    for (const log of logs) {
      const model = log.aiModel
      const entry = byModel.get(model) ?? { model, totalCalls: 0, totalTokens: 0, totalCostUsd: 0 }
      entry.totalCalls   += 1
      entry.totalTokens  += log.totalTokens ?? 0
      entry.totalCostUsd += log.estimatedCostUsd ?? 0
      byModel.set(model, entry)
    }
    return Array.from(byModel.values()).sort((a, b) => b.totalCalls - a.totalCalls)
  },

  async countCallsForUser(userId: string, since: Date): Promise<number> {
    const snap = await db.collection(COL)
      .where('userId', '==', userId)
      .where('createdAt', '>=', since)
      .count()
      .get()
    return snap.data().count
  },

  estimateCost,
}

export type IUsageLogModel = typeof UsageLog
