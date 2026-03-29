/**
 * lib/orchestrator/hallucination-firewall.ts — Pre-execution validation
 *
 * Runs before implementation or architecture tasks execute.
 * Verifies external package/API references using Perplexity to prevent
 * hallucinated dependencies from entering the codebase.
 *
 * Strategy:
 * 1. Check if prompt triggers hallucination concerns
 * 2. If yes, call Perplexity to verify all mentioned packages
 * 3. Parse response into verified/warnings/unverified
 * 4. Block if unverified packages are directly referenced
 * 5. Enrich prompt with verified dependency info if passes
 * 6. Update ProjectState dependencies
 * 7. Fail open if Perplexity errors (don't block execution)
 */

import { v4 as uuidv4 } from 'uuid'

import { detectHallucinationTriggers, extractExternalReferences } from './hallucination-detector'
import { callPerplexity } from '@/lib/adapters'
import type {
  OrchestratorTask,
  ProjectState,
  TaskType,
} from '@/lib/types'

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface VerifiedPackage {
  package: string
  version: string
  notes: string
}

export interface PackageWarning {
  package: string
  issue: string
}

export interface UnverifiedPackage {
  package: string
  reason: string
}

export interface FirewallResult {
  /** Whether the task is allowed to proceed. */
  allowed: boolean
  /** Reason for blocking (if allowed is false). */
  blockReason?: string
  /** Enriched prompt with verified dependency info (if allowed is true). */
  enrichedPrompt?: string
  /** Verified packages from Perplexity. */
  verified: VerifiedPackage[]
  /** Warnings about packages. */
  warnings: PackageWarning[]
  /** Unverified packages that couldn't be validated. */
  unverified: UnverifiedPackage[]
  /** Updated ProjectState with new dependency info (if any). */
  updatedState?: Partial<ProjectState>
}

// ─── Verification logic ────────────────────────────────────────────────────────

/**
 * Build a Perplexity verification prompt from the user's prompt and
 * known packages.
 */
function buildVerificationPrompt(
  userPrompt: string,
  projectState: ProjectState,
): string {
  const externalRefs = extractExternalReferences(userPrompt)
  const knownPackages = projectState.dependencies.packages.map((p) => p.name)

  let prompt = `You are a package verification specialist. Verify all external packages, libraries, and APIs mentioned below.\n\n`
  prompt += `User Task: ${userPrompt}\n\n`

  if (externalRefs.length > 0) {
    prompt += `Detected References:\n`
    externalRefs.forEach((ref) => {
      prompt += `- ${ref}\n`
    })
    prompt += `\n`
  }

  if (knownPackages.length > 0) {
    prompt += `Currently Installed:\n`
    knownPackages.forEach((pkg) => {
      prompt += `- ${pkg}\n`
    })
    prompt += `\n`
  }

  prompt += `Return ONLY valid JSON with this structure:\n`
  prompt += `{\n`
  prompt += `  "verified": [{"package": "name", "version": "x.y.z", "notes": "why recommended"}],\n`
  prompt += `  "warnings": [{"package": "name", "issue": "description"}],\n`
  prompt += `  "unverified": [{"package": "name", "reason": "why not found"}]\n`
  prompt += `}\n\n`
  prompt += `Include only packages explicitly mentioned. Verify latest stable versions.`

  return prompt
}

/**
 * Parse Perplexity's JSON response into structured data.
 */
function parseVerificationResponse(output: string): {
  verified: VerifiedPackage[]
  warnings: PackageWarning[]
  unverified: UnverifiedPackage[]
} {
  try {
    const parsed = JSON.parse(output)
    return {
      verified: Array.isArray(parsed.verified) ? parsed.verified : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      unverified: Array.isArray(parsed.unverified) ? parsed.unverified : [],
    }
  } catch {
    // If parsing fails, return empty arrays
    return { verified: [], warnings: [], unverified: [] }
  }
}

/**
 * Check if any unverified packages are directly referenced in the prompt.
 */
function hasDirectUnverifiedReferences(
  userPrompt: string,
  unverified: UnverifiedPackage[],
): boolean {
  const promptLower = userPrompt.toLowerCase()

  for (const item of unverified) {
    const packageLower = item.package.toLowerCase()
    // Check for direct mentions (not just substring matches)
    const pattern = new RegExp(`\\b${packageLower}\\b`, 'i')
    if (pattern.test(promptLower)) {
      return true
    }
  }

  return false
}

/**
 * Enrich the prompt with verified dependency information.
 */
function enrichPromptWithVerifiedInfo(
  userPrompt: string,
  verified: VerifiedPackage[],
  warnings: PackageWarning[],
): string {
  let enriched = userPrompt + `\n\n`

  if (verified.length > 0) {
    enriched += `### Verified Dependencies\n`
    enriched += `The following packages have been verified:\n`
    verified.forEach((v) => {
      enriched += `- **${v.package}@${v.version}**: ${v.notes}\n`
    })
    enriched += `\n`
  }

  if (warnings.length > 0) {
    enriched += `### Dependency Warnings\n`
    enriched += `⚠️ Please note the following concerns:\n`
    warnings.forEach((w) => {
      enriched += `- **${w.package}**: ${w.issue}\n`
    })
    enriched += `\n`
  }

  return enriched
}

