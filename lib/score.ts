/**
 * Ajo Score computation engine.
 * Takes a trader's last 30 daily entries and returns a score between 300–850.
 */

export interface Entry {
  date:    string
  revenue: number
  expenses: number
  status:  string
}

export interface ScoreBreakdown {
  consistency:       number // 0–100
  revenueTrend:      number // 0–100
  expenseDiscipline: number // 0–100
  overall:           number // 300–850
  label:             string
  trend:             'up' | 'down' | 'neutral'
}

/** Linear regression slope for revenue trend */
function revenueSlope(entries: Entry[]): number {
  const n = entries.length
  if (n < 2) return 0
  // oldest → newest
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const xs = sorted.map((_, i) => i)
  const ys = sorted.map(e => e.revenue)
  const xMean = xs.reduce((s, x) => s + x, 0) / n
  const yMean = ys.reduce((s, y) => s + y, 0) / n
  const num   = xs.reduce((s, x, i) => s + (x - xMean) * (ys[i] - yMean), 0)
  const den   = xs.reduce((s, x)    => s + (x - xMean) ** 2, 0)
  return den === 0 ? 0 : num / den
}

export function computeScore(entries: Entry[]): ScoreBreakdown {
  if (entries.length === 0) {
    return {
      consistency: 0, revenueTrend: 0, expenseDiscipline: 0,
      overall: 300, label: 'No Data', trend: 'neutral',
    }
  }

  // 1. Consistency: days with entries out of last 30
  const consistency = Math.min((entries.length / 30) * 100, 100)

  // 2. Revenue Trend: slope normalised to 0–100
  const slope = revenueSlope(entries)
  const avgRev = entries.reduce((s, e) => s + e.revenue, 0) / entries.length
  // +5% daily growth → 100, 0% → 50, negative → <50
  const slopeRatio = avgRev > 0 ? slope / avgRev : 0
  const revenueTrend = Math.max(0, Math.min(100, 50 + slopeRatio * 1000))

  // 3. Expense Discipline: avg profit margin
  const margins = entries.map(e => {
    if (e.revenue === 0) return 0
    return Math.max(0, 1 - e.expenses / e.revenue)
  })
  const avgMargin = margins.reduce((s, m) => s + m, 0) / margins.length
  const expenseDiscipline = Math.min(avgMargin * 150, 100)

  // 4. Confirmation bonus (confirmed entries = better data quality)
  const confirmedPct = entries.filter(e => e.status === 'confirmed').length / entries.length
  const confirmBonus = confirmedPct * 10

  // 5. Weighted overall
  const raw = (
    consistency       * 0.35 +
    revenueTrend      * 0.35 +
    expenseDiscipline * 0.25 +
    confirmBonus      * 0.05
  )
  const overall = Math.round(300 + (raw / 100) * 550)

  // 6. Label
  let label = 'Building'
  if (overall >= 800) label = 'Exceptional'
  else if (overall >= 740) label = 'Very Good'
  else if (overall >= 670) label = 'Good'
  else if (overall >= 580) label = 'Fair'

  const trend: 'up' | 'down' | 'neutral' = slope > 0 ? 'up' : slope < -10 ? 'down' : 'neutral'

  return {
    consistency:       Math.round(consistency),
    revenueTrend:      Math.round(revenueTrend),
    expenseDiscipline: Math.round(expenseDiscipline),
    overall,
    label,
    trend,
  }
}
