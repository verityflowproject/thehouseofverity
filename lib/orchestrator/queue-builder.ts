/**
 * lib/orchestrator/queue-builder.ts — Task queue construction
 *
 * Main orchestrator logic. Takes a user prompt and project state,
 * classifies the task, assigns models, and builds an ordered queue
 * of OrchestratorTask objects ready for sequential execution.
 *
 * No LLM calls — pure task planning and context slicing.
 */

import { v4 as uuidv4 } from 'uuid'

import { classifyTask } from './task-classifier'
import { getModelAssignment, getSmartModelAssignment } from './model-assignment'
import { detectHallucinationTriggers, extractExternalReferences } from './hallucination-detector'
import { classifyTaskComplexity } from '@/lib/credit-costs'
import type {
  OrchestratorTask,
  ProjectState,
  TaskType,
  ModelRole,
  ContextSlice,
} from '@/lib/types'

// ─── Context slicing ──────────────────────────────────────────────────────────────

/**
 * Build a context slice appropriate for a specific model and task type.
 *
 * Different task types need different parts of the ProjectState:
 * - Architecture: conventions, tech stack, existing architecture
 * - Implementation: conventions, relevant files, dependencies
 * - Refactor: conventions, full architecture, existing code patterns
 * - Review: recent changes, conventions, open questions
 * - Research: dependencies, package.json references
 * - Arbitration: council votes, open questions
 *
 * @param projectState - The full project state
 * @param taskType - The task being executed
 * @param tokenBudget - Max tokens for this context slice
 * @returns Curated context slice
 */
function buildContextSlice(
  projectState: ProjectState,
  taskType: TaskType,
  tokenBudget: number = 8000,
): ContextSlice {
  // Base context that all tasks receive
  const baseContext: Partial<ProjectState> = {
    id: projectState.id,
    projectId: projectState.projectId,
    version: projectState.version,
    conventions: projectState.conventions,
  }

  // Add task-specific context
  switch (taskType) {
    case 'architecture':
      return {
        projectState: {
          ...baseContext,
          architecture: projectState.architecture,
          dependencies: projectState.dependencies,
        },
        relevantFiles: [],
        recentHistory: projectState.reviewLog.slice(-5),
        tokenBudget,
        pendingQuestions: projectState.openQuestions.slice(0, 3),
      }

    case 'implementation':
      return {
        projectState: {
          ...baseContext,
          architecture: {
            ...projectState.architecture,
            // Keep only essential fields
            fileTree: [],
            dataModels: [],
          },
          dependencies: projectState.dependencies,
        },
        relevantFiles: [], // Orchestrator should populate based on prompt analysis
        recentHistory: projectState.reviewLog.slice(-3),
        tokenBudget,
        pendingQuestions: projectState.openQuestions.slice(0, 3),
      }

    case 'refactor':
      return {
        projectState: {
          ...baseContext,
          architecture: projectState.architecture,
          dependencies: projectState.dependencies,
        },
        relevantFiles: [],
        recentHistory: projectState.reviewLog.slice(-10),
        tokenBudget,
        pendingQuestions: [],
      }

    case 'review':
      return {
        projectState: {
          ...baseContext,
          architecture: {
            ...projectState.architecture,
            // Keep only patterns for review
            fileTree: [],
            dataModels: [],
            apiRoutes: [],
            techStack: [],
            adrs: {},
          },
        },
        relevantFiles: [],
        recentHistory: projectState.reviewLog.slice(-5),
        tokenBudget,
        pendingQuestions: projectState.openQuestions,
      }

    case 'research':
      return {
        projectState: {
          ...baseContext,
          dependencies: projectState.dependencies,
        },
        relevantFiles: [],
        recentHistory: [],
        tokenBudget,
        pendingQuestions: [],
      }

    case 'arbitration':
      return {
        projectState: baseContext,
        relevantFiles: [],
        recentHistory: projectState.reviewLog.slice(-5),
        tokenBudget,
        pendingQuestions: projectState.openQuestions,
      }

    default:
      return {
        projectState: baseContext,
        relevantFiles: [],
        recentHistory: [],
        tokenBudget,
        pendingQuestions: [],
      }
  }
}

// ─── Research prompt builder ──────────────────────────────────────────────────────