/**
 * Update ProjectState with newly verified dependency information.
 */
function buildStateUpdate(
  verified: VerifiedPackage[],
  projectState: ProjectState,
): Partial<ProjectState> {
  const updatedPackages = [...projectState.dependencies.packages]
  const updatedVersionMap = { ...projectState.dependencies.versionMap }

  for (const v of verified) {
    // Update version map
    updatedVersionMap[v.package] = v.version

    // Add to packages if not already present
    const exists = updatedPackages.find((p) => p.name === v.package)
    if (!exists) {
      updatedPackages.push({
        name: v.package,
        version: v.version,
        purpose: v.notes,
        devDependency: false,
        addedBy: 'perplexity',
        addedAt: new Date().toISOString(),
      })
    }
  }

  return {
    dependencies: {
      ...projectState.dependencies,
      packages: updatedPackages,
      versionMap: updatedVersionMap,
    },
  }
}

// ─── Main firewall function ────────────────────────────────────────────────────

/**
 * Run the hallucination firewall check.
 *
 * This runs before implementation or architecture tasks execute to
 * verify external package/API references and prevent hallucinated
 * dependencies.
 *
 * @param userPrompt - The user's input prompt
 * @param taskType - The classified task type
 * @param projectState - Current project state
 * @returns FirewallResult with allowed flag and enriched prompt
 *
 * @example
 *   const result = await checkHallucinationFirewall(prompt, 'implementation', state)
 *   if (!result.allowed) {
 *     throw new Error(result.blockReason)
 *   }
 *   // Use result.enrichedPrompt for the actual model call
 */
export async function checkHallucinationFirewall(
  userPrompt: string,
  taskType: TaskType,
  projectState: ProjectState,
): Promise<FirewallResult> {
  // 1. Only check implementation and architecture tasks
  if (taskType !== 'implementation' && taskType !== 'architecture') {
    return {
      allowed: true,
      enrichedPrompt: userPrompt,
      verified: [],
      warnings: [],
      unverified: [],
    }
  }

  // 2. Check if prompt triggers hallucination concerns
  const hasHallucinationTriggers = detectHallucinationTriggers(userPrompt)
  if (!hasHallucinationTriggers) {
    return {
      allowed: true,
      enrichedPrompt: userPrompt,
      verified: [],
      warnings: [],
      unverified: [],
    }
  }

  // 3. Call Perplexity to verify packages
  try {
    const verificationPrompt = buildVerificationPrompt(userPrompt, projectState)

    // Build a minimal OrchestratorTask for Perplexity
    const verificationTask: OrchestratorTask = {
      id: uuidv4(),
      projectId: projectState.projectId,
      model: 'perplexity',
      taskType: 'research',
      prompt: verificationPrompt,
      contextSlice: {
        projectState: {
          dependencies: projectState.dependencies,
        },
        relevantFiles: [],
        recentHistory: [],
        tokenBudget: 4000,
        pendingQuestions: [],
      },
      priority: 'high',
      createdAt: new Date().toISOString(),
      retryCount: 0,
      maxRetries: 2,
      activeTask: {
        id: uuidv4(),
        scope: 'Package verification',
        constraints: [],
        relatedFiles: [],
        taskType: 'research',
        assignedModel: 'perplexity',
        startedAt: new Date().toISOString(),
        timeoutMs: 120000,
        priority: 'high',
      },
    }

    const response = await callPerplexity(verificationTask)

    // 4. Parse response
    const { verified, warnings, unverified } = parseVerificationResponse(response.output)

    // 5. Check for blocking conditions
    if (hasDirectUnverifiedReferences(userPrompt, unverified)) {
      const unverifiedNames = unverified.map((u) => u.package).join(', ')
      return {
        allowed: false,
        blockReason: `Cannot verify the following packages: ${unverifiedNames}. These packages may not exist or may have incorrect names. Please verify package names and try again.`,
        verified,
        warnings,
        unverified,
      }
    }

    // 6. Enrich prompt with verified info
    const enrichedPrompt = enrichPromptWithVerifiedInfo(userPrompt, verified, warnings)

    // 7. Build state update
    const updatedState = buildStateUpdate(verified, projectState)

    return {
      allowed: true,
      enrichedPrompt,
      verified,
      warnings,
      unverified,
      updatedState,
    }
  } catch (error) {
    // Fail open - if Perplexity errors, allow the task to proceed
    console.warn('[Firewall] Perplexity verification failed, failing open:', error)
    return {
      allowed: true,
      enrichedPrompt: userPrompt + `\n\n⚠️ Note: Package verification unavailable. Please verify dependencies manually.`,
      verified: [],
      warnings: [],
      unverified: [],
    }
  }
}
