import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { computeScore } from '@/lib/score'

/**
 * GET /api/lender/search?address=8xKp3mNa
 * Returns a trader's profile + score breakdown for lenders.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const address = searchParams.get('address')?.trim()

  if (!address) {
    return NextResponse.json({ error: 'address param required' }, { status: 400 })
  }

  try {
    // Match by prefix/suffix or full address (case-insensitive)
    const trader = await prisma.trader.findFirst({
      where: {
        walletAddress: {
          contains: address.replace('...', ''),
        },
      },
      include: {
        entries: {
          orderBy: { date: 'asc' },
          take: 30,
        },
      },
    })

    if (!trader) {
      return NextResponse.json({ error: 'Trader not found' }, { status: 404 })
    }

    const score = computeScore(trader.entries)

    // Build 30-day chart data (fill gaps with null)
    const chartData = trader.entries.map(e => ({
      date:    e.date,
      revenue: e.revenue,
    }))

    return NextResponse.json({
      walletAddress: trader.walletAddress,
      score,
      chartData,
      entryCount: trader.entries.length,
    })
  } catch (err) {
    console.error('[GET /api/lender/search]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
