/**
 * orchestrator.ts — OrchestratorTask, ModelResponse, and CouncilSession
 *
 * These types model the message-passing contract between:
 *   - The VerityFlow orchestrator (Next.js API route)
 *   - Individual model call adapters (one per ModelRole)
 *   - The council session manager (multi-model consensus)
 */

import type { ModelRole, TaskType, OperationStatus, Severity, Priority } from './models'
import type {
  ProjectState,
  ReviewLogEntry,
  OpenQuestion,
  ActiveTask,
} from './project'

// ─── Context slice ────────────────────────────────────────────────────────────

/**
 * A curated subset of ProjectState delivered to each model call.
 * We never send the full ProjectState to avoid blowing the context window;
 * the orchestrator selects only the fields relevant to the current task.
 */
export interface ContextSlice {
  /**
   * Partial project state — the orchestrator cherry-picks only what
   * the assigned model needs for the current task type.
   */
  readonly projectState: Partial<ProjectState>
  /**
   * Relative paths of files whose content should be injected into the prompt.
   * The orchestrator resolves these to actual code snippets.
   */
  readonly relevantFiles: string[]
  /**
   * The N most-recent review log entries to give the model
   * a sense of recency without the full log.
   */
  readonly recentHistory: ReviewLogEntry[]
  /**
   * Maximum tokens this model may use across prompt + completion.
   * The orchestrator enforces this before dispatching.
   */
  readonly tokenBudget: number
  /**
   * Open questions the model is expected to address or resolve
   * as part of this task.
   */
  readonly pendingQuestions: OpenQuestion[]
}

// ─── Orchestrator task ────────────────────────────────────────────────────────

/**
 * A single unit of work dispatched by the orchestrator to one model.
 * This is the primary contract between the routing layer and each
 * model-call adapter.
 */
export interface OrchestratorTask {
  readonly id: string
  readonly projectId: string
  /** Which model should execute this task. */
  readonly model: ModelRole
  readonly taskType: TaskType
  /**
   * The user-facing or orchestrator-composed prompt string.
   * May include injected file snippets and prior context.
   */
  readonly prompt: string
  /**
   * Optional system-level instructions that frame the model's role.
   * Separate from the user prompt so adapters can handle each appropriately.
   */
  readonly systemPrompt?: string
  /** The curated project context delivered alongside the prompt. */
  readonly contextSlice: ContextSlice
  readonly priority: Priority
  readonly createdAt: string
  /** Number of times this task has been retried after a failure. */
  readonly retryCount: number
  /** Maximum allowed retries before the orchestrator marks this failed. */
  readonly maxRetries: number
  /** Links this task to a parent if it is a sub-task decomposition. */
  readonly parentTaskId?: string
  /**
   * IDs of tasks that must complete before this task can start.
   * The orchestrator will execute tasks in dependency order, running
   * all tasks within the same dependency level in parallel.
   *
   * Example: a review task depends on the primary task.
   * Tasks with no dependsOn are in level 0 and run first.
   */
  readonly dependsOn?: string[]
  /** ISO deadline — the orchestrator will not dispatch after this time. */
  readonly expiresAt?: string
  /** ActiveTask snapshot at dispatch time (for context and timeout tracking). */
  readonly activeTask: ActiveTask
  /**
   * Human-readable explanation of why this model was selected for this task.
   * e.g. 'Routed to Gemini (simple task — cost optimized)' or
   *      'Routed to Claude (complex architecture task)'
   */
  readonly routingReason?: string
}

// ─── Model response ───────────────────────────────────────────────────────────

/**
 * A flagged issue emitted by a model inside its response.
 * Models are expected to self-report code quality issues, security
 * concerns, or architectural violations they notice while completing a task.
 */
export interface FlaggedIssue {
  readonly severity: Severity
  /**
   * Short machine-readable code for tooling, e.g. 'SEC-001', 'PERF-003'.
   * Optional — models include it when they can.
   */
  readonly code?: string
  readonly message: string
  /** Relative file path where the issue was found. */
  readonly file?: string
  /** 1-based line number. */
  readonly line?: number
  /** Column offset within the line. */
  readonly column?: number
  /** Concrete suggestion for how to fix the issue. */
  readonly suggestion?: string
  /** True if the model already applied a fix in its output. */
  readonly autoFixed: boolean
}

/**
 * Granular token accounting returned by every model adapter.
 * Used for cost attribution, billing, and usage dashboards.
 */
export interface TokenUsage {
  readonly promptTokens: number
  readonly completionTokens: number
  readonly totalTokens: number
  /** Cost in USD, derived by the adapter from the model's pricing table. */
  readonly estimatedCostUsd: number
}

/**
 * The response envelope returned by a model adapter after executing
 * an OrchestratorTask.
 */
