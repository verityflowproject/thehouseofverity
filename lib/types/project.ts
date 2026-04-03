/**
 * project.ts — ProjectState and all nested data structures
 *
 * ProjectState is the central shared-memory object that travels with
 * every model call as a context slice and is persisted to Supabase
 * between sessions. Every field is typed explicitly; no `any`.
 */

import type { ModelRole, TaskType, Severity, RelationCardinality, HttpMethod, Priority } from './models'

// ─── File tree ────────────────────────────────────────────────────────────────

export interface FileTreeNode {
  /** Relative path from the project root, e.g. 'src/app/api/route.ts' */
  readonly path: string
  readonly type: 'file' | 'directory'
  /** Populated only for files. */
  readonly language?: string
  /** Short human description of what this file does. */
  readonly description?: string
  /** Child nodes — only present when type === 'directory'. */
  readonly children?: FileTreeNode[]
}

// ─── Data models ─────────────────────────────────────────────────────────────

export interface DataModelField {
  readonly name: string
  /** TypeScript-style type string, e.g. 'string', 'number', 'UUID', 'Date' */
  readonly type: string
  readonly required: boolean
  readonly unique?: boolean
  readonly default?: string
  readonly description?: string
}

export interface DataModelRelation {
  /** The local field that holds the foreign reference. */
  readonly field: string
  /** Dotted reference: 'ModelName.fieldName', e.g. 'User.id' */
  readonly references: string
  readonly cardinality: RelationCardinality
  readonly onDelete?: 'cascade' | 'restrict' | 'set-null' | 'no-action'
}

// Re-export for convenience — file imports from this module only
export type { RelationCardinality } from './models'

export interface DataModel {
  readonly name: string
  /** Plural collection / table name used in the database. */
  readonly collectionName: string
  readonly fields: DataModelField[]
  readonly relations?: DataModelRelation[]
  readonly indexes?: string[][]
  readonly description?: string
  /** ISO timestamp of when this model was last updated by a model decision. */
  readonly updatedAt: string
  readonly updatedBy: ModelRole
}

// ─── API routes ───────────────────────────────────────────────────────────────

export interface ApiRoute {
  readonly method: HttpMethod
  readonly path: string
  /** One-liner description shown in docs and review logs. */
  readonly description: string
  readonly auth: boolean
  /** JSON Schema string describing the request body. */
  readonly requestSchema?: string
  /** JSON Schema string describing the success response. */
  readonly responseSchema?: string
  /** HTTP status codes this route intentionally returns. */
  readonly statusCodes?: number[]
  readonly rateLimit?: RateLimitConfig
}

export type { HttpMethod } from './models'

export interface RateLimitConfig {
  readonly windowMs: number
  readonly maxRequests: number
  readonly keyBy: 'ip' | 'user' | 'team'
}

// ─── Architecture decisions ───────────────────────────────────────────────────

export interface TechStackEntry {
  readonly name: string
  readonly version?: string
  readonly purpose: string
  readonly layer: 'frontend' | 'backend' | 'database' | 'infra' | 'tooling'
}

export interface DesignPattern {
  readonly name: string
  readonly description: string
  readonly appliesTo: string[]
  readonly decidedBy: ModelRole
  readonly decidedAt: string
}

export interface ArchitectureDecisions {
  readonly fileTree: FileTreeNode[]
  readonly dataModels: DataModel[]
  readonly apiRoutes: ApiRoute[]
  readonly techStack: TechStackEntry[]
  readonly patterns: DesignPattern[]
  /** Free-form ADR (Architecture Decision Record) notes keyed by ADR ID. */
  readonly adrs: Record<string, ArchitectureDecisionRecord>
}

export interface ArchitectureDecisionRecord {
  readonly id: string
  readonly title: string
  readonly status: 'proposed' | 'accepted' | 'superseded' | 'deprecated'
  readonly context: string
  readonly decision: string
  readonly consequences: string
  readonly decidedBy: ModelRole
  readonly decidedAt: string
  readonly supersededBy?: string
}

// ─── Conventions ─────────────────────────────────────────────────────────────

export interface NamingConventions {
  /** e.g. 'PascalCase' */
  readonly components: string
  /** e.g. 'useCamelCase' */
  readonly hooks: string
  /** e.g. 'camelCase' */
  readonly utilities: string
  /** e.g. 'SCREAMING_SNAKE_CASE' */
  readonly constants: string
  /** e.g. 'PascalCase interfaces, camelCase type aliases' */
  readonly types: string
  /** e.g. 'camelCase' */
  readonly apiHandlers: string
  /** e.g. 'kebab-case' */
  readonly files: string
  /** e.g. 'kebab-case' */
  readonly directories: string
}

export interface FolderStructure {
  /** Top-level directories that should exist at the project root. */
  readonly root: string[]
  /** Subdirectory structure within /components */
  readonly components: string[]
  /** Pages / app router directories */
  readonly pages: string[]
  /** API route directories */
  readonly api: string[]
  /** /lib subdirectories */
  readonly lib: string[]
}

export interface ComponentPatterns {
  /** e.g. 'Zustand slices', 'React context + useReducer' */
  readonly stateManagement: string
  /** e.g. 'SWR with custom hooks', 'React Query', 'Server Components' */
  readonly dataFetching: string
  /** e.g. 'Error boundaries + sonner toasts' */
  readonly errorHandling: string
  /** e.g. 'Tailwind + shadcn/ui, no CSS modules' */
  readonly styling: string
  /** e.g. 'Compound component pattern for shared UI' */
  readonly composition: string
  /** e.g. 'Zod schemas at API boundaries' */
  readonly validation: string
}

