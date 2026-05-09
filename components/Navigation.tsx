"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, Zap } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const isLender = pathname === "/lender";

  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 glass-card">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-black tracking-tight shrink-0"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent/15 border border-accent/30">
            <Zap className="w-4 h-4 text-accent" />
          </span>
          <span className="text-accent">Ajo</span>
        </Link>

        {/* Toggle */}
        <div className="flex items-center bg-muted/60 rounded-xl p-1 gap-1">
          <Link
            href="/"
            id="nav-trader-btn"
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              !isLender
                ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Trader
          </Link>
          <Link
            href="/lender"
            id="nav-lender-btn"
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isLender
                ? "bg-accent text-accent-foreground shadow-sm shadow-accent/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Lender
          </Link>
        </div>

        {/* Wallet pill */}
        <div className="hidden sm:flex items-center gap-2 bg-muted/40 border border-border/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground shrink-0">
          <Wallet className="w-3.5 h-3.5" />
          <span className="font-mono">8xKp…3mNa</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>
    </nav>
  );
}
