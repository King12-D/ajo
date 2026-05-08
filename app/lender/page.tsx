'use client'

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { AjoScore } from '@/components/AjoScore'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Search, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const SOLANA_RPC = 'https://api.mainnet-beta.solana.com'

interface TraderProfile {
  walletAddress: string
  ajoScore: number
  consistency: number
  revenueTrend: number
  expenseDiscipline: number
  thirtyDayData: Array<{ date: string; revenue: number }>
}

const mockTraders: Record<string, TraderProfile> = {
  '8xKp3mNa': {
    walletAddress: '8xKp3mNa',
    ajoScore: 742,
    consistency: 88,
    revenueTrend: 92,
    expenseDiscipline: 85,
    thirtyDayData: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 3000) + 1500,
    })),
  },
  '7yLq2pOb': {
    walletAddress: '7yLq2pOb',
    ajoScore: 685,
    consistency: 75,
    revenueTrend: 78,
    expenseDiscipline: 72,
    thirtyDayData: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 2500) + 1200,
    })),
  },
  '9zMr4qRc': {
    walletAddress: '9zMr4qRc',
    ajoScore: 815,
    consistency: 95,
    revenueTrend: 96,
    expenseDiscipline: 93,
    thirtyDayData: Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      revenue: Math.floor(Math.random() * 4000) + 2000,
    })),
  },
}

export default function LenderDashboard() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTrader, setSelectedTrader] = useState<TraderProfile | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle')
  const { publicKey, sendTransaction } = useWallet()

  const handleSearch = (address: string) => {
    const trader = mockTraders[address.toUpperCase()]
    if (trader) {
      setSelectedTrader(trader)
    } else {
      setSelectedTrader(null)
      alert('Trader not found. Try: 8xKp3mNa, 7yLq2pOb, or 9zMr4qRc')
    }
  }

  const handlePaymentConfirm = async () => {
    if (!publicKey || !selectedTrader) return

    setPaymentStatus('processing')

    try {
      // Mock Solana transaction
      const connection = new Connection(SOLANA_RPC)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(selectedTrader.walletAddress),
          lamports: 10000000, // 0.01 SOL
        })
      )

      // Simulate transaction processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setPaymentStatus('success')
      setTimeout(() => {
        setShowPaymentModal(false)
        setPaymentStatus('idle')
      }, 2000)
    } catch (err) {
      console.error('Payment failed:', err)
      setPaymentStatus('idle')
      alert('Payment failed. Make sure you have Phantom wallet connected.')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter trader wallet address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              onClick={() => handleSearch(searchQuery)}
              className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-semibold hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Try: 8xKp3mNa, 7yLq2pOb, or 9zMr4qRc
          </p>
        </div>

        {selectedTrader ? (
          <div className="space-y-8">
            {/* Trader Profile Card */}
            <div className="bg-card rounded-lg p-8 border border-border">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {selectedTrader.walletAddress}
                  </h2>
                  <p className="text-sm text-muted-foreground">Trader Profile</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedTrader(null)
                    setSearchQuery('')
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Score and Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="flex flex-col items-center">
                  <AjoScore score={selectedTrader.ajoScore} size="lg" />
                </div>

                <div className="flex flex-col justify-center gap-4">
                  <h3 className="font-semibold text-foreground mb-4">Score Breakdown</h3>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Consistency</span>
                      <span className="font-semibold text-foreground">
                        {selectedTrader.consistency}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-accent h-2 rounded-full"
                        style={{ width: `${selectedTrader.consistency}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Revenue Trend</span>
                      <span className="font-semibold text-foreground">
                        {selectedTrader.revenueTrend}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-secondary h-2 rounded-full"
                        style={{ width: `${selectedTrader.revenueTrend}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Expense Discipline</span>
                      <span className="font-semibold text-foreground">
                        {selectedTrader.expenseDiscipline}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${selectedTrader.expenseDiscipline}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Query Score Button */}
              {publicKey ? (
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-colors"
                >
                  Query Score (0.01 SOL)
                </button>
              ) : (
                <div className="w-full bg-muted text-muted-foreground py-4 rounded-lg font-bold text-lg text-center">
                  Connect Wallet to Query Score
                </div>
              )}
            </div>

            {/* Revenue Chart */}
            <div className="bg-card rounded-lg p-8 border border-border">
              <h3 className="font-semibold text-foreground mb-6">30-Day Revenue Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={selectedTrader.thirtyDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis
                    dataKey="date"
                    stroke="var(--color-muted-foreground)"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis stroke="var(--color-muted-foreground)" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg p-12 text-center border border-border">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground mb-2">Search for a trader</p>
            <p className="text-sm text-muted-foreground">
              Enter their wallet address to view their Ajo Score and financial metrics
            </p>
          </div>
        )}
      </main>

      {/* Payment Confirmation Modal */}
      {showPaymentModal && selectedTrader && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 w-full max-w-md shadow-xl">
            {paymentStatus === 'success' ? (
              <>
                <div className="text-center mb-6">
                  <CheckCircle className="w-16 h-16 mx-auto text-accent mb-4" />
                  <h2 className="text-2xl font-bold text-foreground">Payment Sent</h2>
                </div>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Score unlocked</p>
                  <p className="text-3xl font-bold text-accent">{selectedTrader.ajoScore}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setPaymentStatus('idle')
                  }}
                  className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-bold hover:bg-accent/90 transition-colors"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-4 text-foreground">Query Score</h2>
                <div className="bg-muted rounded-lg p-4 mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Amount</p>
                  <p className="text-2xl font-bold text-accent">0.01 SOL</p>
                </div>
                <p className="text-foreground mb-6">
                  This will send 0.01 SOL directly to the trader. Proceed?
                </p>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={paymentStatus === 'processing'}
                  className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-bold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                >
                  {paymentStatus === 'processing' ? 'Processing...' : 'Confirm Payment'}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