export interface ConventionsState {
  readonly naming: NamingConventions
  readonly folderStructure: FolderStructure
  readonly componentPatterns: ComponentPatterns
  /** ISO timestamp of the last update to any convention. */
  readonly lastUpdatedAt: string
  readonly lastUpdatedBy: ModelRole
}

// ─── Dependencies ─────────────────────────────────────────────────────────────

export interface PackageDependency {
  readonly name: string
  readonly version: string
  /** Why this package is in the project. */
  readonly purpose: string
  readonly devDependency: boolean
  readonly addedBy: ModelRole
  readonly addedAt: string
}

export interface KnownGotcha {
  readonly id: string
  readonly package: string
  /** Short description of the problem. */
  readonly issue: string
  /** Concrete workaround or fix. */
  readonly workaround: string
  readonly severity: Severity
  readonly discoveredBy: ModelRole
  readonly discoveredAt: string
  readonly resolved: boolean
  readonly resolvedAt?: string
}

export interface DependenciesState {
  readonly packages: PackageDependency[]
  /**
   * Canonical version map mirroring package.json — used by models to
   * reference exact installed versions without reading the file system.
   * Keys are package names, values are semver strings.
   */
  readonly versionMap: Record<string, string>
  readonly knownGotchas: KnownGotcha[]
}

// ─── Open questions ───────────────────────────────────────────────────────────

export interface OpenQuestion {
  readonly id: string
  readonly text: string
  /** Which model raised this question. */
  readonly flaggedBy: ModelRole
  readonly taskType: TaskType
  readonly resolved: boolean
  /** Set once resolved is true. */
  readonly resolution?: string
  readonly resolvedBy?: ModelRole
  readonly resolvedAt?: string
  readonly createdAt: string
  /** IDs of related review log entries. */
  readonly relatedLogEntries?: string[]
}

// ─── Review log ───────────────────────────────────────────────────────────────

export interface ReviewLogEntry {
  readonly id: string
  /** The model that produced this log entry. */
  readonly model: ModelRole
  /**
   * The outcome of this model's decision:
   * e.g. 'Accepted', 'Rejected', 'Needs revision', 'Escalated to council'
   */
  readonly decision: string
  /** Detailed reasoning for the decision. */
  readonly rationale: string
  readonly timestamp: string
  readonly taskType: TaskType
  readonly severity: Severity
  /** Source files relevant to this review entry. */
  readonly relatedFiles: string[]
  /** ID of the orchestrator task that produced this entry. */
  readonly taskId: string
  /** Confidence the model had in this decision (0.0 – 1.0). */
  readonly confidence: number
}

// ─── Active task ─────────────────────────────────────────────────────────────

export interface ActiveTask {
  readonly id: string
  /** High-level description of what needs to happen. */
  readonly scope: string
  /** Invariants the model must not violate while completing this task. */
  readonly constraints: string[]
  /** Relative file paths that are in-scope for this task. */
  readonly relatedFiles: string[]
  readonly taskType: TaskType
  readonly assignedModel: ModelRole
  readonly startedAt: string
  /** Hard timeout after which the orchestrator may reassign. */
  readonly timeoutMs: number
  readonly priority: Priority
  /** Optional parent task ID if this is a sub-task. */
  readonly parentTaskId?: string
}

export type { Priority } from './models'

// ─── ProjectState (root) ──────────────────────────────────────────────────────

/**
 * ProjectState is the single source of truth shared across all model
 * calls within a project. It is:
 *   1. Persisted to Supabase (vf_project_states) keyed by `projectId`
 *   2. Sliced per-call into a ContextSlice before being sent to a model
 *   3. Merged back (partial update) after each model response
 *
 * All top-level fields are `readonly` at the type level to prevent
 * accidental mutation; updates must go through the state-merge utilities.
 */
export interface ProjectState {
  /** UUID v4 document identifier (equals projectId for the root state). */
  readonly id: string
  readonly projectId: string
  /** Monotonically increasing counter, incremented on every state update. */
  readonly version: number
  /** ISO 8601 timestamp of initial creation. */
  readonly createdAt: string
  /** ISO 8601 timestamp of the last state mutation. */
  readonly updatedAt: string

  /** Architecture decisions: file tree, data models, API surface. */
  readonly architecture: ArchitectureDecisions
  /** Code and naming conventions agreed upon by the council. */
  readonly conventions: ConventionsState
  /** NPM dependencies, version map, and known compatibility issues. */
  readonly dependencies: DependenciesState
  /** Unresolved questions raised by models during task execution. */
  readonly openQuestions: OpenQuestion[]
  /** Immutable append-only log of every model decision. */
  readonly reviewLog: ReviewLogEntry[]
  /** The currently-executing task, or null when idle. */
  readonly activeTask: ActiveTask | null
}

/**
 * A mutable draft of ProjectState used internally by the state-merge
 * utilities before the frozen readonly version is persisted.
 */
export type ProjectStateDraft = {
  -readonly [K in keyof ProjectState]: ProjectState[K]
}

/**
 * The minimal project summary exposed to the frontend dashboard —
 * a lightweight projection that omits large arrays.
 */
export interface ProjectSummary {
  readonly id: string
  readonly projectId: string
  readonly version: number
  readonly updatedAt: string
  readonly openQuestionCount: number
  readonly reviewLogCount: number
  readonly activeTask: Pick<ActiveTask, 'id' | 'scope' | 'taskType' | 'assignedModel'> | null
}