/**
 * Build a verification prompt for Perplexity based on the user's prompt
 * and known packages from the project state.
 *
 * @param userPrompt - The original user prompt
 * @param projectState - Current project state (for package context)
 * @returns Research prompt for Perplexity
 */
function buildResearchPrompt(
  userPrompt: string,
  projectState: ProjectState,
): string {
  const externalRefs = extractExternalReferences(userPrompt)
  const knownPackages = projectState.dependencies.packages.map((p) => p.name)

  let researchPrompt = `Verify the following packages, libraries, and APIs mentioned in this task:\n\n`
  researchPrompt += `Task: ${userPrompt}\n\n`

  if (externalRefs.length > 0) {
    researchPrompt += `External references detected:\n`
    externalRefs.forEach((ref) => {
      researchPrompt += `- ${ref}\n`
    })
    researchPrompt += `\n`
  }

  if (knownPackages.length > 0) {
    researchPrompt += `Currently installed packages:\n`
    knownPackages.forEach((pkg) => {
      researchPrompt += `- ${pkg}\n`
    })
    researchPrompt += `\n`
  }

  researchPrompt += `Please verify:\n`
  researchPrompt += `1. Are the mentioned packages/libraries current and recommended?\n`
  researchPrompt += `2. Are there any known compatibility issues or security vulnerabilities?\n`
  researchPrompt += `3. What are the correct package names and latest stable versions?\n`
  researchPrompt += `4. Are there better alternatives for this use case?\n\n`
  researchPrompt += `Return structured JSON with verified, warnings, and unverified arrays.`

  return researchPrompt
}

// ─── Main queue builder ───────────────────────────────────────────────────────────

export interface BuildQueueOptions {
  /** Override the auto-classified task type. */
  taskTypeOverride?: TaskType
  /** Override the primary model assignment. */
  modelOverride?: ModelRole
  /** Force research even if not normally required. */
  forceResearch?: boolean
  /** Disable review step even if configured. */
  skipReview?: boolean
  /** Priority level for the task. */
  priority?: 'low' | 'normal' | 'high'
  /** Maximum retries per task. */
  maxRetries?: number
}

/**
 * Build an ordered task queue ready for sequential execution.
 *
 * This is the main orchestrator export. It:
 * 1. Classifies the task type from the prompt
 * 2. Assigns primary and reviewer models
 * 3. Detects hallucination triggers (external references)
 * 4. Optionally prepends a research task
 * 5. Adds the primary task with sliced context
 * 6. Optionally appends a review task
 *
 * @param projectId - UUID of the project
 * @param userPrompt - The user's input prompt
 * @param projectState - Current project state
 * @param options - Optional overrides and configuration
 * @returns Ordered array of OrchestratorTask objects
 *
 * @example
 *   const queue = buildTaskQueue(projectId, 'Implement user auth with Clerk', state)
 *   // → [
 *   //     { model: 'perplexity', taskType: 'research', ... },  // Research first
 *   //     { model: 'codestral', taskType: 'implementation', ... },
 *   //     { model: 'gpt5.4o', taskType: 'review', ... },
 *   //   ]
 */
