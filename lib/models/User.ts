/**
 * lib/models/User.ts — Supabase User helpers
 *
 * Table: vf_users  (id = application UUID, auth_user_id = Supabase Auth UUID)
 * Public API surface is unchanged from the Firestore version so all consumers
 * (API routes, auth callbacks, Stripe webhooks) require no changes.
 */

import { supabaseAdmin, table } from '@/lib/db/supabase-server'
import type { Plan } from '@/lib/types'

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

// ─── Update shape (mirrors former Firestore version) ─────────────────────────

type UserUpdate = Partial<Omit<IUser, 'id'>> & {
  $inc?: Partial<Record<'credits' | 'modelCallsUsed' | 'dailyCreditsUsed', number>>
}

// ─── Row ↔ interface mapper ───────────────────────────────────────────────────

function fromRow(row: Record<string, unknown>): IUser {
  return {
    id:                   row.id as string,
    email:                row.email as string,
    name:                 row.name  as string | undefined,
    image:                row.image as string | undefined,
    plan:                 (row.plan as Plan) ?? 'free',
    credits:              (row.credits           as number) ?? 0,
    dailyCreditsUsed:     (row.daily_credits_used as number) ?? 0,
    dailyCreditsResetAt:  new Date(row.daily_credits_reset_at as string),
    modelCallsUsed:       (row.model_calls_used   as number) ?? 0,
    modelCallsLimit:      (row.model_calls_limit  as number) ?? 50,
    stripeCustomerId:     row.stripe_customer_id     as string | undefined,
    stripeSubscriptionId: row.stripe_subscription_id as string | undefined,
    billingCycleStart:    new Date(row.billing_cycle_start as string),
    billingCycleEnd:      new Date(row.billing_cycle_end   as string),
    emailVerified:        row.email_verified        as boolean | undefined,
    provider:             row.provider              as IUser['provider'],
    providerAccountId:    row.provider_account_id   as string | undefined,
    projectIds:           (row.project_ids as string[]) ?? [],
    createdAt:            new Date(row.created_at as string),
    updatedAt:            new Date(row.updated_at as string),
  }
}

