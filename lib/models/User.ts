/**
 * lib/models/User.ts — Firestore User helpers
 *
 * Collection: vf_users  (document ID = user UUID)
 * Secondary lookups: email, stripeCustomerId
 */

import { v4 as uuidv4 } from 'uuid'
import { db, FieldValue, toDate } from '@/lib/db/firestore'
import type { Plan } from '@/lib/types'

const COL = 'vf_users'

// ─── Plan → default limits ────────────────────────────────────────────────────

const PLAN_LIMITS: Record<Plan, number> = {
  free:    50,
  starter: 2_500,
  pro:     8_000,
  studio:  20_000,
}

// ─── Plain data interface ─────────────────────────────────────────────────────

export interface IUser {
  readonly id: string
  email:       string
  name?:       string
  image?:      string
  plan:        Plan

  credits:             number
  dailyCreditsUsed:    number
  dailyCreditsResetAt: Date

  modelCallsUsed:  number
  modelCallsLimit: number

  stripeCustomerId?:    string
  stripeSubscriptionId?: string

  billingCycleStart: Date
  billingCycleEnd:   Date

  emailVerified?:    boolean
  provider?:         'github' | 'google' | 'email'
  providerAccountId?: string

  projectIds: string[]

  createdAt: Date
  updatedAt: Date
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function cycleStart(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

function cycleEnd(): Date {
  const d = new Date()
  d.setMonth(d.getMonth() + 1, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

function fromDoc(data: FirebaseFirestore.DocumentData, id: string): IUser {
  return {
    ...data,
    id,
    createdAt:           toDate(data.createdAt),
    updatedAt:           toDate(data.updatedAt),
    dailyCreditsResetAt: toDate(data.dailyCreditsResetAt),
    billingCycleStart:   toDate(data.billingCycleStart),
    billingCycleEnd:     toDate(data.billingCycleEnd),
  } as IUser
}

// ─── Accepted update shape ────────────────────────────────────────────────────

type UserUpdate = Partial<Omit<IUser, 'id'>> & {
  $inc?: Partial<Record<'credits' | 'modelCallsUsed' | 'dailyCreditsUsed', number>>
}

function buildFirestoreUpdate(update: UserUpdate): Record<string, unknown> {
  const { $inc, ...direct } = update
  const result: Record<string, unknown> = { ...direct, updatedAt: new Date() }
  if ($inc) {
    for (const [key, delta] of Object.entries($inc) as [string, number][]) {
      result[key] = FieldValue.increment(delta)
    }
  }
  return result
}

// ─── Public API (mirrors Mongoose model statics) ──────────────────────────────

export const User = {
  /** Find by any supported field combination (email, id, stripeCustomerId). */
  async findOne(
    query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
  ): Promise<IUser | null> {
    if (query.email) {
      const snap = await db.collection(COL)
        .where('email', '==', query.email.toLowerCase())
        .limit(1).get()
      if (snap.empty) return null
      const doc = snap.docs[0]
      return fromDoc(doc.data(), doc.id)
    }
    if (query.id) {
      const doc = await db.collection(COL).doc(query.id).get()
      if (!doc.exists) return null
      return fromDoc(doc.data()!, doc.id)
    }
    if (query.stripeCustomerId) {
      const snap = await db.collection(COL)
        .where('stripeCustomerId', '==', query.stripeCustomerId)
        .limit(1).get()
      if (snap.empty) return null
      const doc = snap.docs[0]
      return fromDoc(doc.data(), doc.id)
    }
    return null
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
  },

  async create(data: Partial<IUser>): Promise<IUser> {
    const now  = new Date()
    const plan = (data.plan ?? 'free') as Plan
    const id   = data.id ?? uuidv4()

    const doc: Omit<IUser, 'id'> = {
      email:               (data.email ?? '').toLowerCase().trim(),
      name:                data.name,
      image:               data.image,
      plan,
      credits:             data.credits ?? 0,
      dailyCreditsUsed:    data.dailyCreditsUsed ?? 0,
      dailyCreditsResetAt: data.dailyCreditsResetAt ?? now,
      modelCallsUsed:      data.modelCallsUsed ?? 0,
      modelCallsLimit:     data.modelCallsLimit ?? PLAN_LIMITS[plan],
      stripeCustomerId:    data.stripeCustomerId,
      stripeSubscriptionId:data.stripeSubscriptionId,
      billingCycleStart:   data.billingCycleStart ?? cycleStart(),
      billingCycleEnd:     data.billingCycleEnd   ?? cycleEnd(),
      emailVerified:       data.emailVerified,
      provider:            data.provider,
      providerAccountId:   data.providerAccountId,
      projectIds:          data.projectIds ?? [],
      createdAt:           data.createdAt ?? now,
      updatedAt:           data.updatedAt ?? now,
    }

    await db.collection(COL).doc(id).set(doc)
    return { id, ...doc }
  },

  async updateOne(
    query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
    update: UserUpdate,
  ): Promise<void> {
    const ref = await resolveRef(query)
    if (!ref) return
    await ref.update(buildFirestoreUpdate(update))
  },

  /** Atomically update a user and return the new document (like findOneAndUpdate + {new:true}). */
  async findOneAndUpdate(
    query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>> & {
      credits?: { $gte: number }
    },
    update: UserUpdate,
    _options?: { new?: boolean },
  ): Promise<IUser | null> {
    const { credits: creditFilter, ...q } = query as Record<string, unknown>

    const ref = await resolveRef(
      q as Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
    )
    if (!ref) return null

    return db.runTransaction(async (t) => {
      const snap = await t.get(ref)
      if (!snap.exists) return null

      const data = snap.data()!

      if (
        creditFilter !== undefined &&
        typeof creditFilter === 'object' &&
        '$gte' in (creditFilter as object) &&
        (data.credits ?? 0) < (creditFilter as { $gte: number }).$gte
      ) {
        return null
      }

      const firestoreUpdate = buildFirestoreUpdate(update)
      t.update(ref, firestoreUpdate)

      const merged: Record<string, unknown> = { ...data }
      for (const [k, v] of Object.entries(firestoreUpdate)) {
        if (v && typeof v === 'object' && '_methodName' in v) {
          const delta = (update.$inc as Record<string, number>)?.[k]
          if (delta !== undefined) merged[k] = (data[k] as number ?? 0) + delta
        } else {
          merged[k] = v
        }
      }

      return fromDoc(merged, snap.id)
    })
  },

  /** Mass-update all users (cron resets). Returns count of updated docs. */
  async updateMany(
    _query: Record<string, unknown>,
    update: UserUpdate,
  ): Promise<{ modifiedCount: number }> {
    const snap = await db.collection(COL).get()
    const batch = db.batch()
    snap.forEach((doc) => batch.update(doc.ref, buildFirestoreUpdate(update)))
    await batch.commit()
    return { modifiedCount: snap.size }
  },
}

// ─── Ref resolver ─────────────────────────────────────────────────────────────

async function resolveRef(
  query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
): Promise<FirebaseFirestore.DocumentReference | null> {
  if (query.id) {
    return db.collection(COL).doc(query.id)
  }
  if (query.email) {
    const snap = await db.collection(COL)
      .where('email', '==', query.email.toLowerCase())
      .limit(1).get()
    return snap.empty ? null : snap.docs[0].ref
  }
  if (query.stripeCustomerId) {
    const snap = await db.collection(COL)
      .where('stripeCustomerId', '==', query.stripeCustomerId)
      .limit(1).get()
    return snap.empty ? null : snap.docs[0].ref
  }
  return null
}

// ─── Re-export for backwards compatibility ────────────────────────────────────

export type IUserModel = typeof User
