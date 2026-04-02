/**
 * lib/models/ProjectState.ts — Firestore ProjectState helpers
 *
 * Collection: vf_project_states  (document ID = projectId, 1:1 with Project)
 *
 * Optimistic concurrency: the `version` integer field acts as an optimistic
 * lock — callers pass the version they read; writes reject if it has changed.
 */

import { v4 as uuidv4 } from 'uuid'
import { db, FieldValue, toDate } from '@/lib/db/firestore'

const COL = 'vf_project_states'

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

// ─── Internal helpers ─────────────────────────────────────────────────────────

function fromDoc(data: FirebaseFirestore.DocumentData, id: string): IProjectState {
  return {
    ...data,
    id,
    projectId:  data.projectId ?? id,
    createdAt:  toDate(data.createdAt),
    updatedAt:  toDate(data.updatedAt),
  } as IProjectState
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const ProjectState = {
  async findOne(
    query: Partial<Pick<IProjectState, 'projectId'>>,
  ): Promise<IProjectState | null> {
    if (!query.projectId) return null
    const doc = await db.collection(COL).doc(query.projectId).get()
    if (!doc.exists) return null
    return fromDoc(doc.data()!, doc.id)
  },

  async findByProject(projectId: string): Promise<IProjectState | null> {
    return ProjectState.findOne({ projectId })
  },

  async create(data: Partial<IProjectState>): Promise<IProjectState> {
    const now       = new Date()
    const projectId = data.projectId ?? ''
    const id        = data.id ?? uuidv4()
    const doc: Omit<IProjectState, 'id'> = {
      projectId,
      version:       data.version ?? 1,
      architecture:  data.architecture  ?? {},
      conventions:   data.conventions   ?? {},
      dependencies:  data.dependencies  ?? {},
      openQuestions: data.openQuestions ?? [],
      reviewLog:     data.reviewLog     ?? [],
      activeTask:    data.activeTask    ?? null,
      createdAt:     data.createdAt ?? now,
      updatedAt:     data.updatedAt ?? now,
    }
    await db.collection(COL).doc(projectId).set({ id, ...doc })
    return { id, ...doc }
  },

  /**
   * Upsert with version increment (set + merge).
   * Equivalent to findOneAndUpdate({ projectId }, { $set: ... }, { upsert: true }).
   */
  async findOneAndUpdate(
    query: Partial<Pick<IProjectState, 'projectId'>>,
    update: {
      $set?: Partial<IProjectState>
      $push?: { reviewLog?: unknown; openQuestions?: unknown }
      $pull?: { openQuestions?: { id: string } }
      $inc?:  { version?: number }
    },
    options?: { upsert?: boolean },
  ): Promise<IProjectState | null> {
    if (!query.projectId) return null
    const ref = db.collection(COL).doc(query.projectId)

    return db.runTransaction(async (t) => {
      const snap = await t.get(ref)

      if (!snap.exists) {
        if (!options?.upsert) return null
        const now = new Date()
        const newDoc = {
          id:            uuidv4(),
          projectId:     query.projectId!,
          version:       1,
          architecture:  {},
          conventions:   {},
          dependencies:  {},
          openQuestions: [],
          reviewLog:     [],
          activeTask:    null,
          createdAt:     now,
          updatedAt:     now,
          ...(update.$set ?? {}),
        }
        t.set(ref, newDoc)
        return fromDoc(newDoc, ref.id)
      }

      const data = snap.data()!
      const firestoreUpdate: Record<string, unknown> = { updatedAt: new Date() }

      if (update.$set) {
        Object.assign(firestoreUpdate, update.$set)
      }
      if (update.$inc?.version !== undefined) {
        firestoreUpdate.version = FieldValue.increment(update.$inc.version)
      }
      if (update.$push?.reviewLog !== undefined) {
        firestoreUpdate.reviewLog = FieldValue.arrayUnion(update.$push.reviewLog)
      }
      if (update.$push?.openQuestions !== undefined) {
        firestoreUpdate.openQuestions = FieldValue.arrayUnion(update.$push.openQuestions)
      }
      if (update.$pull?.openQuestions !== undefined) {
        const existing = (data.openQuestions ?? []) as Array<{ id: string }>
        const removed  = existing.filter(
          (q) => q.id !== update.$pull!.openQuestions!.id,
        )
        firestoreUpdate.openQuestions = removed
      }

      t.update(ref, firestoreUpdate)

      const merged = {
        ...data,
        ...firestoreUpdate,
        version: (data.version ?? 0) + (update.$inc?.version ?? 0),
      }
      return fromDoc(merged, snap.id)
    })
  },

  async deleteOne(query: Partial<Pick<IProjectState, 'projectId'>>): Promise<void> {
    if (!query.projectId) return
    await db.collection(COL).doc(query.projectId).delete()
  },
}

export type IProjectStateModel = typeof ProjectState
