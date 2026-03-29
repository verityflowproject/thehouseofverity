/**
 * lib/orchestrator/index.ts — Orchestrator barrel export
 *
 * Central export for all orchestrator modules.
 */

// Task classification
export { classifyTask, getTaskScores } from './task-classifier'

// Model assignment
export {
  getModelAssignment,
  requiresResearch,
  MODEL_ASSIGNMENT_TABLE,
} from './model-assignment'
export type { ModelAssignment } from './model-assignment'

// Hallucination detection
export {
  detectHallucinationTriggers,
  extractExternalReferences,
} from './hallucination-detector'

// Queue builder
export {
  buildTaskQueue,
  buildSingleTask,
} from './queue-builder'
export type { BuildQueueOptions } from './queue-builder'

// Hallucination firewall
export { checkHallucinationFirewall } from './hallucination-firewall'
export type {
  VerifiedPackage,
  PackageWarning,
  UnverifiedPackage,
  FirewallResult,
} from './hallucination-firewall'

// Review pipeline
export {
  runReviewPipeline,
  getReviewSummary,
} from './review-pipeline'
export type {
  ReviewResult,
  PipelineResult,
} from './review-pipeline'

// Arbitration
export {
  detectConflict,
  runArbitration,
  runBatchArbitration,
  getArbitrationSummary,
} from './arbitration'
export type {
  ArbitrationWinner,
  ArbitrationResult,
  BatchArbitrationResult,
} from './arbitration'

// Main orchestrator (primary export)
export {
  runOrchestrator,
  getOrchestratorSummary,
} from './orchestrator'
export type {
  OrchestratorResult,
} from './orchestrator'
