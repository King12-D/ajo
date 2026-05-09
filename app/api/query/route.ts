import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { lenderAddress, traderAddress } = await req.json()

    if (!lenderAddress || !traderAddress) {
      return NextResponse.json(
        { error: 'lenderAddress and traderAddress are required' },
        { status: 400 }
      )
    }

    // In production:
    // 1. We would check if the lender has actually sent 0.01 SOL to the trader
    //    by parsing the transaction signature they submit.
    // 2. OR we create a Solana Pay transaction request for the frontend to sign.

    console.log(`[Mock] Processing 0.01 SOL payment from ${lenderAddress} to ${traderAddress}`)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockTxSig = `${Math.random().toString(36).slice(2, 10).toUpperCase()}...${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    return NextResponse.json({
      success: true,
      txSignature: mockTxSig,
      message: 'Payment verified. Data unlocked.',
    })
  } catch (error) {
    console.error('[API Query Gate]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
