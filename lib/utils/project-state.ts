/**
 * lib/utils/project-state.ts — ProjectState read/write/merge layer
 *
 * Architecture:
 *   - Redis  : fast in-memory cache (TTL 5 min), keyed by vf:project:{id}:state
 *   - MongoDB: durable store via the ProjectState Mongoose model
 *
 * Every public function connects to both layers transparently.
 * Callers never touch Redis or MongoDB directly for state operations.
 *
 * Optimistic concurrency:
 *   - The `version` field (integer) on the ProjectState document acts as
 *     an optimistic lock. mergeProjectState accepts an expected version and
 *     throws VersionConflictError if the current version differs.
 *   - A coarser Redis SET NX lock (acquireStateLock / releaseStateLock)
 *     serialises concurrent writes within the same server process.
 */

import { v4 as uuidv4 } from 'uuid'

import { redis, REDIS_TTL, RedisKeys } from '@/lib/db/redis'
import { connectMongoose } from '@/lib/db/mongoose'
import { ProjectState as ProjectStateModel } from '@/lib/models/ProjectState'
import { ProjectStateError, VersionConflictError } from './errors'
import {
  estimateObjectTokens,
  buildContextBudget,
  truncateObjectToFit,
} from './token-counter'
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
  // toObject() strips Mongoose internals; we then cast to our type.
  return doc as unknown as ProjectState
}

// ─── Cache helpers ─────────────────────────────────────────────────────────────

async function cacheState(state: ProjectState): Promise<void> {
  try {
    const key   = RedisKeys.projectState(state.projectId)
    const value = JSON.stringify(state)
    await redis.set(key, value, 'EX', REDIS_TTL.PROJECT_STATE)
  } catch {
    // Cache write failure is non-fatal — MongoDB is the source of truth.
  }
}

async function getCachedState(projectId: string): Promise<ProjectState | null> {
  try {
    const key  = RedisKeys.projectState(projectId)
    const raw  = await redis.get(key)
    if (raw) return JSON.parse(raw) as ProjectState
  } catch {
    // Cache read failure is non-fatal — fall through to MongoDB.
  }
  return null
}

