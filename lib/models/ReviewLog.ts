/**
 * lib/models/ReviewLog.ts — Supabase ReviewLog helpers
 *
 * Table: vf_review_logs  (id = UUID)
 * Public API is unchanged from the Firestore version.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'
import type { ModelRole, TaskType, Severity } from '@/lib/types'

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

// ─── Row mapper ───────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): IReviewLog {
  return {
    id:                   row.id                   as string,
    projectId:            row.project_id            as string,
    sessionId:            row.session_id            as string,
    reviewingModel:       row.reviewing_model       as ModelRole,
    authorModel:          row.author_model          as ModelRole,
    taskType:             row.task_type             as TaskType,
    inputSummary:         row.input_summary         as string,
    outputSummary:        row.output_summary        as string,
    flaggedIssues:        (row.flagged_issues        as IReviewLog['flaggedIssues']) ?? [],
    outcome:              row.outcome               as ReviewOutcome,
    patchApplied:         row.patch_applied         as string | undefined,
    arbitrationRequired:  (row.arbitration_required  as boolean) ?? false,
    arbitrationRationale: row.arbitration_rationale as string | undefined,
    tokensUsed:           (row.tokens_used           as IReviewLog['tokensUsed']) ?? {
      promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCostUsd: 0,
    },
    durationMs:  (row.duration_ms as number) ?? 0,
    confidence:  (row.confidence  as number) ?? 0.8,
    createdAt:   new Date(row.created_at as string),
    updatedAt:   new Date(row.updated_at as string),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const ReviewLog = {
  async create(data: Partial<IReviewLog>): Promise<IReviewLog> {
    const now = new Date()
    const row: Record<string, unknown> = {
      project_id:           data.projectId,
      session_id:           data.sessionId,
      reviewing_model:      data.reviewingModel,
      author_model:         data.authorModel,
      task_type:            data.taskType,
      input_summary:        data.inputSummary  ?? '',
      output_summary:       data.outputSummary ?? '',
      flagged_issues:       data.flaggedIssues ?? [],
      outcome:              data.outcome,
      patch_applied:        data.patchApplied,
      arbitration_required: data.arbitrationRequired ?? false,
      arbitration_rationale: data.arbitrationRationale,
      tokens_used:          data.tokensUsed ?? {},
      duration_ms:          data.durationMs ?? 0,
      confidence:           data.confidence ?? 0.8,
      created_at:           data.createdAt ?? now,
      updated_at:           data.updatedAt ?? now,
    }
    if (data.id) row['id'] = data.id

    const { data: created, error } = await table('vf_review_logs').insert(row).select().single()

    if (error || !created) throw new Error(`Failed to create review log: ${error?.message}`)
    return fromRow(created)
  },

  async find(
    query: Partial<Pick<IReviewLog, 'projectId' | 'sessionId'>>,
    opts: { limit?: number; sort?: 'asc' | 'desc' } = {},
  ): Promise<IReviewLog[]> {
    let q = supabaseAdmin.from('vf_review_logs').select('*')

    if (query.projectId) q = q.eq('project_id', query.projectId)
    if (query.sessionId) q = q.eq('session_id', query.sessionId)

    q = q.order('created_at', { ascending: opts.sort === 'asc' })
    if (opts.limit) q = q.limit(opts.limit)

    const { data, error } = await q
    if (error || !data) return []
    return data.map(fromRow)
  },

  async findByProject(projectId: string, limit = 100): Promise<IReviewLog[]> {
    return ReviewLog.find({ projectId }, { limit })
  },

  async findBySession(sessionId: string): Promise<IReviewLog[]> {
    return ReviewLog.find({ sessionId }, { sort: 'asc' })
  },

  async countByOutcome(projectId: string): Promise<Record<ReviewOutcome, number>> {
    const { data } = await supabaseAdmin
      .from('vf_review_logs')
      .select('outcome')
      .eq('project_id', projectId)

    const base: Record<ReviewOutcome, number> = {
      approved: 0, rejected: 0, patched: 0, escalated: 0,
    }

    for (const row of data ?? []) {
      const outcome = (row as Record<string, unknown>).outcome as ReviewOutcome
      if (outcome in base) base[outcome]++
    }

    return base
  },
}

export type IReviewLogModel = typeof ReviewLog
