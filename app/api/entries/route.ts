import { NextRequest, NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { computeScore } from '@/lib/score'

export const dynamic = 'force-dynamic'

/** GET /api/entries — fetch all entries + live score for a specific user */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const walletAddress = searchParams.get('address')

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    // Get or create trader (Registration happens here)
    const trader = await getPrisma().trader.upsert({
      where: { walletAddress },
      create: { walletAddress },
      update: {},
      include: {
        entries: {
          orderBy: { date: 'desc' },
          take: 30,
        },
      },
    })

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

/** POST /api/entries — save a new daily entry for a specific user */
export async function POST(req: NextRequest) {
  try {
    const { address, revenue, expenses, transcript } = await req.json()

    if (!address) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 })
    }

    if (typeof revenue !== 'number' || typeof expenses !== 'number') {
      return NextResponse.json({ error: 'revenue and expenses are required numbers' }, { status: 400 })
    }

    // Sync user with DB
    const trader = await getPrisma().trader.upsert({
      where:  { walletAddress: address },
      create: { walletAddress: address },
      update: {},
    })

    const today = new Date().toISOString().split('T')[0]

    // Save entry
    const entry = await getPrisma().dailyEntry.upsert({
      where: { traderId_date: { traderId: trader.id, date: today } },
      create: { traderId: trader.id, date: today, revenue, expenses, transcript, status: 'pending' },
      update: { revenue, expenses, transcript },
    })

    // Compute updated score
    const allEntries = await getPrisma().dailyEntry.findMany({
      where:   { traderId: trader.id },
      orderBy: { date: 'desc' },
      take:    30,
    })
    const score = computeScore(allEntries)

    // Simulate on-chain confirmation
    setTimeout(async () => {
      await getPrisma().dailyEntry.update({
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
