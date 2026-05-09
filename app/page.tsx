'use client'

import { useState } from 'react'
import { Navigation }    from '@/components/Navigation'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AjoScore }      from '@/components/AjoScore'
import {
  Mic, TrendingUp, TrendingDown, Calendar,
  CheckCircle2, Clock, BarChart2, Wallet,
} from 'lucide-react'

/* ── types ─────────────────────────────────────────────────── */
interface DailyEntry {
  date:     string
  revenue:  number
  expenses: number
  status:   'pending' | 'confirmed'
}

/* ── 30-day mock data ───────────────────────────────────────── */
function generate30Days(): DailyEntry[] {
  const entries: DailyEntry[] = []
  const now = new Date()
  for (let i = 0; i < 30; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const rev = Math.floor(Math.random() * 4500) + 800
    entries.push({
      date:     d.toISOString().split('T')[0],
      revenue:  rev,
      expenses: Math.floor(rev * (0.2 + Math.random() * 0.2)),
      status:   Math.random() > 0.25 ? 'confirmed' : 'pending',
    })
  }
  return entries
}

const INITIAL_ENTRIES = generate30Days()

/* ── helpers ────────────────────────────────────────────────── */
function fmt(n: number) {
  return n >= 1000 ? `₦${(n / 1000).toFixed(1)}k` : `₦${n}`
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', month: 'short', day: 'numeric',
  })
}

/* ── component ──────────────────────────────────────────────── */
export default function TraderDashboard() {
  const [showRecorder, setShowRecorder] = useState(false)
  const [ajoScore,     setAjoScore]     = useState(742)
  const [entries,      setEntries]      = useState<DailyEntry[]>(INITIAL_ENTRIES)

  const handleRecordingComplete = (_blob: Blob, _transcript: string) => {
    const today   = new Date().toISOString().split('T')[0]
    const revenue = Math.floor(Math.random() * 4000) + 1000
    const newEntry: DailyEntry = {
      date:     today,
      revenue,
      expenses: Math.floor(revenue * 0.28),
      status:   'pending',
    }
    setEntries(prev => [newEntry, ...prev.slice(0, 29)])
    setAjoScore(prev => Math.min(Math.round(prev + Math.random() * 6), 850))
  }

  const totalRevenue  = entries.reduce((s, e) => s + e.revenue,  0)
  const totalExpenses = entries.reduce((s, e) => s + e.expenses, 0)
  const netProfit     = totalRevenue - totalExpenses
  const confirmedDays = entries.filter(e => e.status === 'confirmed').length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-6 space-y-6">

        {/* ── Wallet header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 border border-border/60 rounded-full px-3 py-1.5">
            <Wallet className="w-3.5 h-3.5" />
            <span className="font-mono">8xKp…3mNa</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Solana Mainnet
          </div>
        </div>

        {/* ── Score card ── */}
        <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
          {/* BG glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

          <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">
            Your Ajo Score
          </p>

          <div className="flex justify-center mb-4">
            <AjoScore score={ajoScore} size="lg" animated />
          </div>

          <p className="text-sm text-muted-foreground">
            Financial Identity Score · Updated daily
          </p>

          {/* Mini breakdown pills */}
          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            {[
              { label: 'Consistency',        pct: 88 },
              { label: 'Revenue Trend',      pct: 92 },
              { label: 'Expense Discipline', pct: 85 },
            ].map(item => (
              <div key={item.label} className="flex flex-col items-center gap-1">
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA Record button ── */}
        <button
          id="record-today-btn"
          onClick={() => setShowRecorder(true)}
          className="relative w-full btn-gold-shimmer text-accent-foreground py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all shadow-xl shadow-accent/20 overflow-hidden"
        >
          <span className="absolute inset-0 animate-pulse-ring rounded-2xl border-2 border-accent/40 pointer-events-none" />
          <Mic className="w-6 h-6" />
          Record Today
        </button>

        {/* ── Stats grid ── */}
        {entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: <TrendingUp className="w-4 h-4 text-primary" />,
                label: '30-Day Revenue',
                value: fmt(totalRevenue),
                color: 'text-primary',
              },
              {
                icon: <TrendingDown className="w-4 h-4 text-destructive" />,
                label: '30-Day Expenses',
                value: fmt(totalExpenses),
                color: 'text-destructive',
              },
              {
                icon: <BarChart2 className="w-4 h-4 text-accent" />,
                label: 'Net Profit',
                value: fmt(netProfit),
                color: 'text-accent',
              },
              {
                icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
                label: 'Days Confirmed',
                value: `${confirmedDays} / 30`,
                color: 'text-foreground',
              },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  {s.icon}
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Activity feed ── */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
            <Calendar className="w-4 h-4 text-accent" />
            <h3 className="font-semibold text-foreground text-sm">30-Day Activity</h3>
            <span className="ml-auto text-xs text-muted-foreground">{entries.length} entries</span>
          </div>

          {entries.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Mic className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
              <p className="font-medium text-muted-foreground">
                Start speaking your day to build your financial identity
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40 max-h-[520px] overflow-y-auto">
              {entries.map((entry, idx) => {
                const profit = entry.revenue - entry.expenses
                const isUp   = profit > 0
                return (
                  <div
                    key={idx}
                    className="px-5 py-4 hover:bg-muted/30 transition-colors group"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    <div className="flex items-center justify-between gap-4">
                      {/* Date */}
                      <div className="min-w-[90px]">
                        <p className="text-xs font-semibold text-foreground">
                          {fmtDate(entry.date)}
                        </p>
                        {/* Status pill */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium mt-1 ${
                          entry.status === 'confirmed'
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}>
                          {entry.status === 'confirmed'
                            ? <CheckCircle2 className="w-3 h-3" />
                            : <Clock        className="w-3 h-3" />
                          }
                          {entry.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </div>

                      {/* Revenue & expenses */}
                      <div className="flex gap-5 flex-1">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Revenue</p>
                          <p className="text-sm font-bold text-primary">
                            {fmt(entry.revenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground">Expenses</p>
                          <p className="text-sm font-bold text-muted-foreground">
                            {fmt(entry.expenses)}
                          </p>
                        </div>
                      </div>

                      {/* Net */}
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">Net</p>
                        <p className={`text-sm font-bold ${isUp ? 'text-accent' : 'text-destructive'}`}>
                          {isUp ? '+' : ''}{fmt(profit)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showRecorder && (
        <VoiceRecorder
          onClose={() => setShowRecorder(false)}
          onSave={handleRecordingComplete}
        />
      )}
    </div>
  )
}