async function invalidateCache(projectId: string): Promise<void> {
  try {
    await redis.del(RedisKeys.projectState(projectId))
  } catch { /* non-fatal */ }
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Get a project’s state.
 * 1. Try Redis cache first (fast, <1ms).
 * 2. Fall back to MongoDB on cache miss and populate the cache.
 * 3. Throw ProjectStateError if the document doesn’t exist.
 */
export async function getProjectState(projectId: string): Promise<ProjectState> {
  // 1. Redis cache
  const cached = await getCachedState(projectId)
  if (cached) return cached

  // 2. MongoDB
  await ensureMongoose()
  const doc = await ProjectStateModel.findOne({ projectId }).lean()

  if (!doc) {
    throw new ProjectStateError(`ProjectState not found for project ${projectId}`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  const state = toPlain(doc as unknown as Record<string, unknown>)

  // 3. Warm the cache
  await cacheState(state)

  return state
}

// ─── Write ─────────────────────────────────────────────────────────────────────

/**
 * Persist a full ProjectState.
 * Writes MongoDB first (durable), then updates the Redis cache.
 * Bumps the version counter.
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

  const newState = toPlain(updated)
  await cacheState(newState)
  return newState
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
      versionMap:   {},
      knownGotchas: [],
    },
    openQuestions: [],
    reviewLog:     [],
    activeTask:    null,
  }

  const doc = await ProjectStateModel.create(emptyState)
  const state = toPlain((doc as unknown as { toObject(): Record<string, unknown> }).toObject())
  await cacheState(state)
  return state
}

// ─── Deep merge ──────────────────────────────────────────────────────────────

/**
 * Deep-merge two plain objects.
 * - Object values: recursively merged.
 * - Array values: REPLACED (not concatenated) by the source array.
 * - Primitives: source always wins.
 * - undefined source values: skipped (preserve target).
 */
function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = { ...target }

  for (const [key, srcVal] of Object.entries(source)) {
    if (srcVal === undefined) continue

    const tgtVal = result[key]

    if (
      srcVal !== null &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal !== null &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      )
    } else {
      result[key] = srcVal
    }
  }

  return result
}

/**
 * Deep-merge a partial patch into the project’s current state.
 *
 * @param projectId       - Target project.
 * @param patch           - Partial state update. Arrays replace their targets.
 * @param expectedVersion - If provided, throws VersionConflictError when the
 *                          current version doesn’t match (optimistic lock).
 * @returns               The updated ProjectState.
 */
export async function mergeProjectState(
  projectId:       string,
  patch:           Partial<ProjectState>,
  expectedVersion?: number,
): Promise<ProjectState> {
  await ensureMongoose()

  // Load current state (from cache or MongoDB)
  const current = await getProjectState(projectId)

  // Optimistic concurrency check
  if (expectedVersion !== undefined && current.version !== expectedVersion) {
    throw new VersionConflictError({
      projectId,
      expectedVersion,
      actualVersion: current.version,
    })
  }

  const now     = new Date().toISOString()
  const merged  = deepMerge(
    current as unknown as Record<string, unknown>,
    patch   as unknown as Record<string, unknown>,
  ) as unknown as ProjectState

  const updated: ProjectState = {
    ...merged,
    version:   current.version + 1,
    updatedAt: now,
  }

  return setProjectState(updated)
}

// ─── Review log append ─────────────────────────────────────────────────────────

/**
 * Append a ReviewLogEntry to the project’s review log.
 * Uses MongoDB $push (atomic) and then invalidates the Redis cache so the
 * next read fetches the updated document.
 */
export async function appendReviewEntry(
  projectId: string,
  entry:     ReviewLogEntry,
): Promise<void> {
  await ensureMongoose()

  const result = await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $push:      { reviewLog: entry },
      $inc:       { version:   1 },
      $set:       { updatedAt: new Date().toISOString() },
    },
    { new: true },
  )

  if (!result) {
    throw new ProjectStateError(`Cannot append review entry: project ${projectId} not found`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  await invalidateCache(projectId)
}

// ─── Open questions ───────────────────────────────────────────────────────────

/**
 * Append an OpenQuestion to the project’s open questions list.
 */
export async function appendOpenQuestion(
  projectId: string,
  question:  Omit<OpenQuestion, 'id' | 'createdAt'>,
): Promise<OpenQuestion> {
  await ensureMongoose()

  const full: OpenQuestion = {
    ...question,
    id:        uuidv4(),
    createdAt: new Date().toISOString(),
  }

  const result = await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $push: { openQuestions: full },
      $inc:  { version: 1 },
      $set:  { updatedAt: new Date().toISOString() },
    },
    { new: true },
  )

  if (!result) {
    throw new ProjectStateError(`Cannot append question: project ${projectId} not found`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  await invalidateCache(projectId)
  return full
}

/**
 * Mark an open question as resolved.
 *
 * @param projectId  - Target project.
 * @param questionId - UUID of the question to resolve.
 * @param resolution - Human-readable resolution text.
 * @param resolvedBy - Which model resolved it.
 */
export async function resolveOpenQuestion(
  projectId:  string,
  questionId: string,
  resolution: string,
  resolvedBy: ModelRole,
): Promise<void> {
  await ensureMongoose()

  const result = await ProjectStateModel.findOneAndUpdate(
    { projectId, 'openQuestions.id': questionId },
    {
      $set: {
        'openQuestions.$.resolved':   true,
        'openQuestions.$.resolution': resolution,
        'openQuestions.$.resolvedBy': resolvedBy,
        'openQuestions.$.resolvedAt': new Date().toISOString(),
        updatedAt:                   new Date().toISOString(),
      },
      $inc: { version: 1 },
    },
    { new: true },
  )

  if (!result) {
    throw new ProjectStateError(
      `Question ${questionId} not found in project ${projectId}`,
      { projectId, code: 'QUESTION_NOT_FOUND' },
    )
  }

  await invalidateCache(projectId)
}

// ─── Context slice per model ────────────────────────────────────────────────────

/**
 * Return a model-appropriate subset of the project state.
 *
 * Different models have very different context windows, so we hand each
 * one only what it actually needs:
 *
 *   Gemini     — full state (1M token window can absorb everything)
 *   Claude     — architecture + unresolved questions + last 20 review entries + activeTask
 *   GPT-4o     — architecture + conventions + unresolved questions + last 15 review entries + activeTask
 *   Codestral  — activeTask + relatedFiles only (pure code-completion model)
 *   Perplexity — architecture + dependencies + last 5 review entries (research model)
 *
 * The slice is then truncated to 75% of the model’s context budget if it’s still too large.
 */
export async function sliceStateForModel(
  projectId: string,
  model:     ModelRole,
  taskType:  TaskType,
): Promise<Partial<ProjectState>> {
  const state = await getProjectState(projectId)
  const budget = buildContextBudget(model)

  let slice: Partial<ProjectState>

  switch (model) {
    case 'gemini':
      // Full state — Gemini’s 1M context can hold everything.
      slice = state
      break

    case 'claude':
      slice = {
        projectId:     state.projectId,
        version:       state.version,
        architecture:  state.architecture,
        conventions:   state.conventions,
        openQuestions: state.openQuestions.filter((q) => !q.resolved),
        reviewLog:     state.reviewLog.slice(-20),
        activeTask:    state.activeTask,
        dependencies:  taskType === 'architecture' ? state.dependencies : undefined,
      }
      break

    case 'gpt5.4o':
      slice = {
        projectId:     state.projectId,
        version:       state.version,
        architecture:  state.architecture,
        conventions:   state.conventions,
        openQuestions: state.openQuestions.filter((q) => !q.resolved),
        reviewLog:     state.reviewLog.slice(-15),
        activeTask:    state.activeTask,
      }
      break

    case 'codestral':
      // Codestral is pure code completion — only needs immediate task context.
      slice = {
        projectId:  state.projectId,
        version:    state.version,
        activeTask: state.activeTask,
        // Inject just the related file names for context.
        architecture: {
          ...state.architecture,
          fileTree:   state.architecture.fileTree,
          dataModels: [],
          apiRoutes:  [],
          techStack:  state.architecture.techStack,
          patterns:   [],
          adrs:       {},
        },
      }
      break

    case 'perplexity':
      // Perplexity is the research model — it needs architecture + deps for context.
      slice = {
        projectId:    state.projectId,
        version:      state.version,
        architecture: state.architecture,
        dependencies: state.dependencies,
        reviewLog:    state.reviewLog.slice(-5),
        activeTask:   state.activeTask,
      }
      break

    default:
      slice = state
  }

  // Safety: if the slice is still too large, truncate it.
  const sliceTokens = estimateObjectTokens(slice)
  if (sliceTokens > budget) {
    // Truncate the review log further to reclaim tokens.
    if (slice.reviewLog && slice.reviewLog.length > 5) {
      slice = { ...slice, reviewLog: slice.reviewLog.slice(-5) }
    }
    // Last resort: stringify and truncate by character count.
    // (We return the string version wrapped in a special key for the caller.)
    const truncated = truncateObjectToFit(slice, model)
    try {
      return JSON.parse(truncated) as Partial<ProjectState>
    } catch {
      // If truncation produced invalid JSON, return just the active task.
      return { projectId: state.projectId, version: state.version, activeTask: state.activeTask }
    }
  }

  return slice
}

// ─── Optimistic locking (Redis SET NX) ────────────────────────────────────────

/** Lock TTL in seconds — after this time the lock auto-expires. */
const LOCK_TTL_SEC = 30

/**
 * Try to acquire a write lock on a project’s state.
 *
 * Uses Redis SET NX (set if not exists) with a UUID fencing token.
 * The TTL ensures the lock never gets stuck if the holder crashes.
 *
 * @returns The fencing token (string) if acquired, or null if the project
 *          is currently locked by another writer.
 *
 * @example
 *   const token = await acquireStateLock(projectId)
 *   if (!token) throw new Error('State is locked; retry later')
 *   try {
 *     await mergeProjectState(projectId, patch)
 *   } finally {
 *     await releaseStateLock(projectId, token)
 *   }
 */
export async function acquireStateLock(
  projectId: string,
): Promise<string | null> {
  const key   = `lock:${projectId}`  // vf: prefix added by ioredis
  const token = uuidv4()

  // SET key token NX EX ttl — returns 'OK' on success, null if already locked
  const result = await redis.set(key, token, 'EX', LOCK_TTL_SEC, 'NX')
  return result === 'OK' ? token : null
}

/**
 * Release a previously acquired state lock.
 *
 * Uses a Lua script to atomically check the token before deleting,
 * preventing one writer from releasing another’s lock.
 *
 * @param projectId - The project whose lock to release.
 * @param token     - The fencing token returned by acquireStateLock.
 */
export async function releaseStateLock(
  projectId: string,
  token:     string,
): Promise<void> {
  const key = `lock:${projectId}`  // vf: prefix added by ioredis

  // Atomic check-and-delete: only delete if the token matches.
  const lua = `
    if redis.call('GET', KEYS[1]) == ARGV[1] then
      return redis.call('DEL', KEYS[1])
    else
      return 0
    end
  `
  await redis.eval(lua, 1, key, token)
}

/**
 * Convenience wrapper: acquire lock, run fn, release lock.
 * Re-throws any error from fn after releasing the lock.
 */
export async function withStateLock<T>(
  projectId: string,
  fn:        () => Promise<T>,
): Promise<T> {
  const token = await acquireStateLock(projectId)
  if (!token) {
    throw new ProjectStateError(
      `Could not acquire state lock for project ${projectId} — another write is in progress.`,
      { projectId, code: 'STATE_LOCKED', retryable: true },
    )
  }

  try {
    return await fn()
  } finally {
    await releaseStateLock(projectId, token)
  }
}
