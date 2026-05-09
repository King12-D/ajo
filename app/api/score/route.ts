import { NextRequest, NextResponse } from 'next/server'
import { computeScore } from '@/lib/score'
import { updateScoreOnChain } from '@/lib/solana'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { traderAddress, entries } = await req.json()

    if (!traderAddress || !entries || !Array.isArray(entries)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // 1. Compute off-chain
    const breakdown = computeScore(entries)

    // 2. Commit to Solana Smart Contract
    const txSig = await updateScoreOnChain(
      traderAddress,
      breakdown.overall,
      breakdown.consistency,
      breakdown.revenueTrend,
      breakdown.expenseDiscipline
    )

    return NextResponse.json({ 
      success: true, 
      score: breakdown,
      txSignature: txSig 
    })
  } catch (error) {
    console.error('[API Score]', error)
    return NextResponse.json({ error: 'Failed to compute or commit score' }, { status: 500 })
  }
}
