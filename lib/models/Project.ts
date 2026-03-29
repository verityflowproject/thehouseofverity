/**
 * lib/models/Project.ts — Project Mongoose schema and model
 *
 * A Project is the top-level entity that groups a codebase, its sessions,
 * and its generated ProjectState. Each project belongs to one User.
 */

import { Schema, model, models, type Document, type Model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

// ─── Status enum ─────────────────────────────────────────────────────────────

export type ProjectStatus =
  | 'draft'      // Created, not yet built
  | 'building'   // Orchestrator is actively working
  | 'review'     // Awaiting human or council review
  | 'complete'   // Last build succeeded
  | 'error'      // Last build failed

// ─── Document interface ───────────────────────────────────────────────────────

export interface IProject extends Document {
  readonly id:         string
  userId:              string        // UUID ref → User.id
  name:                string
  description?:        string
  techStack:           string[]
  status:              ProjectStatus
  activeSessionId?:    string        // UUID ref → current orchestrator session
  totalSessions:       number
  lastBuiltAt?:        Date
  createdAt:           Date
  updatedAt:           Date

  // Helpers
  isActive():          boolean
  markBuilding(sessionId: string): Promise<IProject>
  markComplete():      Promise<IProject>
  markError():         Promise<IProject>
}

export interface IProjectModel extends Model<IProject> {
  findByUser(userId: string): Promise<IProject[]>
}

// ─── Schema definition ────────────────────────────────────────────────────────

const ProjectSchema = new Schema<IProject, IProjectModel>(
  {
    id: {
      type:      String,
      default:   uuidv4,
      unique:    true,
      index:     true,
      immutable: true,
    },

    userId: {
      type:     String,
      required: [true, 'userId (User.id UUID) is required'],
      index:    true,
      // Not a Mongoose ObjectId ref — we use UUID strings.
    },

    name: {
      type:      String,
      required:  [true, 'Project name is required'],
      trim:      true,
      maxlength: [120, 'Project name may not exceed 120 characters'],
    },

    description: {
      type:      String,
      trim:      true,
      maxlength: [1000, 'Description may not exceed 1000 characters'],
    },

    techStack: {
      type:    [String],
      default: [],
    },

    status: {
      type:    String,
      enum:    ['draft', 'building', 'review', 'complete', 'error'] satisfies ProjectStatus[],
      default: 'draft' satisfies ProjectStatus,
      index:   true,
    },

    activeSessionId: {
      type:   String,
      sparse: true,
    },

    totalSessions: {
      type:    Number,
      default: 0,
      min:     0,
    },

    lastBuiltAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
)

// ─── Compound indexes ─────────────────────────────────────────────────────────

ProjectSchema.index({ userId: 1, createdAt: -1 })
ProjectSchema.index({ userId: 1, status: 1 })

// ─── Instance methods ─────────────────────────────────────────────────────────

ProjectSchema.methods.isActive = function (this: IProject): boolean {
  return this.status === 'building'
}

ProjectSchema.methods.markBuilding = async function (
  this: IProject,
  sessionId: string,
): Promise<IProject> {
  this.status          = 'building'
  this.activeSessionId = sessionId
  this.totalSessions  += 1
  return this.save() as unknown as Promise<IProject>
}

ProjectSchema.methods.markComplete = async function (
  this: IProject,
): Promise<IProject> {
  this.status      = 'complete'
  this.lastBuiltAt = new Date()
  this.set('activeSessionId', undefined)
  return this.save() as unknown as Promise<IProject>
}

ProjectSchema.methods.markError = async function (
  this: IProject,
): Promise<IProject> {
  this.status = 'error'
  this.set('activeSessionId', undefined)
  return this.save() as unknown as Promise<IProject>
}

// ─── Static methods ───────────────────────────────────────────────────────────

ProjectSchema.statics.findByUser = function (
  userId: string,
): Promise<IProject[]> {
  return this.find({ userId }).sort({ createdAt: -1 })
}

// ─── Model export ─────────────────────────────────────────────────────────────

export const Project: IProjectModel =
  (models.Project as IProjectModel) ??
  model<IProject, IProjectModel>('Project', ProjectSchema)
