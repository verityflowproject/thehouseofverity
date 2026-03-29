/**
 * api.ts — API request/response envelope types
 *
 * Standardises every HTTP response from the VerityFlow Next.js
 * API layer. All route handlers return one of these shapes so
 * the frontend can discriminate success from error with a type guard.
 */

import type { ModelRole, TaskType, OperationStatus } from './models'
import type { OrchestratorTask, ModelResponse, CouncilSession } from './orchestrator'
import type { ProjectState, ProjectSummary } from './project'
import type { UsageSummary } from './user'

// ─── Generic API envelope ─────────────────────────────────────────────────────

/**
 * Every successful API response is wrapped in this envelope.
 * `data` is the route-specific payload; `meta` carries pagination,
 * timing, and version info.
 */
export interface ApiSuccess<T> {
  readonly ok: true
  readonly data: T
  readonly meta?: ApiMeta
}

export interface ApiError {
  readonly ok: false
  readonly error: ApiErrorDetail
}

export interface ApiErrorDetail {
  /** Machine-readable error code, e.g. 'QUOTA_EXCEEDED', 'UNAUTHORIZED' */
  readonly code: string
  readonly message: string
  readonly details?: Record<string, unknown>
  /** HTTP status code mirrored in the body for client convenience. */
  readonly status: number
}

export interface ApiMeta {
  readonly requestId: string
  readonly timestamp: string
  readonly durationMs?: number
  readonly page?: number
  readonly pageSize?: number
  readonly total?: number
}

/** Union type — discriminated on the `ok` field. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError

/** Type guard for successful responses. */
export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiSuccess<T> {
  return res.ok === true
}

/** Type guard for error responses. */
export function isApiError<T>(res: ApiResponse<T>): res is ApiError {
  return res.ok === false
}

// ─── Route-specific payloads ──────────────────────────────────────────────────

/** POST /api/orchestrator/run */
export interface RunOrchestratorRequest {
  readonly projectId: string
  readonly prompt: string
  readonly taskType?: TaskType
  readonly preferredModel?: ModelRole
  readonly priority?: import('./models').Priority
}

export interface RunOrchestratorResponse {
  readonly task: OrchestratorTask
  readonly response: ModelResponse
  readonly councilSession?: CouncilSession
  readonly projectStateVersion: number
}

/** GET /api/projects/:id/state */
export type GetProjectStateResponse = ProjectState

/** GET /api/projects */
export interface ListProjectsResponse {
  readonly projects: ProjectSummary[]
  readonly total: number
}

/** GET /api/usage */
export type GetUsageResponse = UsageSummary

/** POST /api/council/session */
export interface CreateCouncilSessionRequest {
  readonly projectId: string
  readonly topic: string
  readonly prompt: string
  readonly participants?: ModelRole[]
  readonly arbitratorModel?: ModelRole
}

export type CreateCouncilSessionResponse = CouncilSession

/** GET /api/council/session/:id */
export type GetCouncilSessionResponse = CouncilSession

/** GET /api/models/status */
export interface ModelStatusEntry {
  readonly model: ModelRole
  readonly available: boolean
  readonly latencyP50Ms?: number
  readonly latencyP95Ms?: number
  readonly errorRate?: number
}

export type GetModelsStatusResponse = ModelStatusEntry[]

// ─── Websocket / SSE event types ──────────────────────────────────────────────

/**
 * Server-Sent Events emitted by the orchestrator route while
 * a task is in flight. Clients subscribe and update the UI in real-time.
 */
export type OrchestratorEventType =
  | 'task.started'
  | 'task.progress'
  | 'task.completed'
  | 'task.failed'
  | 'council.started'
  | 'council.vote'
  | 'council.resolved'
  | 'state.updated'

export interface OrchestratorEvent<T = unknown> {
  readonly type: OrchestratorEventType
  readonly projectId: string
  readonly taskId?: string
  readonly sessionId?: string
  readonly timestamp: string
  readonly payload: T
  readonly status: OperationStatus
}
