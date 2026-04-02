/**
 * lib/models/Project.ts — Firestore Project helpers
 *
 * Collection: vf_projects  (document ID = project UUID)
 */

import { v4 as uuidv4 } from 'uuid'
import { db, FieldValue, toDate } from '@/lib/db/firestore'

const COL = 'vf_projects'

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

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fromDoc(data: FirebaseFirestore.DocumentData, id: string): IProject {
  return {
    ...data,
    id,
    createdAt:   toDate(data.createdAt),
    updatedAt:   toDate(data.updatedAt),
    lastBuiltAt: data.lastBuiltAt ? toDate(data.lastBuiltAt) : undefined,
  } as IProject
}

function buildUpdate(update: ProjectUpdate): Record<string, unknown> {
  const { $inc, ...direct } = update
  const result: Record<string, unknown> = { ...direct, updatedAt: new Date() }
  if ($inc) {
    for (const [key, delta] of Object.entries($inc) as [string, number][]) {
      result[key] = FieldValue.increment(delta)
    }
  }
  return result
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const Project = {
  async findOne(
    query: Partial<Pick<IProject, 'id' | 'userId'>>,
  ): Promise<IProject | null> {
    if (query.id) {
      const doc = await db.collection(COL).doc(query.id).get()
      if (!doc.exists) return null
      return fromDoc(doc.data()!, doc.id)
    }
    if (query.userId) {
      const snap = await db.collection(COL)
        .where('userId', '==', query.userId)
        .limit(1).get()
      if (snap.empty) return null
      const doc = snap.docs[0]
      return fromDoc(doc.data(), doc.id)
    }
    return null
  },

  async find(
    query: Partial<Pick<IProject, 'userId' | 'status'>>,
  ): Promise<IProject[]> {
    let ref: FirebaseFirestore.Query = db.collection(COL)
    if (query.userId) ref = ref.where('userId', '==', query.userId)
    if (query.status) ref = ref.where('status', '==', query.status)
    const snap = await ref.orderBy('updatedAt', 'desc').get()
    return snap.docs.map((d) => fromDoc(d.data(), d.id))
  },

  async create(data: Partial<IProject>): Promise<IProject> {
    const now = new Date()
    const id  = data.id ?? uuidv4()
    const doc: Omit<IProject, 'id'> = {
      userId:        data.userId ?? '',
      name:          data.name ?? '',
      description:   data.description,
      techStack:     data.techStack ?? [],
      status:        data.status ?? 'draft',
      activeSessionId: data.activeSessionId,
      totalSessions: data.totalSessions ?? 0,
      lastBuiltAt:   data.lastBuiltAt,
      createdAt:     data.createdAt ?? now,
      updatedAt:     data.updatedAt ?? now,
    }
    await db.collection(COL).doc(id).set(doc)
    return { id, ...doc }
  },

  async updateOne(
    query: Partial<Pick<IProject, 'id'>>,
    update: ProjectUpdate,
  ): Promise<void> {
    if (!query.id) return
    await db.collection(COL).doc(query.id).update(buildUpdate(update))
  },

  async deleteOne(query: Partial<Pick<IProject, 'id'>>): Promise<void> {
    if (!query.id) return
    await db.collection(COL).doc(query.id).delete()
  },
}

export type IProjectModel = typeof Project
