/**
 * lib/models/ProjectState.ts — Supabase ProjectState helpers
 *
 * Table: vf_project_states  (project_id = FK to vf_projects, 1:1)
 * JSONB columns store nested data (architecture, conventions, etc.)
 * Atomic upsert with version increment is handled by the upsert_project_state RPC.
 * Public API is unchanged from the Firestore version.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IProjectState {
  readonly id: string
  projectId:   string
  version:     number
  architecture:  Record<string, unknown>
  conventions:   Record<string, unknown>
  dependencies:  Record<string, unknown>
  openQuestions: Record<string, unknown>[]
  reviewLog:     Record<string, unknown>[]
  activeTask:    Record<string, unknown> | null
  createdAt:     Date
  updatedAt:     Date
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): IProjectState {
  return {
    id:            row.id         as string,
    projectId:     row.project_id as string,
    version:       (row.version   as number) ?? 1,
    architecture:  (row.architecture  as Record<string, unknown>) ?? {},
    conventions:   (row.conventions   as Record<string, unknown>) ?? {},
    dependencies:  (row.dependencies  as Record<string, unknown>) ?? {},
    openQuestions: (row.open_questions as Record<string, unknown>[]) ?? [],
    reviewLog:     (row.review_log     as Record<string, unknown>[]) ?? [],
    activeTask:    (row.active_task    as Record<string, unknown> | null) ?? null,
    createdAt:     new Date(row.created_at as string),
    updatedAt:     new Date(row.updated_at as string),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const ProjectState = {
  async findOne(
    query: Partial<Pick<IProjectState, 'projectId'>>,
  ): Promise<IProjectState | null> {
    if (!query.projectId) return null

    const { data, error } = await supabaseAdmin
      .from('vf_project_states')
      .select('*')
      .eq('project_id', query.projectId)
      .single()

    if (error || !data) return null
    return fromRow(data)
  },

  async findByProject(projectId: string): Promise<IProjectState | null> {
    return ProjectState.findOne({ projectId })
  },

  async create(data: Partial<IProjectState>): Promise<IProjectState> {
    const now       = new Date()
    const projectId = data.projectId ?? ''

    const row: Record<string, unknown> = {
      project_id:     projectId,
      version:        data.version ?? 1,
      architecture:   data.architecture  ?? {},
      conventions:    data.conventions   ?? {},
      dependencies:   data.dependencies  ?? {},
      open_questions: data.openQuestions ?? [],
      review_log:     data.reviewLog     ?? [],
      active_task:    data.activeTask    ?? null,
      created_at:     data.createdAt ?? now,
      updated_at:     data.updatedAt ?? now,
    }
    if (data.id) row['id'] = data.id

    const { data: created, error } = await table('vf_project_states').insert(row).select().single()

    if (error || !created) throw new Error(`Failed to create project state: ${error?.message}`)
    return fromRow(created)
  },

  /**
   * Upsert with optional version increment and JSONB array operations.
   * Delegates to the upsert_project_state RPC for atomicity.
   */
  async findOneAndUpdate(
    query: Partial<Pick<IProjectState, 'projectId'>>,
    update: {
      $set?: Partial<IProjectState>
      $push?: { reviewLog?: unknown; openQuestions?: unknown }
      $pull?: { openQuestions?: { id: string } }
      $inc?:  { version?: number }
    },
    _options?: { upsert?: boolean },
  ): Promise<IProjectState | null> {
    if (!query.projectId) return null

    const setData: Record<string, unknown> = {}
    if (update.$set?.architecture) setData.architecture = update.$set.architecture
    if (update.$set?.conventions)  setData.conventions  = update.$set.conventions
    if (update.$set?.dependencies) setData.dependencies = update.$set.dependencies
    if (update.$set?.activeTask !== undefined) setData.active_task = update.$set.activeTask

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabaseAdmin.rpc as any)('upsert_project_state', {
      p_project_id:       query.projectId,
      p_set_data:         setData,
      p_push_review:      update.$push?.reviewLog     ?? null,
      p_push_question:    update.$push?.openQuestions ?? null,
      p_pull_question_id: update.$pull?.openQuestions?.id ?? null,
      p_inc_version:      update.$inc?.version ?? 0,
    })

    if (error || !data || (data as unknown[]).length === 0) return null
    return fromRow((data as Record<string, unknown>[])[0])
  },

  async deleteOne(query: Partial<Pick<IProjectState, 'projectId'>>): Promise<void> {
    if (!query.projectId) return
    await supabaseAdmin
      .from('vf_project_states')
      .delete()
      .eq('project_id', query.projectId)
  },
}

export type IProjectStateModel = typeof ProjectState
