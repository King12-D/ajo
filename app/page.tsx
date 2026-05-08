'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { AjoScore } from '@/components/AjoScore'
import { Wallet, Calendar } from 'lucide-react'

interface DailyEntry {
  date: string
  revenue: number
  expenses: number
  status: 'pending' | 'confirmed'
}

export default function TraderDashboard() {
  const [showRecorder, setShowRecorder] = useState(false)
  const [ajoScore, setAjoScore] = useState(742)
  const [entries, setEntries] = useState<DailyEntry[]>([
    { date: '2024-01-08', revenue: 2500, expenses: 800, status: 'confirmed' },
    { date: '2024-01-07', revenue: 1800, expenses: 600, status: 'confirmed' },
    { date: '2024-01-06', revenue: 3200, expenses: 1200, status: 'confirmed' },
    { date: '2024-01-05', revenue: 1500, expenses: 500, status: 'pending' },
    { date: '2024-01-04', revenue: 2800, expenses: 950, status: 'confirmed' },
    { date: '2024-01-03', revenue: 2100, expenses: 700, status: 'confirmed' },
    { date: '2024-01-02', revenue: 3500, expenses: 1100, status: 'confirmed' },
    { date: '2024-01-01', revenue: 2200, expenses: 750, status: 'confirmed' },
  ])

  const handleRecordingComplete = (audioBlob: Blob, transcript: string) => {
    // Mock: add new entry
    const today = new Date().toISOString().split('T')[0]
    const mockRevenue = Math.floor(Math.random() * 4000) + 1000
    const mockExpenses = Math.floor(mockRevenue * 0.3)

    const newEntry: DailyEntry = {
      date: today,
      revenue: mockRevenue,
      expenses: mockExpenses,
      status: 'pending',
    }

    setEntries([newEntry, ...entries])

    // Mock score improvement
    setAjoScore((prev) => Math.min(prev + Math.random() * 5, 850))
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const totalRevenue = entries.reduce((sum, e) => sum + e.revenue, 0)
  const totalExpenses = entries.reduce((sum, e) => sum + e.expenses, 0)
  const avgDaily = totalRevenue / entries.length

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Wallet Address */}
        <div className="flex items-center gap-2 mb-8 text-sm text-muted-foreground">
          <Wallet className="w-4 h-4" />
          <span>8xKp...3mNa</span>
        </div>

        {/* Ajo Score Section */}
        <div className="bg-card rounded-lg p-8 mb-8 text-center border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">Your Ajo Score</h2>
          <div className="flex justify-center mb-6">
            <AjoScore score={ajoScore} size="lg" />
          </div>
          <p className="text-muted-foreground mb-2">Financial Identity Score</p>
          <p className="text-sm text-muted-foreground">Range: 300–850</p>
        </div>

        {/* Main CTA Button */}
        <button
          onClick={() => setShowRecorder(true)}
          className="w-full bg-accent text-accent-foreground py-6 rounded-lg font-bold text-xl hover:bg-accent/90 transition-colors mb-8 flex items-center justify-center gap-3"
        >
          <span className="text-3xl">🎤</span>
          Record Today
        </button>

        {/* Empty State or Activity Feed */}
        {entries.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center border border-border">
            <p className="text-lg text-muted-foreground mb-4">Start speaking your day</p>
            <p className="text-sm text-muted-foreground">
              to build your financial identity
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-lg p-6 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Total Revenue (30d)</p>
                <p className="text-3xl font-bold text-accent">${totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Total Expenses (30d)</p>
                <p className="text-3xl font-bold text-primary">${totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-card rounded-lg p-6 border border-border">
                <p className="text-sm text-muted-foreground mb-2">Average Daily Revenue</p>
                <p className="text-3xl font-bold text-secondary">${avgDaily.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  30-Day Activity
                </h3>
              </div>
              <div className="divide-y divide-border max-h-96 overflow-y-auto">
                {entries.map((entry, idx) => (
                  <div key={idx} className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-2">{formatDate(entry.date)}</p>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-bold text-accent">
                              ${entry.revenue.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Expenses</p>
                            <p className="text-lg font-bold text-primary">
                              ${entry.expenses.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            entry.status === 'confirmed'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {entry.status === 'confirmed' ? '✓ Confirmed' : '○ Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Voice Recorder Modal */}
      {showRecorder && (
        <VoiceRecorder
          onClose={() => setShowRecorder(false)}
          onSave={handleRecordingComplete}
        />
      )}
    </div>
  )
}
