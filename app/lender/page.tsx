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

/* ── mock data ──────────────────────────────────────────────── */
interface TraderProfile {
  walletAddress: string;
  ajoScore: number;
  consistency: number;
  revenueTrend: number;
  expenseDiscipline: number;
  thirtyDayData: Array<{ date: string; revenue: number; expenses: number }>;
}

function generateMockData(
  baseRev: number,
): TraderProfile["thirtyDayData"] {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    // Deterministic mock data to avoid hydration mismatch
    const variance = (i * 13) % 20; 
    const rev = baseRev + (variance - 10) * (baseRev * 0.01);
    data.push({
      date: d.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      revenue: Math.floor(rev),
      expenses: Math.floor(rev * 0.25),
    });
  }
  return data;
}

const MOCK_TRADERS: Record<string, TraderProfile> = {
  "8XKP3MNA": {
    walletAddress: "8xKp...3mNa",
    ajoScore: 742,
    consistency: 88,
    revenueTrend: 92,
    expenseDiscipline: 85,
    thirtyDayData: generateMockData(2000),
  },
  "7YLQ2POB": {
    walletAddress: "7yLq...2pOb",
    ajoScore: 615,
    consistency: 65,
    revenueTrend: 58,
    expenseDiscipline: 72,
    thirtyDayData: generateMockData(1200),
  },
  "9ZMR4QRC": {
    walletAddress: "9zMr...4qRc",
    ajoScore: 815,
    consistency: 95,
    revenueTrend: 96,
    expenseDiscipline: 93,
    thirtyDayData: generateMockData(4500),
  },
};

/* ── component ──────────────────────────────────────────────── */
export default function LenderDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrader, setSelectedTrader] = useState<TraderProfile | null>(
    null,
  );
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "processing" | "success"
  >("idle");
  const [scoreUnlocked, setScoreUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = () => {
    const q = searchQuery.toUpperCase().replace(/\./g, "");
    const foundKey = Object.keys(MOCK_TRADERS).find(
      (k) => k.includes(q) || q.includes(k),
    );
    if (foundKey) {
      setSelectedTrader(MOCK_TRADERS[foundKey]);
      setScoreUnlocked(false);
    } else {
      setSelectedTrader(null);
      alert("Trader not found. Try: 8xKp, 7yLq, or 9zMr");
    }
  };

  const handlePaymentConfirm = () => {
    setPaymentStatus("processing");
    setTimeout(() => {
      setPaymentStatus("success");
      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentStatus("idle");
        setScoreUnlocked(true);
      }, 1500);
    }, 2000);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 pb-20 pt-8 space-y-8">
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
                placeholder="Enter trader wallet address (e.g. 8xKp...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full bg-card border border-border/60 rounded-xl pl-12 pr-4 py-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent transition-all shadow-inner"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-accent text-accent-foreground px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity whitespace-nowrap shadow-lg shadow-accent/20"
            >
              Search
            </button>
          </div>
          <div className="flex gap-2 justify-center mt-3">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              Try:
            </span>
            {["8xKp", "7yLq", "9zMr"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSearchQuery(t);
                  setTimeout(() => handleSearch(), 100);
                }}
                className="text-[10px] text-accent hover:underline font-mono"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {selectedTrader ? (
          <div className="space-y-6 animate-fade-in-up">
            <div className="glass-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center md:items-start border border-border/60">
              <div className="shrink-0 flex flex-col items-center">
                {scoreUnlocked ? (
                  <AjoScore
                    score={selectedTrader.ajoScore}
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
                        val: selectedTrader.consistency,
                        icon: <Activity className="w-4 h-4 text-accent" />,
                      },
                      {
                        label: "Revenue Trend",
                        val: selectedTrader.revenueTrend,
                        icon: <TrendingUp className="w-4 h-4 text-primary" />,
                      },
                      {
                        label: "Expense Discipline",
                        val: selectedTrader.expenseDiscipline,
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
                            className="h-full bg-foreground rounded-full"
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
                    30-Day Financial Trend
                  </h3>
                </div>

                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={selectedTrader.thirtyDayData}
                      margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorRev"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="oklch(0.76 0.19 75)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="oklch(0.76 0.19 75)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        stroke="oklch(0.58 0.015 155)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                      />
                      <YAxis
                        stroke="oklch(0.58 0.015 155)"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(val) =>
                          `₦${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`
                        }
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "oklch(0.14 0.018 155)",
                          border: "1px solid oklch(0.28 0.025 155 / 0.6)",
                          borderRadius: "12px",
                          color: "var(--foreground)",
                          boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.5)",
                        }}
                        itemStyle={{
                          color: "var(--foreground)",
                          fontWeight: "bold",
                        }}
                        formatter={(val: number) => [
                          `₦${val.toLocaleString()}`,
                          "Revenue",
                        ]}
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
          <div className="glass-card rounded-2xl p-12 text-center border border-border/60 max-w-2xl mx-auto mt-12">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">
              No Trader Selected
            </p>
            <p className="text-sm text-muted-foreground">
              Search for a trader's wallet address above to view their financial
              identity and Ajo Score.
            </p>
          </div>
        )}
      </main>

      {showPaymentModal && selectedTrader && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() =>
              paymentStatus === "idle" && setShowPaymentModal(false)
            }
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
                    <span className="font-mono text-foreground">
                      Your Wallet
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To Trader</span>
                    <span className="font-mono text-foreground">
                      {selectedTrader.walletAddress}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handlePaymentConfirm}
                  disabled={paymentStatus === "processing"}
                  className="w-full btn-gold-shimmer text-accent-foreground py-4 rounded-xl font-bold text-base hover:opacity-95 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed mb-3 relative overflow-hidden flex justify-center items-center h-[56px]"
                >
                  {paymentStatus === "processing" ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-5 w-5 text-accent-foreground"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
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
