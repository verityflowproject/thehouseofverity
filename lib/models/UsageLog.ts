/**
 * lib/models/UsageLog.ts — Supabase UsageLog helpers
 *
 * Table: vf_usage_logs  (id = UUID)
 * Public API is unchanged from the Firestore version.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'
import type { ModelRole, TaskType } from '@/lib/types'

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

// ─── Row mapper ───────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): IUsageLog {
  return {
    id:                  row.id                   as string,
    userId:              row.user_id              as string,
    projectId:           row.project_id           as string,
    sessionId:           row.session_id           as string,
    aiModel:             row.ai_model             as ModelRole,
    taskType:            row.task_type            as TaskType,
    promptTokens:        (row.prompt_tokens       as number) ?? 0,
    completionTokens:    (row.completion_tokens   as number) ?? 0,
    totalTokens:         (row.total_tokens        as number) ?? 0,
    estimatedCostUsd:    (row.estimated_cost_usd  as number) ?? 0,
    success:             (row.success             as boolean) ?? true,
    durationMs:          (row.duration_ms         as number) ?? 0,
    adapterStatusCode:   row.adapter_status_code  as number | undefined,
    errorMessage:        row.error_message        as string | undefined,
    createdAt:           new Date(row.created_at as string),
    updatedAt:           new Date(row.updated_at as string),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const UsageLog = {
  async find(
    query: Partial<Pick<IUsageLog, 'userId' | 'projectId' | 'sessionId'>> & {
      createdAt?: { $gte?: Date; $lte?: Date }
    },
  ): Promise<IUsageLog[]> {
    let q = supabaseAdmin.from('vf_usage_logs').select('*')

    if (query.userId)    q = q.eq('user_id',    query.userId)
    if (query.projectId) q = q.eq('project_id', query.projectId)
    if (query.sessionId) q = q.eq('session_id', query.sessionId)
    if (query.createdAt?.$gte) q = q.gte('created_at', query.createdAt.$gte.toISOString())
    if (query.createdAt?.$lte) q = q.lte('created_at', query.createdAt.$lte.toISOString())

    q = q.order('created_at', { ascending: false })

    const { data, error } = await q
    if (error || !data) return []
    return data.map(fromRow)
  },

  async insertMany(logs: Partial<IUsageLog>[]): Promise<void> {
    const now = new Date()
    const rows = logs.map((log) => {
      const totalTokens = log.totalTokens ?? 0
      const aiModel     = log.aiModel as ModelRole
      return {
        user_id:            log.userId,
        project_id:         log.projectId,
        session_id:         log.sessionId,
        ai_model:           aiModel,
        task_type:          log.taskType,
        prompt_tokens:      log.promptTokens ?? 0,
        completion_tokens:  log.completionTokens ?? 0,
        total_tokens:       totalTokens,
        estimated_cost_usd: log.estimatedCostUsd ?? (totalTokens > 0 ? estimateCost(aiModel, totalTokens) : 0),
        success:            log.success ?? true,
        duration_ms:        log.durationMs ?? 0,
        adapter_status_code: log.adapterStatusCode,
        error_message:      log.errorMessage,
        created_at:         log.createdAt ?? now,
        updated_at:         log.updatedAt ?? now,
        ...(log.id ? { id: log.id } : {}),
      }
    })

    await table('vf_usage_logs').insert(rows)
  },

  async aggregateForUser(
    userId: string,
    from:   Date,
    to:     Date,
  ): Promise<UserUsageAggregate> {
    const logs = await UsageLog.find({ userId, createdAt: { $gte: from, $lte: to } })
    const totalCalls   = logs.length
    const totalTokens  = logs.reduce((s, l) => s + l.totalTokens, 0)
    const totalCostUsd = logs.reduce((s, l) => s + l.estimatedCostUsd, 0)
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
      entry.totalTokens  += log.totalTokens
      entry.totalCostUsd += log.estimatedCostUsd
      byModel.set(model, entry)
    }
    return Array.from(byModel.values()).sort((a, b) => b.totalCalls - a.totalCalls)
  },

  async countCallsForUser(userId: string, since: Date): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('vf_usage_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())

    if (error) return 0
    return count ?? 0
  },

  estimateCost,
}

export type IUsageLogModel = typeof UsageLog
