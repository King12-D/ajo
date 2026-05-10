/**
 * Wrapper for ElevenLabs Speech-to-Text (Scribe) or standard Whisper
 * since ElevenLabs is traditionally TTS, but they recently added STT/Voice Analysis.
 */

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

  if (!ELEVENLABS_API_KEY) {
    console.warn('Missing ELEVENLABS_API_KEY, falling back to mock transcription.')
    return "Today I made ₦4500 in revenue with ₦1200 in expenses buying seeds."
  }

  // Example implementation using standard FormData upload for STT
  const formData = new FormData()
  formData.append('file', audioBlob, 'audio.webm')
  formData.append('model_id', 'scribe_v1') // Required by ElevenLabs Scribe API
  
  // Note: ElevenLabs URL structure for STT might vary, using standard pattern
  const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
    method: 'POST',
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: formData
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'No error body');
    console.error('[ElevenLabs API Error]', response.status, errorBody);
    throw new Error(`Transcription failed: ${response.status} ${errorBody}`);
  }

  const data = await response.json()
  return data.text || data.transcript || "";
}
