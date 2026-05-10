"use client";

import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { AjoScore } from "@/components/AjoScore";
import { usePrivy } from "@privy-io/react-auth";
import {
  Mic,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle2,
  Clock,
  BarChart2,
  Wallet,
  Loader2,
  LogIn,
  Zap,
} from "lucide-react";

/* ── types ─────────────────────────────────────────────────── */
interface DailyEntry {
  date: string;
  revenue: number;
  expenses: number;
  status: "pending" | "confirmed";
}

interface ScoreBreakdown {
  overall: number;
  consistency: number;
  revenueTrend: number;
  expenseDiscipline: number;
}

/* ── helpers ────────────────────────────────────────────────── */
function fmt(n: number) {
  return n >= 1000 ? `₦${(n / 1000).toFixed(1)}k` : `₦${n}`;
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/* ── component ──────────────────────────────────────────────── */
export default function TraderDashboard() {
  const { login, authenticated, ready, user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const [showRecorder, setShowRecorder] = useState(false);
  const [ajoScore, setAjoScore] = useState<ScoreBreakdown>({
    overall: 300,
    consistency: 0,
    revenueTrend: 0,
    expenseDiscipline: 0,
  });
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Fetch real data for the authenticated user
  const fetchData = async () => {
    if (!walletAddress) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/entries?address=${walletAddress}`);
      const data = await res.json();
      if (data.entries) setEntries(data.entries);
      if (data.score) setAjoScore(data.score);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (ready && authenticated && walletAddress) {
      fetchData();
    } else if (ready && !authenticated) {
      setLoading(false);
    }
  }, [ready, authenticated, walletAddress]);

  const handleRecordingSave = async (blob: Blob) => {
    if (!walletAddress) return;

    // 1. Transcribe audio
    const formData = new FormData();
    formData.append("audio", blob, "audio.webm");

    const transcribeRes = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });
    const { transcript } = await transcribeRes.json();

    // 2. Extract entities
    const extractRes = await fetch("/api/extract", {
      method: "POST",
      body: JSON.stringify({ transcript }),
    });
    const extractedData = await extractRes.json();

    // 3. Save entry to DB
    const entryRes = await fetch("/api/entries", {
      method: "POST",
      body: JSON.stringify({
        address: walletAddress,
        revenue: extractedData.revenue,
        expenses: extractedData.expenses,
        transcript,
      }),
    });
    const { entry, score } = await entryRes.json();

    // 4. Update local state
    setEntries((prev) => {
      const filtered = prev.filter((e) => e.date !== entry.date);
      return [entry, ...filtered].slice(0, 30);
    });
    setAjoScore(score);

    // 5. Trigger On-Chain Score Update
    fetch("/api/score", {
      method: "POST",
      body: JSON.stringify({
        traderAddress: walletAddress,
        entries: [entry, ...entries],
      }),
    }).catch(console.error);
  };

  const totalRevenue = (entries || []).reduce((s, e) => s + (e?.revenue || 0), 0);
  const totalExpenses = (entries || []).reduce((s, e) => s + (e?.expenses || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const confirmedDays = (entries || []).filter((e) => e?.status === "confirmed").length;

  if (!mounted || !ready) {
    return <div className="min-h-screen bg-background" />;
  }

  // Welcome Screen for Unauthenticated Users
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navigation />
        <main className="flex-1 flex flex-col items-center justify-center px-4 text-center max-w-lg mx-auto space-y-8">
          <div className="w-24 h-24 rounded-3xl bg-accent/15 border border-accent/30 flex items-center justify-center shadow-2xl shadow-accent/10">
            <Zap className="w-12 h-12 text-accent" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-foreground tracking-tight">
              Build Your Financial Identity
            </h1>
            <p className="text-muted-foreground text-lg">
              Record your daily sales with your voice and build a verifiable Ajo Score on Solana.
            </p>
          </div>
          <button
            onClick={login}
            className="w-full btn-gold-shimmer text-accent-foreground py-5 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:opacity-95 active:scale-[0.98] transition-all shadow-xl shadow-accent/20"
          >
            <LogIn className="w-6 h-6" />
            Get Started
          </button>
          <p className="text-xs text-muted-foreground">
            Sign in with your phone number or Google. No crypto knowledge required.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 pb-20 pt-6 space-y-6">
        {/* ── Wallet header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/40 border border-border/60 rounded-full px-3 py-1.5">
            <Wallet className="w-3.5 h-3.5" />
            <span className="font-mono">
              {walletAddress?.slice(0, 4)}…{walletAddress?.slice(-4)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Solana Devnet
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading your financial identity...
            </p>
          </div>
        ) : (
          <>
            {/* ── Score card ── */}
            <div className="glass-card rounded-2xl p-6 text-center relative overflow-hidden">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

              <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-4">
                Your Ajo Score
              </p>

              <div className="flex justify-center mb-4">
                <AjoScore score={ajoScore?.overall || 300} size="lg" animated />
              </div>

              <p className="text-sm text-muted-foreground">
                Financial Identity Score · Updated daily
              </p>

              <div className="flex justify-center gap-3 mt-4 flex-wrap">
                {[
                  { label: "Consistency", pct: ajoScore?.consistency || 0 },
                  { label: "Revenue Trend", pct: ajoScore?.revenueTrend || 0 },
                  { label: "Expense Discipline", pct: ajoScore?.expenseDiscipline || 0 },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center gap-1">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all duration-1000"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {item.label}
                    </span>
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
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  icon: <TrendingUp className="w-4 h-4 text-primary" />,
                  label: "30-Day Revenue",
                  value: fmt(totalRevenue),
                  color: "text-primary",
                },
                {
                  icon: <TrendingDown className="w-4 h-4 text-destructive" />,
                  label: "30-Day Expenses",
                  value: fmt(totalExpenses),
                  color: "text-destructive",
                },
                {
                  icon: <BarChart2 className="w-4 h-4 text-accent" />,
                  label: "Net Profit",
                  value: fmt(netProfit),
                  color: "text-accent",
                },
                {
                  icon: <CheckCircle2 className="w-4 h-4 text-primary" />,
                  label: "Days Confirmed",
                  value: `${confirmedDays} / ${entries.length || 0}`,
                  color: "text-foreground",
                },
              ].map((s) => (
                <div key={s.label} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {s.icon}
                    <span className="text-xs text-muted-foreground">
                      {s.label}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* ── Activity feed ── */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-border/60">
                <Calendar className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-foreground text-sm">
                  Activity Feed
                </h3>
                <span className="ml-auto text-xs text-muted-foreground">
                  {entries.length} entries
                </span>
              </div>

              {entries.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <Mic className="w-10 h-10 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="font-medium text-muted-foreground">
                    No entries yet. Record your first sale!
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/40 max-h-[520px] overflow-y-auto">
                  {entries.map((entry, idx) => {
                    if (!entry) return null;
                    const profit = (entry.revenue || 0) - (entry.expenses || 0);
                    const isUp = profit > 0;
                    return (
                      <div
                        key={idx}
                        className="px-5 py-4 hover:bg-muted/30 transition-colors group"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-[90px]">
                            <p className="text-xs font-semibold text-foreground">
                              {fmtDate(entry.date)}
                            </p>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-medium mt-1 ${
                                entry.status === "confirmed"
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {entry.status === "confirmed" ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {entry.status === "confirmed"
                                ? "Confirmed"
                                : "Pending"}
                            </span>
                          </div>

                          <div className="flex gap-5 flex-1">
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                Revenue
                              </p>
                              <p className="text-sm font-bold text-primary">
                                {fmt(entry.revenue)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-muted-foreground">
                                Expenses
                              </p>
                              <p className="text-sm font-bold text-muted-foreground">
                                {fmt(entry.expenses)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">
                              Net
                            </p>
                            <p
                              className={`text-sm font-bold ${
                                isUp ? "text-accent" : "text-destructive"
                              }`}
                            >
                              {isUp ? "+" : ""}
                              {fmt(profit)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {showRecorder && (
        <VoiceRecorder
          onClose={() => setShowRecorder(false)}
          onSave={handleRecordingSave}
        />
      )}
    </div>
  );
}
