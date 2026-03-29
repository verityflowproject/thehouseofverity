/**
 * lib/utils/project-state.ts — ProjectState read/write/merge layer
 *
 * Architecture:
 *   - MongoDB: durable store via the ProjectState Mongoose model
 *
 * Optimistic concurrency:
 *   - The `version` field (integer) on the ProjectState document acts as
 *     an optimistic lock. mergeProjectState accepts an expected version and
 *     throws VersionConflictError if the current version differs.
 */

import { v4 as uuidv4 } from 'uuid'

import { connectMongoose } from '@/lib/db/mongoose'
import { ProjectState as ProjectStateModel } from '@/lib/models/ProjectState'
import { ProjectStateError, VersionConflictError } from './errors'
import { estimateObjectTokens, truncateToFitBudget } from './token-counter'
import type {
  ProjectState,
  ReviewLogEntry,
  OpenQuestion,
  ModelRole,
  TaskType,
} from '@/lib/types'

// ─── Internal helpers ──────────────────────────────────────────────────────────

async function ensureMongoose(): Promise<void> {
  await connectMongoose()
}

/** Convert a Mongoose document to a plain ProjectState object. */
function toPlain(doc: Record<string, unknown>): ProjectState {
  return doc as unknown as ProjectState
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get a project's state from MongoDB.
 * Throws ProjectStateError if the document doesn't exist.
 */
export async function getProjectState(projectId: string): Promise<ProjectState> {
  await ensureMongoose()
  const doc = await ProjectStateModel.findOne({ projectId }).lean()

  if (!doc) {
    throw new ProjectStateError(`ProjectState not found for project ${projectId}`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  return toPlain(doc as unknown as Record<string, unknown>)
}

// ─── Write ─────────────────────────────────────────────────────────────────────

/**
 * Persist a full ProjectState.
 * Writes to MongoDB and bumps the version counter.
 */
export async function setProjectState(state: ProjectState): Promise<ProjectState> {
  await ensureMongoose()

  const newVersion = (state.version ?? 0) + 1
  const updatedAt  = new Date().toISOString()

  const updated = await ProjectStateModel.findOneAndUpdate(
    { projectId: state.projectId },
    {
      $set: {
        ...state,
        version:   newVersion,
        updatedAt,
      },
    },
    { new: true, upsert: true, lean: true },
  ) as unknown as Record<string, unknown>

  return toPlain(updated)
}

// ─── Init ─────────────────────────────────────────────────────────────────────

/**
 * Create an empty ProjectState for a brand-new project.
 * Idempotent: if a state already exists for projectId, returns the existing one.
 */
export async function initProjectState(projectId: string): Promise<ProjectState> {
  await ensureMongoose()

  const existing = await ProjectStateModel.findOne({ projectId }).lean()
  if (existing) return toPlain(existing as unknown as Record<string, unknown>)

  const now  = new Date().toISOString()
  const id   = uuidv4()

  const emptyState = {
    id,
    projectId,
    version: 1,
    createdAt: now,
    updatedAt: now,
    architecture: {
      fileTree:   [],
      dataModels: [],
      apiRoutes:  [],
      techStack:  [],
      patterns:   [],
      adrs:       {},
    },
    conventions: {
      naming: {
        components:  'PascalCase',
        hooks:       'useCamelCase',
        utilities:   'camelCase',
        constants:   'SCREAMING_SNAKE_CASE',
        types:       'PascalCase interfaces',
        apiHandlers: 'camelCase',
        files:       'kebab-case',
        directories: 'kebab-case',
      },
      folderStructure: {
        root:       ['app', 'lib', 'components', 'tests'],
        components: ['ui', 'layout', 'features'],
        pages:      [],
        api:        [],
        lib:        ['db', 'models', 'types', 'utils'],
      },
      componentPatterns: {
        stateManagement: 'Zustand slices',
        dataFetching:    'SWR with custom hooks',
        errorHandling:   'Error boundaries + sonner toasts',
        styling:         'Tailwind + shadcn/ui',
        composition:     'Compound component pattern',
        validation:      'Zod at API boundaries',
      },
      lastUpdatedAt: now,
      lastUpdatedBy: 'claude' as ModelRole,
    },
    dependencies: {
      packages:     [],
      devPackages:  [],
      peerDeps:     [],
      conflicts:    [],
      lastVerifiedAt:   now,
      lastVerifiedBy:   'perplexity' as ModelRole,
    },
    openQuestions: [],
    reviewLog: [],
    currentTask: {
      type:        'architecture' as TaskType,
      description: 'Project initialisation — awaiting first task assignment.',
      status:      'pending',
      assignedTo:  null,
      createdAt:   now,
    },
  }

  const doc = await ProjectStateModel.create(emptyState)
  return toPlain(doc.toObject() as unknown as Record<string, unknown>)
}

// ─── Merge (Optimistic Lock) ──────────────────────────────────────────────────

/**
 * Merge partial updates into an existing ProjectState.
 *
 * Optimistic concurrency control via the version field:
 * - If expectedVersion is provided and doesn't match the DB version, throws VersionConflictError.
 * - Otherwise, increments the version and applies the patch.
 *
 * @param projectId      - UUID of the project.
 * @param patch          - Partial ProjectState to merge (shallow merge at top level).
 * @param expectedVersion - Optional version check for concurrency control.
 * @returns The updated ProjectState.
 */
export async function mergeProjectState(
  projectId:       string,
  patch:           Partial<ProjectState>,
  expectedVersion?: number,
): Promise<ProjectState> {
  await ensureMongoose()

  const current = await ProjectStateModel.findOne({ projectId }).lean()

  if (!current) {
    throw new ProjectStateError(`ProjectState not found for project ${projectId}`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  const currentVersion = (current.version as number) ?? 0

  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new VersionConflictError({
      projectId,
      expectedVersion,
      actualVersion: currentVersion,
    })
  }

  const newVersion = currentVersion + 1
  const updatedAt  = new Date().toISOString()

  const updated = await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $set: {
        ...patch,
        version:   newVersion,
        updatedAt,
      },
    },
    { new: true, lean: true },
  ) as unknown as Record<string, unknown>

  if (!updated) {
    throw new ProjectStateError(
      `Failed to update ProjectState for project ${projectId}`,
      { projectId, code: 'UPDATE_FAILED' },
    )
  }

  return toPlain(updated)
}

// ─── Append helpers ────────────────────────────────────────────────────────────

/**
 * Append a review log entry.
 * Uses MongoDB's $push to atomically append without reading the full array.
 */
export async function appendReviewLog(
  projectId: string,
  entry:     ReviewLogEntry,
): Promise<void> {
  await ensureMongoose()

  await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $push: { reviewLog: entry },
      $inc:  { version: 1 },
      $set:  { updatedAt: new Date().toISOString() },
    },
  )
}