/** Convert camelCase update to snake_case column map (direct fields only). */
function toColumns(update: Omit<UserUpdate, '$inc'>): Record<string, unknown> {
  const map: Record<string, unknown> = {}
  const u = update as Record<string, unknown>

  const keys: Record<string, string> = {
    email:                'email',
    name:                 'name',
    image:                'image',
    plan:                 'plan',
    credits:              'credits',
    dailyCreditsUsed:     'daily_credits_used',
    dailyCreditsResetAt:  'daily_credits_reset_at',
    modelCallsUsed:       'model_calls_used',
    modelCallsLimit:      'model_calls_limit',
    stripeCustomerId:     'stripe_customer_id',
    stripeSubscriptionId: 'stripe_subscription_id',
    billingCycleStart:    'billing_cycle_start',
    billingCycleEnd:      'billing_cycle_end',
    emailVerified:        'email_verified',
    provider:             'provider',
    providerAccountId:    'provider_account_id',
    projectIds:           'project_ids',
  }

  for (const [camel, snake] of Object.entries(keys)) {
    if (camel in u && u[camel] !== undefined) {
      map[snake] = u[camel]
    }
  }

  return map
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const User = {
  async findOne(
    query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
  ): Promise<IUser | null> {
    let q = supabaseAdmin.from('vf_users').select('*')

    if (query.id) {
      q = q.eq('id', query.id)
    } else if (query.email) {
      q = q.eq('email', query.email.toLowerCase())
    } else if (query.stripeCustomerId) {
      q = q.eq('stripe_customer_id', query.stripeCustomerId)
    } else {
      return null
    }

    const { data, error } = await q.limit(1).single()
    if (error || !data) return null
    return fromRow(data)
  },

  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email })
  },

  async create(data: Partial<IUser>): Promise<IUser> {
    const now  = new Date()
    const plan = (data.plan ?? 'free') as Plan

    const row = {
      email:                  (data.email ?? '').toLowerCase().trim(),
      name:                   data.name,
      image:                  data.image,
      plan,
      credits:                data.credits ?? 0,
      daily_credits_used:     data.dailyCreditsUsed ?? 0,
      daily_credits_reset_at: data.dailyCreditsResetAt ?? now,
      model_calls_used:       data.modelCallsUsed ?? 0,
      model_calls_limit:      data.modelCallsLimit ?? PLAN_LIMITS[plan],
      stripe_customer_id:     data.stripeCustomerId,
      stripe_subscription_id: data.stripeSubscriptionId,
      billing_cycle_start:    data.billingCycleStart ?? cycleStart(),
      billing_cycle_end:      data.billingCycleEnd   ?? cycleEnd(),
      email_verified:         data.emailVerified,
      provider:               data.provider,
      provider_account_id:    data.providerAccountId,
      project_ids:            data.projectIds ?? [],
      created_at:             data.createdAt ?? now,
      updated_at:             data.updatedAt ?? now,
      ...(data.id ? { id: data.id } : {}),
    }

    const { data: created, error } = await table('vf_users').insert(row).select().single()

    if (error || !created) throw new Error(`Failed to create user: ${error?.message}`)
    return fromRow(created)
  },

  async updateOne(
    query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
    update: UserUpdate,
  ): Promise<void> {
    const { $inc, ...direct } = update
    const columns = toColumns(direct)

    if ($inc) {
      const resolvedId = await resolveId(query)
      for (const [field, delta] of Object.entries($inc) as [string, number][]) {
        const rpcField =
          field === 'credits' ? 'credits' :
          field === 'modelCallsUsed'  ? 'model_calls_used' :
          field === 'dailyCreditsUsed' ? 'daily_credits_used' : null
        if (rpcField && resolvedId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabaseAdmin.rpc as any)('increment_user_credits', {
            p_user_id: resolvedId,
            p_field:   rpcField,
            p_delta:   delta,
          })
        }
      }
    }

    if (Object.keys(columns).length === 0) return
    const id = await resolveId(query)
    if (!id) return

    await table('vf_users').update(columns).eq('id', id)
  },

  async findOneAndUpdate(
    query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>> & {
      credits?: { $gte: number }
    },
    update: UserUpdate,
    _options?: { new?: boolean },
  ): Promise<IUser | null> {
    const { credits: creditFilter, ...q } = query as Record<string, unknown>
    const id = await resolveId(q as Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>)
    if (!id) return null

    const { $inc, ...direct } = update
    const creditsDelta = $inc?.credits ?? 0

    if (creditFilter !== undefined && typeof creditFilter === 'object' && '$gte' in (creditFilter as object)) {
      const minBalance = (creditFilter as { $gte: number }).$gte
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabaseAdmin.rpc as any)('deduct_user_credits', {
        p_user_id:       id,
        p_credits_delta: creditsDelta,
        p_min_balance:   minBalance,
      })
      if (error || !data || (data as unknown[]).length === 0) return null

      // Apply any remaining direct-field updates
      const remaining = toColumns(direct)
      delete remaining['credits'] // handled by RPC
      if (Object.keys(remaining).length > 0) {
        await table('vf_users').update(remaining).eq('id', id)
      }

      const { data: refreshed } = await supabaseAdmin
        .from('vf_users').select('*').eq('id', id).single()
      return refreshed ? fromRow(refreshed) : null
    }

    // No credit floor — apply all updates normally
    await User.updateOne({ id }, update)
    const { data: refreshed } = await supabaseAdmin
      .from('vf_users').select('*').eq('id', id).single()
    return refreshed ? fromRow(refreshed) : null
  },

  async updateMany(
    _query: Record<string, unknown>,
    update: UserUpdate,
  ): Promise<{ modifiedCount: number }> {
    const { $inc, ...direct } = update
    const columns = toColumns(direct)

    let modifiedCount = 0

    if (Object.keys(columns).length > 0) {
      const { count } = await table('vf_users')
        .update(columns)
        .neq('id', '00000000-0000-0000-0000-000000000000') // update all rows
        .select('*', { count: 'exact', head: true })
      modifiedCount = count ?? 0
    }

    return { modifiedCount }
  },
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

async function resolveId(
  query: Partial<Pick<IUser, 'email' | 'id' | 'stripeCustomerId'>>,
): Promise<string | null> {
  if (query.id) return query.id

  const user = await User.findOne(query)
  return user?.id ?? null
}

export type IUserModel = typeof User
