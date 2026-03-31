/**
 * index.ts — Public barrel for the VerityFlow type system
 *
 * Import from '@/lib/types' anywhere in the app to access all
 * shared types without deep path imports.
 *
 * Convention:
 *   import type { ModelRole, ProjectState } from '@/lib/types'
 */

// Core enumerations and primitive literals
export type {
  ModelRole,
  TaskType,
  Plan,
  Severity,
  OperationStatus,
  HttpMethod,
  RelationCardinality,
  Priority,
} from './models'

export {
  MODEL_ROLES,
  MODEL_LABELS,
  MODEL_COLORS,
  TASK_TYPES,
  PLAN_LABELS,
  PLAN_CALL_LIMITS,
  PLAN_CREDIT_ALLOCATIONS,
  PLAN_DAILY_CREDIT_LIMITS,
  SEVERITY_WEIGHT,
} from './models'

// ProjectState and all nested shapes
export type {
  // File tree
  FileTreeNode,
  // Data models
  DataModelField,
  DataModelRelation,
  DataModel,
  // API routes
  ApiRoute,
  RateLimitConfig,
  // Architecture
  TechStackEntry,
  DesignPattern,
  ArchitectureDecisions,
  ArchitectureDecisionRecord,
  // Conventions
  NamingConventions,
  FolderStructure,
  ComponentPatterns,
  ConventionsState,
  // Dependencies
  PackageDependency,
  KnownGotcha,
  DependenciesState,
  // Open questions
  OpenQuestion,
  // Review log
  ReviewLogEntry,
  // Active task
  ActiveTask,
  // Root state
  ProjectState,
  ProjectStateDraft,
  ProjectSummary,
} from './project'

// Orchestrator and model response types
export type {
  ContextSlice,
  OrchestratorTask,
  FlaggedIssue,
  TokenUsage,
  ModelResponse,
  CouncilVote,
  CouncilConsensus,
  CouncilSession,
  ModelRoutingTable,
  ModelConfig,
  OrchestratorConfig,
} from './orchestrator'

// User, session, and billing types
export type {
  UserProfile,
  SessionUser,
  ModelCallRecord,
  UsageSummary,
  Team,
  TeamMembership,
} from './user'

// API envelope types (includes runtime type guards — not 'type' only)
export type {
  ApiSuccess,
  ApiError,
  ApiErrorDetail,
  ApiMeta,
  ApiResponse,
  RunOrchestratorRequest,
  RunOrchestratorResponse,
  GetProjectStateResponse,
  ListProjectsResponse,
  GetUsageResponse,
  CreateCouncilSessionRequest,
  CreateCouncilSessionResponse,
  GetCouncilSessionResponse,
  ModelStatusEntry,
  GetModelsStatusResponse,
  OrchestratorEventType,
  OrchestratorEvent,
} from './api'

// Runtime guards (values, not types)
export { isApiSuccess, isApiError } from './api'

// NextAuth session extension (re-export the helper interface)
export type { VerityFlowSessionUser } from './next-auth'
