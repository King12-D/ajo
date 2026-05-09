import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * POST /api/lender/payment
 * Simulates a 0.01 SOL payment from lender to trader.
 * In production this would broadcast a real Solana transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const { lenderAddress, traderAddress } = await req.json()

    if (!lenderAddress || !traderAddress) {
      return NextResponse.json(
        { error: 'lenderAddress and traderAddress are required' },
        { status: 400 }
      )
    }

    // Simulate processing delay (replace with real Solana tx in production)
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Generate a mock transaction signature
    const mockTxSig = `${Math.random().toString(36).slice(2, 10).toUpperCase()}...${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    // Log the query to DB
    const query = await prisma.lenderQuery.create({
      data: {
        lenderAddress,
        traderAddress,
        amountSol:   0.01,
        txSignature: mockTxSig,
      },
    })

    return NextResponse.json({
      success:     true,
      txSignature: mockTxSig,
      queryId:     query.id,
      message:     'Payment sent. Score unlocked.',
    })
  } catch (err) {
    console.error('[POST /api/lender/payment]', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
