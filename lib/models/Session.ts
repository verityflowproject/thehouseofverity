/**
 * lib/models/Session.ts — Supabase Session helpers
 *
 * Table: vf_sessions
 * Stores all council session outputs for durable retrieval across visits.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ISessionOutput {
  model:         string
  taskType:      string
  output:        string
  flaggedIssues: Array<{
    severity:  string
    code?:     string
    message:   string
    autoFixed: boolean
  }>
  tokensUsed: {
    promptTokens:     number
    completionTokens: number
    totalTokens:      number
    estimatedCostUsd: number
  }
}

export interface ICostBreakdownEntry {
  model:        string
  taskType:     string
  inputTokens:  number
  outputTokens: number
  creditsUsed:  number
  realCostUsd:  number
  markupUsd:    number
  totalCostUsd: number
}

export interface ISession {
  readonly id: string
  sessionId:   string
  projectId:   string
  userId:      string
  prompt:      string
  outputs:     ISessionOutput[]
  creditsUsed: number
  costBreakdown?: ICostBreakdownEntry[]
  status:      string
  durationMs?: number
  createdAt:   Date
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): ISession {
  return {
    id:            row.id          as string,
    sessionId:     row.session_id  as string,
    projectId:     row.project_id  as string,
    userId:        row.user_id     as string,
    prompt:        row.prompt      as string,
    outputs:       (row.outputs    as ISessionOutput[]) ?? [],
    creditsUsed:   (row.credits_used as number) ?? 0,
    costBreakdown: row.cost_breakdown as ICostBreakdownEntry[] | undefined,
    status:        (row.status     as string) ?? 'complete',
    durationMs:    row.duration_ms as number | undefined,
    createdAt:     new Date(row.created_at as string),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const Session = {
  async create(data: Omit<ISession, 'id' | 'createdAt'>): Promise<ISession> {
    const row: Record<string, unknown> = {
      session_id:     data.sessionId,
      project_id:     data.projectId,
      user_id:        data.userId,
      prompt:         data.prompt,
      outputs:        data.outputs,
      credits_used:   data.creditsUsed,
      cost_breakdown: data.costBreakdown ?? null,
      status:         data.status ?? 'complete',
      duration_ms:    data.durationMs ?? null,
    }

    const { data: created, error } = await table('vf_sessions').insert(row).select().single()
    if (error || !created) throw new Error(`Failed to create session: ${error?.message}`)
    return fromRow(created)
  },

  async find(query: { projectId: string }, limit = 50): Promise<ISession[]> {
    const { data, error } = await supabaseAdmin
      .from('vf_sessions')
      .select('*')
      .eq('project_id', query.projectId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error || !data) return []
    return data.map(fromRow)
  },

  async findOne(query: { sessionId: string }): Promise<ISession | null> {
    const { data, error } = await supabaseAdmin
      .from('vf_sessions')
      .select('*')
      .eq('session_id', query.sessionId)
      .single()

    if (error || !data) return null
    return fromRow(data)
  },
}
