/**
 * lib/utils/economics.ts — Unit economics aggregation
 *
 * Computes P50 / P90 / P99 cost and latency percentiles from vf_usage_logs.
 * Used by the internal admin economics endpoint to track real unit economics
 * per request type, enabling margin monitoring as usage scales.
 *
 * Usage:
 *   import { computeEconomics } from '@/lib/utils/economics'
 *   const stats = await computeEconomics({ days: 30 })
 */

import { supabaseAdmin } from '@/lib/db/supabase-server'
import { MARGIN_MULTIPLIER, CREDIT_UNIT_VALUE } from '@/lib/credit-costs'
import type { ModelRole, TaskType } from '@/lib/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PercentileStats {
  p50: number
  p90: number
  p99: number
  min: number
  max: number
  mean: number
  count: number
}

export interface ModelEconomics {
  model:              ModelRole
  calls:              number
  totalTokens:        number
  totalRawCostUsd:    number
  totalRevenueUsd:    number
  avgMarginPercent:   number
  latencyMs:          PercentileStats
  creditsPerCall:     PercentileStats
  rawCostUsd:         PercentileStats
}

export interface TaskTypeEconomics {
  taskType:           TaskType
  calls:              number
  totalRawCostUsd:    number
  totalRevenueUsd:    number
  avgMarginPercent:   number
  creditsPerCall:     PercentileStats
}

export interface EconomicsReport {
  period: {
    days:      number
    startDate: string
    endDate:   string
  }
  totals: {
    calls:            number
    rawCostUsd:       number
    revenueUsd:       number
    marginPercent:    number
    creditValueUsd:   number
    marginMultiplier: number
  }
  byModel:    ModelEconomics[]
  byTaskType: TaskTypeEconomics[]
  generatedAt: string
}

// ─── Percentile calculation ───────────────────────────────────────────────────

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, Math.min(idx, sorted.length - 1))]
}

function computePercentileStats(values: number[]): PercentileStats {
  if (values.length === 0) {
    return { p50: 0, p90: 0, p99: 0, min: 0, max: 0, mean: 0, count: 0 }
  }
  const sorted = [...values].sort((a, b) => a - b)
  const sum    = sorted.reduce((acc, v) => acc + v, 0)
  return {
    p50:   percentile(sorted, 50),
    p90:   percentile(sorted, 90),
    p99:   percentile(sorted, 99),
    min:   sorted[0],
    max:   sorted[sorted.length - 1],
    mean:  sum / sorted.length,
    count: sorted.length,
  }
}

// ─── Options ─────────────────────────────────────────────────────────────────

export interface ComputeEconomicsOptions {
  /** Number of days to look back (default: 30, max: 90). */
  days?: number
  /** Optional: filter to a specific user. */
  userId?: string
}

// ─── Main aggregation ─────────────────────────────────────────────────────────

export async function computeEconomics(
  opts: ComputeEconomicsOptions = {},
): Promise<EconomicsReport> {
  const days      = Math.min(opts.days ?? 30, 90)
  const endDate   = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  let query = supabaseAdmin
    .from('vf_usage_logs')
    .select('ai_model, task_type, total_tokens, estimated_cost_usd, duration_ms')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())

  if (opts.userId) {
    query = query.eq('user_id', opts.userId)
  }

  const { data, error } = await query
  if (error) {
    console.error('[Economics] Query error:', error)
  }

  const logs = (data ?? []) as Array<{
    ai_model:           string
    task_type:          string
    total_tokens:       number
    estimated_cost_usd: number
    duration_ms:        number
  }>

  // Group by model
  const modelGroups = new Map<ModelRole, typeof logs>()
  const taskGroups  = new Map<TaskType,  typeof logs>()

  for (const log of logs) {
    const model    = log.ai_model    as ModelRole
    const taskType = log.task_type   as TaskType

    if (!modelGroups.has(model))    modelGroups.set(model,    [])
    if (!taskGroups.has(taskType))  taskGroups.set(taskType,  [])
    modelGroups.get(model)!.push(log)
    taskGroups.get(taskType)!.push(log)
  }

  // Build per-model economics
  const byModel: ModelEconomics[] = []
  for (const [model, entries] of modelGroups.entries()) {
    const rawCostValues   = entries.map((e) => e.estimated_cost_usd ?? 0)
    const latencyValues   = entries.map((e) => e.duration_ms ?? 0)
    const totalRawCost    = rawCostValues.reduce((s, v) => s + v, 0)
    const totalRevenue    = totalRawCost * MARGIN_MULTIPLIER
    const totalTokens     = entries.reduce((s, e) => s + (e.total_tokens ?? 0), 0)
    const creditsPerCallValues = rawCostValues.map(
      (cost) => Math.max(1, Math.ceil((cost * MARGIN_MULTIPLIER) / CREDIT_UNIT_VALUE)),
    )

    byModel.push({
      model,
      calls:            entries.length,
      totalTokens,
      totalRawCostUsd:  totalRawCost,
      totalRevenueUsd:  totalRevenue,
      avgMarginPercent: (MARGIN_MULTIPLIER - 1) * 100,
      latencyMs:        computePercentileStats(latencyValues),
      creditsPerCall:   computePercentileStats(creditsPerCallValues),
      rawCostUsd:       computePercentileStats(rawCostValues),
    })
  }

  // Build per-task-type economics
  const byTaskType: TaskTypeEconomics[] = []
  for (const [taskType, entries] of taskGroups.entries()) {
    const rawCostValues   = entries.map((e) => e.estimated_cost_usd ?? 0)
    const totalRawCost    = rawCostValues.reduce((s, v) => s + v, 0)
    const totalRevenue    = totalRawCost * MARGIN_MULTIPLIER
    const creditsPerCallValues = rawCostValues.map(
      (cost) => Math.max(1, Math.ceil((cost * MARGIN_MULTIPLIER) / CREDIT_UNIT_VALUE)),
    )

    byTaskType.push({
      taskType,
      calls:            entries.length,
      totalRawCostUsd:  totalRawCost,
      totalRevenueUsd:  totalRevenue,
      avgMarginPercent: (MARGIN_MULTIPLIER - 1) * 100,
      creditsPerCall:   computePercentileStats(creditsPerCallValues),
    })
  }

  const totalRawCost = logs.reduce((s, e) => s + (e.estimated_cost_usd ?? 0), 0)
  const totalRevenue = totalRawCost * MARGIN_MULTIPLIER

  return {
    period: {
      days,
      startDate: startDate.toISOString(),
      endDate:   endDate.toISOString(),
    },
    totals: {
      calls:            logs.length,
      rawCostUsd:       totalRawCost,
      revenueUsd:       totalRevenue,
      marginPercent:    (MARGIN_MULTIPLIER - 1) * 100,
      creditValueUsd:   CREDIT_UNIT_VALUE,
      marginMultiplier: MARGIN_MULTIPLIER,
    },
    byModel:     byModel.sort((a, b) => b.calls - a.calls),
    byTaskType:  byTaskType.sort((a, b) => b.calls - a.calls),
    generatedAt: new Date().toISOString(),
  }
}