export function buildTaskQueue(
  projectId: string,
  userPrompt: string,
  projectState: ProjectState,
  options: BuildQueueOptions = {},
): OrchestratorTask[] {
  const queue: OrchestratorTask[] = []
  const now = new Date().toISOString()

  // 1. Classify task type and complexity
  const taskType = options.taskTypeOverride ?? classifyTask(userPrompt)
  const complexity = classifyTaskComplexity(userPrompt)

  // 2. Get cost-optimized model assignment based on complexity
  const assignment = options.modelOverride
    ? getModelAssignment(taskType)
    : getSmartModelAssignment(taskType, complexity)
  const primaryModel = options.modelOverride ?? assignment.primary

  const routingReason = options.modelOverride
    ? `Manually overridden to ${options.modelOverride}`
    : `Routed to ${primaryModel} (${complexity} ${taskType} task — cost optimized)`

  // 3. Detect hallucination triggers
  const hasExternalRefs = detectHallucinationTriggers(userPrompt)
  const needsResearch =
    options.forceResearch ||
    assignment.needsResearch ||
    (hasExternalRefs && taskType !== 'research')

  // 4. Prepend research task if needed
  if (needsResearch) {
    const researchPrompt = buildResearchPrompt(userPrompt, projectState)
    const researchTask: OrchestratorTask = {
      id: uuidv4(),
      projectId,
      model: 'perplexity',
      taskType: 'research',
      prompt: researchPrompt,
      systemPrompt: undefined,
      contextSlice: buildContextSlice(projectState, 'research', 4000),
      priority: options.priority ?? 'normal',
      createdAt: now,
      retryCount: 0,
      maxRetries: options.maxRetries ?? 3,
      routingReason: 'Perplexity Sonar Pro — hallucination firewall dependency verification',
      activeTask: projectState.activeTask ?? {
        id: uuidv4(),
        scope: 'Research task',
        constraints: [],
        relatedFiles: [],
        taskType: 'research',
        assignedModel: 'perplexity',
        startedAt: now,
        timeoutMs: 120000,
        priority: options.priority ?? 'normal',
      },
    }
    queue.push(researchTask)
  }

  // 5. Add primary task (depends on research if present)
  const researchTaskId = needsResearch ? queue[queue.length - 1]?.id : undefined
  const primaryTask: OrchestratorTask = {
    id: uuidv4(),
    projectId,
    model: primaryModel,
    taskType,
    prompt: userPrompt,
    systemPrompt: undefined, // Adapters will add task-specific system prompts
    contextSlice: buildContextSlice(projectState, taskType, 8000),
    priority: options.priority ?? 'normal',
    createdAt: now,
    retryCount: 0,
    maxRetries: options.maxRetries ?? 3,
    routingReason,
    dependsOn: researchTaskId ? [researchTaskId] : undefined,
    activeTask: projectState.activeTask ?? {
      id: uuidv4(),
      scope: userPrompt,
      constraints: [],
      relatedFiles: [],
      taskType,
      assignedModel: primaryModel,
      startedAt: now,
      timeoutMs: 120000,
      priority: options.priority ?? 'normal',
    },
  }
  queue.push(primaryTask)

  // 6. Append review task if configured
  if (assignment.reviewer && !options.skipReview) {
    const reviewPrompt = `Review the following ${taskType} task output for correctness, quality, and adherence to conventions:\n\nOriginal Task: ${userPrompt}\n\nPlease provide a structured review with flagged issues and recommendations.`

    const reviewTask: OrchestratorTask = {
      id: uuidv4(),
      projectId,
      model: assignment.reviewer,
      taskType: 'review',
      prompt: reviewPrompt,
      systemPrompt: undefined,
      contextSlice: buildContextSlice(projectState, 'review', 6000),
      priority: options.priority ?? 'normal',
      createdAt: now,
      retryCount: 0,
      maxRetries: options.maxRetries ?? 2,
      parentTaskId: primaryTask.id,
      dependsOn: [primaryTask.id],
      routingReason: `${assignment.reviewer} — cross-model review of ${primaryModel} output`,
      activeTask: projectState.activeTask ?? {
        id: uuidv4(),
        scope: `Review: ${userPrompt}`,
        constraints: [],
        relatedFiles: [],
        taskType: 'review',
        assignedModel: assignment.reviewer!,
        startedAt: now,
        timeoutMs: 120000,
        priority: options.priority ?? 'normal',
      },
    }
    queue.push(reviewTask)
  }

  return queue
}

/**
 * Build a single task (no queue, no research, no review).
 * Useful for manual task dispatch or testing.
 */
export function buildSingleTask(
  projectId: string,
  prompt: string,
  taskType: TaskType,
  model: ModelRole,
  projectState: ProjectState,
): OrchestratorTask {
  return {
    id: uuidv4(),
    projectId,
    model,
    taskType,
    prompt,
    systemPrompt: undefined,
    contextSlice: buildContextSlice(projectState, taskType, 8000),
    priority: 'normal',
    createdAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
    activeTask: projectState.activeTask ?? {
      id: uuidv4(),
      scope: prompt,
      constraints: [],
      relatedFiles: [],
      taskType,
      assignedModel: model,
      startedAt: new Date().toISOString(),
      timeoutMs: 120000,
      priority: 'normal',
    },
  }
}
