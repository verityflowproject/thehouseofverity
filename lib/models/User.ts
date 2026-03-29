/**
 * lib/models/User.ts — User Mongoose schema and model
 *
 * Represents a VerityFlow account. The `id` field is a UUID v4 string
 * (not MongoDB ObjectId) for consistency with the type system.
 *
 * Stripe fields are nullable because free-tier users have no subscription.
 */

import { Schema, model, models, type Document, type Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'
import type { Plan } from '@/lib/types'

// ─── Document interface ───────────────────────────────────────────────────────

export interface IUser extends Document {
  readonly id:                    string
  email:                          string
  name?:                          string
  image?:                         string
  plan:                           Plan
  stripeCustomerId?:              string
  stripeSubscriptionId?:          string
  modelCallsUsed:                 number
  modelCallsLimit:                number
  billingCycleStart:              Date
  billingCycleEnd:                Date
  emailVerified?:                 boolean
  provider?:                      'github' | 'google' | 'email'
  providerAccountId?:             string
  projectIds:                     string[]
  createdAt:                      Date
  updatedAt:                      Date

  // Instance helpers
  hasCallsRemaining():            boolean
  incrementCallUsage():           Promise<IUser>
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>
}

// ─── Plan → default call limit map ───────────────────────────────────────────

const PLAN_LIMITS: Record<Plan, number> = {
  free:  50,
  pro:   2_000,
  teams: 999_999,
}

// ─── Billing cycle helpers ────────────────────────────────────────────────────

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

// ─── Schema definition ────────────────────────────────────────────────────────

const UserSchema = new Schema<IUser, IUserModel>(
  {
    id: {
      type:     String,
      default:  uuidv4,
      unique:   true,
      index:    true,
      immutable: true,
    },

    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      index:     true,
      match:     [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
    },

    name: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
    },

    plan: {
      type:    String,
      enum:    ['free', 'pro', 'teams'] satisfies Plan[],
      default: 'free' satisfies Plan,
      index:   true,
    },

    stripeCustomerId: {
      type:   String,
      sparse: true, // allow null / undefined
      index:  true,
    },

    stripeSubscriptionId: {
      type:   String,
      sparse: true,
      index:  true,
    },

    modelCallsUsed: {
      type:    Number,
      default: 0,
      min:     0,
    },

    modelCallsLimit: {
      type:    Number,
      default: PLAN_LIMITS.free,
      min:     0,
    },

    billingCycleStart: {
      type:    Date,
      default: cycleStart,
    },

    billingCycleEnd: {
      type:    Date,
      default: cycleEnd,
    },

    emailVerified: {
      type: Boolean,
    },

    provider: {
      type: String,
      enum: ['github', 'google', 'email'],
    },

    providerAccountId: {
      type:   String,
      sparse: true,
      index:  true,
    },

    projectIds: {
      type:    [String],
      default: [],
    },
  },
  {
    timestamps:        true,
    // Do NOT use Mongoose _id as the primary identifier — use our UUID `id`.
    toJSON:   { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────

UserSchema.index({ provider: 1, providerAccountId: 1 }, { sparse: true })
UserSchema.index({ plan: 1, modelCallsUsed: 1 })

// ─── Pre-save hook: sync modelCallsLimit with plan ───────────────────────────

UserSchema.pre('save', async function () {
  if (this.isModified('plan')) {
    this.modelCallsLimit = PLAN_LIMITS[this.plan]
  }
})

// ─── Instance methods ─────────────────────────────────────────────────────────

UserSchema.methods.hasCallsRemaining = function (this: IUser): boolean {
  return this.modelCallsUsed < this.modelCallsLimit
}

UserSchema.methods.incrementCallUsage = async function (
  this: IUser,
): Promise<IUser> {
  this.modelCallsUsed += 1
  // Mongoose 9 save() typing requires explicit cast when 'this' is a custom Document interface.
  return (this as unknown as { save(): Promise<IUser> }).save()
}

// ─── Static methods ───────────────────────────────────────────────────────────

UserSchema.statics.findByEmail = function (
  email: string,
): Promise<IUser | null> {
  return this.findOne({ email: email.toLowerCase().trim() })
}

// ─── Model export (safe for hot reloads) ─────────────────────────────────────

export const User: IUserModel =
  (models.User as IUserModel) ?? model<IUser, IUserModel>('User', UserSchema)