/**
 * Append an open question.
 */
export async function appendOpenQuestion(
  projectId: string,
  question:  OpenQuestion,
): Promise<void> {
  await ensureMongoose()

  await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $push: { openQuestions: question },
      $inc:  { version: 1 },
      $set:  { updatedAt: new Date().toISOString() },
    },
  )
}

/**
 * Remove a resolved question by its ID.
 */
export async function removeOpenQuestion(
  projectId:  string,
  questionId: string,
): Promise<void> {
  await ensureMongoose()

  await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $pull: { openQuestions: { id: questionId } },
      $inc:  { version: 1 },
      $set:  { updatedAt: new Date().toISOString() },
    },
  )
}

// ─── Context Budget & Truncation ───────────────────────────────────────────────

/**
 * Retrieve a ProjectState and truncate it to fit within a target token budget.
 *
 * Strategy:
 * 1. Always keep: architecture.techStack, conventions, currentTask
 * 2. Truncate large fields:
 *    - architecture.fileTree
 *    - reviewLog
 *    - openQuestions
 *
 * @param projectId    - UUID of the project.
 * @param targetTokens - Target token count (e.g., 8000 for a 16K context).
 * @returns A truncated ProjectState that fits within the budget.
 */
export async function getProjectStateWithBudget(
  projectId:    string,
  targetTokens: number,
): Promise<ProjectState> {
  const full = await getProjectState(projectId)

  // Estimate current token usage
  const currentTokens = estimateObjectTokens(full)

  // If already within budget, return as-is
  if (currentTokens <= targetTokens) {
    return full
  }

  // Simple truncation: reduce fileTree, reviewLog, and openQuestions proportionally
  const fileTreeJson = JSON.stringify(full.architecture.fileTree, null, 2)
  const reviewLogJson = JSON.stringify(full.reviewLog, null, 2)
  const openQuestionsJson = JSON.stringify(full.openQuestions, null, 2)

  const truncated: ProjectState = {
    ...full,
    architecture: {
      ...full.architecture,
      fileTree: JSON.parse(truncateToFitBudget(fileTreeJson, Math.floor(targetTokens * 0.5))),
    },
    reviewLog: JSON.parse(truncateToFitBudget(reviewLogJson, Math.floor(targetTokens * 0.3))),
    openQuestions: JSON.parse(truncateToFitBudget(openQuestionsJson, Math.floor(targetTokens * 0.2))),
  }

  return truncated
}

/**
 * Delete a ProjectState (for cleanup or testing).
 */
export async function deleteProjectState(projectId: string): Promise<void> {
  await ensureMongoose()
  await ProjectStateModel.deleteOne({ projectId })
}