export interface ModelResponse {
  readonly id: string
  /** Back-reference to the task that produced this response. */
  readonly taskId: string
  readonly projectId: string
  readonly model: ModelRole
  readonly taskType: TaskType
  /** Full text output from the model (code, prose, JSON, etc.). */
  readonly output: string
  /**
   * The model's self-reported confidence in its output.
   * Range: 0.0 (uncertain) → 1.0 (certain).
   * Orchestrator uses this to decide whether to escalate to a council.
   */
  readonly confidenceScore: number
  /** Issues the model flagged about its own output or the codebase. */
  readonly flaggedIssues: FlaggedIssue[]
  readonly tokensUsed: TokenUsage
  /** Wall-clock time in milliseconds from dispatch to response. */
  readonly latencyMs: number
  readonly timestamp: string
  /**
   * Partial ProjectState update the model proposes as a result of this task.
   * The orchestrator merges this into the canonical ProjectState after review.
   */
  readonly projectStateUpdate: Partial<ProjectState>
  /**
   * If the model decided to raise new open questions, they go here.
   * The orchestrator appends them to ProjectState.openQuestions.
   */
  readonly newOpenQuestions: Omit<OpenQuestion, 'id' | 'createdAt'>[] 
  /** Whether the model is requesting an escalation to a council session. */
  readonly requestsCouncil: boolean
  /** Short reason for requesting council — shown in the review log. */
  readonly councilReason?: string
}

// ─── Council session ──────────────────────────────────────────────────────────

/**
 * A single model's vote in a council session.
 * All participating models vote independently before the arbitrator
 * synthesises a consensus.
 */
export interface CouncilVote {
  readonly model: ModelRole
  /**
   * The model's proposed decision — a short declarative statement,
   * e.g. 'Use PostgreSQL over MongoDB for this use case.'
   */
  readonly decision: string
  /** Detailed reasoning supporting the decision. */
  readonly reasoning: string
  /** Self-reported confidence 0.0 – 1.0. */
  readonly confidence: number
  readonly votedAt: string
  /** The raw model response that produced this vote. */
  readonly responseId: string
  /** Tokens used to produce this vote. */
  readonly tokensUsed: TokenUsage
}

/**
 * The synthesised output of the arbitration phase.
 * Produced by the model assigned the 'arbitration' TaskType.
 */
export interface CouncilConsensus {
  /**
   * The final adopted decision.
   * In case of full agreement, mirrors the unanimous vote.
   * In case of split vote, reflects the arbitrator's ruling.
   */
  readonly decision: string
  /**
   * Overall confidence of the consensus:
   * weighted average of individual votes + arbitrator adjustment.
   */
  readonly confidence: number
  /** Any votes that were overruled. */
  readonly dissents: CouncilVote[]
  /** Paragraph-length summary of the discussion and reasoning. */
  readonly summary: string
  /** Proposed ProjectState patch derived from the consensus. */
  readonly projectStateUpdate: Partial<ProjectState>
  /** New open questions the council raised but did not resolve. */
  readonly newOpenQuestions: Omit<OpenQuestion, 'id' | 'createdAt'>[]
}

/**
 * A full council session — a synchronous multi-model deliberation
 * on a topic that requires more than one model's perspective.
 *
 * Lifecycle:
 *   pending → voting (all non-arbitrator models vote in parallel)
 *           → arbitrating (arbitrator synthesises)
 *           → resolved | failed
 */
export interface CouncilSession {
  readonly id: string
  readonly projectId: string
  readonly taskType: TaskType
  /** Short subject line, e.g. 'Database selection for user sessions' */
  readonly topic: string
  /** Full prompt sent to each participating model. */
  readonly prompt: string
  /** Models invited to vote (excludes the arbitratorModel). */
  readonly participants: ModelRole[]
  readonly votes: CouncilVote[]
  /** Responses collected during the voting phase. */
  readonly votingResponses: ModelResponse[]
  /** The model responsible for arbitration if consensus is not unanimous. */
  readonly arbitratorModel: ModelRole
  /** Set after the arbitration phase completes. */
  readonly arbitratorResponse?: ModelResponse
  readonly consensus: CouncilConsensus | null
  readonly status: OperationStatus
  readonly startedAt: string
  readonly resolvedAt?: string
  /** Aggregate token usage across all votes + arbitration. */
  readonly totalTokensUsed: TokenUsage
  /** Context slice provided to all participants. */
  readonly contextSlice: ContextSlice
}

// ─── Orchestrator config ──────────────────────────────────────────────────────

/**
 * Static routing rules that map TaskTypes to preferred ModelRoles.
 * The orchestrator falls back to this table when no dynamic override is set.
 */
export type ModelRoutingTable = Record<TaskType, ModelRole>

/**
 * Per-model configuration managed by the orchestrator at startup.
 * Includes adapter settings, rate limits, and circuit-breaker state.
 */
export interface ModelConfig {
  readonly model: ModelRole
  readonly enabled: boolean
  readonly maxConcurrentTasks: number
  readonly timeoutMs: number
  readonly retryDelay: number
  readonly maxRetries: number
  /** Token limit sent with every task dispatched to this model. */
  readonly defaultTokenBudget: number
  /** Whether this model is the designated arbitrator. */
  readonly isDefaultArbitrator: boolean
}

/**
 * Full orchestrator configuration — typically loaded from environment
 * variables and stored as a singleton on cold start.
 */
export interface OrchestratorConfig {
  readonly projectId: string
  readonly routingTable: ModelRoutingTable
  readonly modelConfigs: Record<ModelRole, ModelConfig>
  /** Hard cap on total tokens per user request across all model calls. */
  readonly globalTokenBudget: number
  /** Maximum wall-clock ms for the entire orchestration of one user request. */
  readonly timeoutMs: number
  /** Minimum confidence below which the orchestrator triggers a council. */
  readonly councilThreshold: number
}
