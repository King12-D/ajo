'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()
  const isLender = pathname === '/lender'

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-accent">
          Ajo
        </Link>

        <div className="flex gap-2">
          <Link
            href="/"
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              !isLender
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Trader
          </Link>
          <Link
            href="/lender"
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isLender
                ? 'bg-accent text-accent-foreground'
                : 'bg-muted text-foreground hover:bg-muted/80'
            }`}
          >
            Lender
          </Link>
        </div>
      </div>
    </nav>
  )
}
