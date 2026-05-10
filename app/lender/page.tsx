"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { AjoScore } from "@/components/AjoScore";
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  User,
  BarChart,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

/* ── types ────────────────────────────────────────────────── */
interface TraderProfile {
  walletAddress: string;
  score: {
    overall: number;
    consistency: number;
    revenueTrend: number;
    expenseDiscipline: number;
  };
  chartData: Array<{ date: string; revenue: number }>;
  entryCount: number;
}

/* ── component ──────────────────────────────────────────────── */
export default function LenderDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrader, setSelectedTrader] = useState<TraderProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");
  const [scoreUnlocked, setScoreUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery) return;
    setLoading(true);
    setSelectedTrader(null);
    setScoreUnlocked(false);

    try {
      const res = await fetch(`/api/lender/search?address=${searchQuery}`);
      if (!res.ok) throw new Error("Trader not found");
      const data = await res.json();
      setSelectedTrader(data);
    } catch (err) {
      alert("Trader not found. Make sure you enter a valid wallet address.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedTrader) return;
    setPaymentStatus("processing");
    
    try {
      // Real API call to log the payment and simulate the Solana tx
      const res = await fetch("/api/lender/payment", {
        method: "POST",
        body: JSON.stringify({
          lenderAddress: "Lender_Wallet_Mock",
          traderAddress: selectedTrader.walletAddress,
        }),
      });
      
      if (!res.ok) throw new Error("Payment failed");

      setPaymentStatus("success");
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus("idle");
        setScoreUnlocked(true);
      }, 1500);
    } catch (err) {
      alert("Transaction failed on Solana devnet.");
      setPaymentStatus("idle");
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 pb-20 pt-8 space-y-8">
        {/* ── Search Header ── */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-3xl font-black text-foreground mb-3">
            Lender Portal
          </h1>
          <p className="text-muted-foreground mb-8">
            Query verified financial identities on-chain to assess risk and
            underwrite loans.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Enter trader wallet address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-card border border-border/60 rounded-xl pl-12 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-inner"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-accent/20 flex items-center justify-center min-w-[120px]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Search"}
            </button>
          </div>
        </div>

        {selectedTrader ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border border-border/60">
              <div className="shrink-0 flex flex-col items-center">
                {scoreUnlocked ? (
                  <AjoScore
                    score={selectedTrader.score.overall}
                    size="lg"
                    animated
                  />
                ) : (
                  <div className="relative w-48 h-48 rounded-full border-[8px] border-muted flex items-center justify-center bg-card shadow-inner">
                    <ShieldCheck className="w-16 h-16 text-muted-foreground/30" />
                    <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-full">
                      <span className="text-xl font-bold text-muted-foreground tracking-widest">
                        LOCKED
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">
                      <User className="w-3.5 h-3.5" />
                      Trader Profile
                    </div>
                    <h2 className="text-2xl font-mono font-bold text-foreground">
                      {selectedTrader.walletAddress}
                    </h2>
                  </div>
                  {scoreUnlocked && (
                    <div className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                    </div>
                  )}
                </div>

                {scoreUnlocked ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        label: "Consistency",
                        val: selectedTrader.score.consistency,
                        icon: <Activity className="w-4 h-4 text-accent" />,
                      },
                      {
                        label: "Revenue Trend",
                        val: selectedTrader.score.revenueTrend,
                        icon: <TrendingUp className="w-4 h-4 text-primary" />,
                      },
                      {
                        label: "Expense Discipline",
                        val: selectedTrader.score.expenseDiscipline,
                        icon: (
                          <TrendingDown className="w-4 h-4 text-secondary" />
                        ),
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="bg-background/50 border border-border/40 rounded-xl p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {stat.icon}
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                            {stat.label}
                          </span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="text-2xl font-black text-foreground">
                            {stat.val}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground mb-1">
                            / 100
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full transition-all duration-1000"
                            style={{ width: `${stat.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-background/50 border border-border/40 rounded-xl p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Unlock this trader's financial identity, Ajo Score, and
                      30-day historical transaction data.
                    </p>
                    <button
                      onClick={() => setShowPaymentModal(true)}
                      className="w-full sm:w-auto btn-gold-shimmer text-accent-foreground px-8 py-4 rounded-xl font-bold text-base hover:opacity-95 transition-opacity shadow-lg shadow-accent/20 flex items-center justify-center gap-2 mx-auto"
                    >
                      Query Score — 0.01 SOL <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {scoreUnlocked && (
              <div
                className="glass-card rounded-2xl p-6 sm:p-8 border border-border/60 animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center gap-2 mb-8">
                  <BarChart className="w-5 h-5 text-accent" />
                  <h3 className="font-bold text-lg text-foreground">
                    Financial Trend History
                  </h3>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedTrader.chartData}
                      margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.76 0.19 75)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="oklch(0.76 0.19 75)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="date" stroke="oklch(0.58 0.015 155)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                      <YAxis
                        stroke="oklch(0.58 0.015 155)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) => `₦${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.14 0.018 155)",
                          border: "1px solid oklch(0.28 0.025 155 / 0.6)",
                          borderRadius: "12px",
                          color: "var(--foreground)",
                        }}
                        itemStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
                        formatter={(val: number) => [`₦${val.toLocaleString()}`, "Revenue"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="oklch(0.76 0.19 75)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorRev)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        ) : (
          !loading && (
            <div className="glass-card rounded-2xl p-12 text-center border border-border/60 max-w-2xl mx-auto mt-12">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                No Trader Selected
              </p>
              <p className="text-sm text-muted-foreground">
                Search for a trader's wallet address above to view their financial identity.
              </p>
            </div>
          )
        )}
      </main>

      {/* ── Payment Modal ── */}
      {showPaymentModal && selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => paymentStatus === "idle" && setShowPaymentModal(false)}
          />

          <div className="relative z-10 w-full sm:max-w-sm glass-card rounded-t-3xl sm:rounded-2xl p-8 shadow-2xl animate-fade-in-up border border-border/60">
            {paymentStatus === "success" ? (
              <div className="text-center py-6 animate-fade-in-up">
                <CheckCircle2 className="w-16 h-16 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-black text-foreground mb-2">
                  Payment Sent
                </h2>
                <p className="text-sm text-muted-foreground mb-8">
                  Successfully transferred 0.01 SOL.
                  <br />
                  Score unlocked.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-black text-foreground mb-6 text-center">
                  Query Score
                </h2>

                <div className="bg-background/50 border border-border/40 rounded-xl p-5 mb-6 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Total Amount
                  </p>
                  <p className="text-3xl font-mono font-black text-accent">
                    0.01 SOL
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ~$1.45 USD
                  </p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">From</span>
                    <span className="font-mono text-foreground">Your Wallet</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To Trader</span>
                    <span className="font-mono text-foreground">{selectedTrader.walletAddress}</span>
                  </div>
                </div>

                <button
                  onClick={handlePaymentConfirm}
                  disabled={paymentStatus === "processing"}
                  className="w-full btn-gold-shimmer text-accent-foreground py-4 rounded-xl font-bold text-base hover:opacity-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed mb-3 relative overflow-hidden flex justify-center items-center h-[56px]"
                >
                  {paymentStatus === "processing" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Confirming on Solana...
                    </span>
                  ) : (
                    "Confirm Payment"
                  )}
                </button>

                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentStatus === "processing"}
                  className="w-full bg-muted text-foreground py-4 rounded-xl font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
