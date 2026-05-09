import { NextRequest, NextResponse } from 'next/server'
import { transcribeAudio } from '@/lib/elevenlabs'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const text = await transcribeAudio(audioFile)
    return NextResponse.json({ transcript: text })
  } catch (error) {
    console.error('[API Transcribe]', error)
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 })
  }
}
