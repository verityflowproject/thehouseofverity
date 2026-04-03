/**
 * lib/models/Project.ts — Supabase Project helpers
 *
 * Table: vf_projects  (id = UUID)
 * Public API is unchanged from the Firestore version.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'draft'
  | 'building'
  | 'review'
  | 'complete'
  | 'error'
  | 'active'

export interface IProject {
  readonly id:      string
  userId:           string
  name:             string
  description?:     string
  techStack:        string[]
  status:           ProjectStatus
  activeSessionId?: string
  totalSessions:    number
  lastBuiltAt?:     Date
  createdAt:        Date
  updatedAt:        Date
}

type ProjectUpdate = Partial<Omit<IProject, 'id'>> & {
  $inc?: Partial<Record<'totalSessions', number>>
}

// ─── Row mapper ───────────────────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): IProject {
  return {
    id:              row.id             as string,
    userId:          row.user_id        as string,
    name:            row.name           as string,
    description:     row.description    as string | undefined,
    techStack:       (row.tech_stack    as string[]) ?? [],
    status:          (row.status        as ProjectStatus) ?? 'draft',
    activeSessionId: row.active_session_id as string | undefined,
    totalSessions:   (row.total_sessions   as number) ?? 0,
    lastBuiltAt:     row.last_built_at ? new Date(row.last_built_at as string) : undefined,
    createdAt:       new Date(row.created_at as string),
    updatedAt:       new Date(row.updated_at as string),
  }
}

function toColumns(update: Omit<ProjectUpdate, '$inc'>): Record<string, unknown> {
  const map: Record<string, unknown> = {}
  const u = update as Record<string, unknown>

  const keys: Record<string, string> = {
    userId:          'user_id',
    name:            'name',
    description:     'description',
    techStack:       'tech_stack',
    status:          'status',
    activeSessionId: 'active_session_id',
    totalSessions:   'total_sessions',
    lastBuiltAt:     'last_built_at',
  }

  for (const [camel, snake] of Object.entries(keys)) {
    if (camel in u && u[camel] !== undefined) {
      map[snake] = u[camel]
    }
  }

  return map
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const Project = {
  async findOne(
    query: Partial<Pick<IProject, 'id' | 'userId'>>,
  ): Promise<IProject | null> {
    let q = supabaseAdmin.from('vf_projects').select('*')

    if (query.id) {
      q = q.eq('id', query.id)
    } else if (query.userId) {
      q = q.eq('user_id', query.userId)
    } else {
      return null
    }

    const { data, error } = await q.limit(1).single()
    if (error || !data) return null
    return fromRow(data)
  },

  async find(
    query: Partial<Pick<IProject, 'userId' | 'status'>>,
  ): Promise<IProject[]> {
    let q = supabaseAdmin.from('vf_projects').select('*')

    if (query.userId) q = q.eq('user_id', query.userId)
    if (query.status) q = q.eq('status', query.status)

    const { data, error } = await q.order('updated_at', { ascending: false })
    if (error || !data) return []
    return data.map(fromRow)
  },

  async create(data: Partial<IProject>): Promise<IProject> {
    const now = new Date()
    const row: Record<string, unknown> = {
      user_id:           data.userId ?? '',
      name:              data.name ?? '',
      description:       data.description,
      tech_stack:        data.techStack ?? [],
      status:            data.status ?? 'draft',
      active_session_id: data.activeSessionId,
      total_sessions:    data.totalSessions ?? 0,
      last_built_at:     data.lastBuiltAt,
      created_at:        data.createdAt ?? now,
      updated_at:        data.updatedAt ?? now,
    }
    if (data.id) row['id'] = data.id

    const { data: created, error } = await table('vf_projects').insert(row).select().single()

    if (error || !created) throw new Error(`Failed to create project: ${error?.message}`)
    return fromRow(created)
  },

  async updateOne(
    query: Partial<Pick<IProject, 'id'>>,
    update: ProjectUpdate,
  ): Promise<void> {
    if (!query.id) return

    const { $inc, ...direct } = update
    const columns = toColumns(direct)

    if ($inc?.totalSessions !== undefined) {
      // Read-increment-write for totalSessions
      const { data: current } = await supabaseAdmin
        .from('vf_projects').select('total_sessions').eq('id', query.id).single()
      if (current) {
        columns['total_sessions'] = (((current as Record<string, unknown>).total_sessions as number) ?? 0) + $inc.totalSessions
      }
    }

    if (Object.keys(columns).length === 0) return
    await table('vf_projects').update(columns).eq('id', query.id)
  },

  async deleteOne(query: Partial<Pick<IProject, 'id'>>): Promise<void> {
    if (!query.id) return
    await supabaseAdmin.from('vf_projects').delete().eq('id', query.id)
  },
}

export type IProjectModel = typeof Project
