/**
 * lib/utils/project-state.ts — ProjectState read/write/merge layer
 *
 * Architecture:
 *   - Firestore: durable store via the ProjectState model helper
 *     Collection: vf_project_states  (document ID = projectId, 1:1 with Project)
 *
 * Optimistic concurrency:
 *   - The `version` field (integer) acts as an optimistic lock.
 *   - mergeProjectState accepts an expected version and throws VersionConflictError
 *     if the current version differs.
 */

import { v4 as uuidv4 } from 'uuid'

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

// ─── Internal helper ──────────────────────────────────────────────────────────

function toPlain(doc: Record<string, unknown>): ProjectState {
  return doc as unknown as ProjectState
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export async function getProjectState(projectId: string): Promise<ProjectState> {
  const doc = await ProjectStateModel.findOne({ projectId })

  if (!doc) {
    throw new ProjectStateError(`ProjectState not found for project ${projectId}`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  return toPlain(doc as unknown as Record<string, unknown>)
}

// ─── Write ────────────────────────────────────────────────────────────────────

export async function setProjectState(state: ProjectState): Promise<ProjectState> {
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
    { upsert: true },
  )

  if (!updated) {
    throw new ProjectStateError(
      `Failed to set ProjectState for project ${state.projectId}`,
      { projectId: state.projectId, code: 'UPDATE_FAILED' },
    )
  }

  return toPlain(updated as unknown as Record<string, unknown>)
}

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initProjectState(projectId: string): Promise<ProjectState> {
  const existing = await ProjectStateModel.findOne({ projectId })
  if (existing) return toPlain(existing as unknown as Record<string, unknown>)

  const now = new Date().toISOString()
  const id  = uuidv4()

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
      packages:       [],
      devPackages:    [],
      peerDeps:       [],
      conflicts:      [],
      lastVerifiedAt: now,
      lastVerifiedBy: 'perplexity' as ModelRole,
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
  return toPlain(doc as unknown as Record<string, unknown>)
}

// ─── Merge (Optimistic Lock) ──────────────────────────────────────────────────

export async function mergeProjectState(
  projectId:        string,
  patch:            Partial<ProjectState>,
  expectedVersion?: number,
): Promise<ProjectState> {
  const current = await ProjectStateModel.findOne({ projectId })

  if (!current) {
    throw new ProjectStateError(`ProjectState not found for project ${projectId}`, {
      projectId,
      code: 'PROJECT_STATE_NOT_FOUND',
    })
  }

  const currentVersion = current.version ?? 0

  if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
    throw new VersionConflictError({ projectId, expectedVersion, actualVersion: currentVersion })
  }

  const updated = await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $set: {
        ...patch,
        version:   currentVersion + 1,
        updatedAt: new Date().toISOString(),
      },
    },
  )

  if (!updated) {
    throw new ProjectStateError(
      `Failed to update ProjectState for project ${projectId}`,
      { projectId, code: 'UPDATE_FAILED' },
    )
  }

  return toPlain(updated as unknown as Record<string, unknown>)
}

// ─── Append helpers ────────────────────────────────────────────────────────────

export async function appendReviewLog(
  projectId: string,
  entry:     ReviewLogEntry,
): Promise<void> {
  await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $push: { reviewLog: entry as unknown as Record<string, unknown> },
      $inc:  { version: 1 },
    },
  )
}

export async function appendOpenQuestion(
  projectId: string,
  question:  OpenQuestion,
): Promise<void> {
  await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $push: { openQuestions: question as unknown as Record<string, unknown> },
      $inc:  { version: 1 },
    },
  )
}

export async function removeOpenQuestion(
  projectId:  string,
  questionId: string,
): Promise<void> {
  await ProjectStateModel.findOneAndUpdate(
    { projectId },
    {
      $pull: { openQuestions: { id: questionId } },
      $inc:  { version: 1 },
    },
  )
}

// ─── Context Budget & Truncation ───────────────────────────────────────────────

export async function getProjectStateWithBudget(
  projectId:    string,
  targetTokens: number,
): Promise<ProjectState> {
  const full = await getProjectState(projectId)
  const currentTokens = estimateObjectTokens(full)

  if (currentTokens <= targetTokens) return full

  const truncated: ProjectState = {
    ...full,
    architecture: {
      ...full.architecture,
      fileTree: JSON.parse(
        truncateToFitBudget(
          JSON.stringify(full.architecture.fileTree, null, 2),
          Math.floor(targetTokens * 0.5),
        ),
      ),
    },
    reviewLog: JSON.parse(
      truncateToFitBudget(
        JSON.stringify(full.reviewLog, null, 2),
        Math.floor(targetTokens * 0.3),
      ),
    ),
    openQuestions: JSON.parse(
      truncateToFitBudget(
        JSON.stringify(full.openQuestions, null, 2),
        Math.floor(targetTokens * 0.2),
      ),
    ),
  }

  return truncated
}

export async function deleteProjectState(projectId: string): Promise<void> {
  await ProjectStateModel.deleteOne({ projectId })
}
