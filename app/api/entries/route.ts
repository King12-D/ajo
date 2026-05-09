import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { computeScore } from '@/lib/score'

const WALLET = '8xKp...3mNa' // trader's wallet (mock — replace with real auth later)

/** GET /api/entries — fetch all entries + live score */
export async function GET() {
  try {
    let trader = await prisma.trader.findUnique({
      where: { walletAddress: WALLET },
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

    if (!trader) {
      // Auto-create trader on first visit
      trader = await prisma.trader.create({
        data: { walletAddress: WALLET },
        include: { entries: true },
      })
    }

    const score = computeScore(trader.entries)

    return NextResponse.json({
      entries: trader.entries,
      score,
    })
  } catch (err) {
    console.error('[GET /api/entries]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

/** POST /api/entries — save a new daily entry */
export async function POST(req: NextRequest) {
  try {
    const { revenue, expenses, transcript } = await req.json()

    if (typeof revenue !== 'number' || typeof expenses !== 'number') {
      return NextResponse.json({ error: 'revenue and expenses are required numbers' }, { status: 400 })
    }

    // Upsert trader
    const trader = await prisma.trader.upsert({
      where:  { walletAddress: WALLET },
      create: { walletAddress: WALLET },
      update: {},
    })

    const today = new Date().toISOString().split('T')[0]

    // Upsert entry for today (only one per day)
    const entry = await prisma.dailyEntry.upsert({
      where: { traderId_date: { traderId: trader.id, date: today } },
      create: { traderId: trader.id, date: today, revenue, expenses, transcript, status: 'pending' },
      update: { revenue, expenses, transcript },
    })

    // Compute updated score
    const allEntries = await prisma.dailyEntry.findMany({
      where:   { traderId: trader.id },
      orderBy: { date: 'desc' },
      take:    30,
    })
    const score = computeScore(allEntries)

    // After 30 seconds auto-confirm today's entry (simulate on-chain confirmation)
    // In production this would be a webhook/cron
    setTimeout(async () => {
      await prisma.dailyEntry.update({
        where: { id: entry.id },
        data:  { status: 'confirmed' },
      }).catch(() => {})
    }, 30_000)

    return NextResponse.json({ entry, score }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/entries]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
