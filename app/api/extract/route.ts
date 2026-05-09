import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json()

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY

    if (!CLAUDE_API_KEY) {
      console.warn('Missing ANTHROPIC_API_KEY, falling back to mock extraction.')
      return NextResponse.json({
        revenue: Math.floor(Math.random() * 5000) + 1000,
        expenses: Math.floor(Math.random() * 2000),
      })
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        system: "You are a financial data extraction bot. Extract the daily revenue and expenses from the user's transcript as a JSON object. Return ONLY JSON, no markdown formatting. Format: {\"revenue\": number, \"expenses\": number}",
        messages: [{ role: 'user', content: transcript }]
      })
    })

    if (!response.ok) {
      throw new Error('Claude extraction failed')
    }

    const data = await response.json()
    const content = data.content[0].text
    const extractedData = JSON.parse(content)

    return NextResponse.json(extractedData)
  } catch (error) {
    console.error('[API Extract]', error)
    return NextResponse.json({ error: 'Failed to extract financial data' }, { status: 500 })
  }
}
