'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, Square, Play } from 'lucide-react'

interface VoiceRecorderProps {
  onClose: () => void
  onSave: (audioBlob: Blob, transcript: string) => void
}

export function VoiceRecorder({ onClose, onSave }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [recordingTime, setRecordingTime] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' })
        const url = URL.createObjectURL(audioBlob)
        setAudioURL(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSave = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' })
      // Mock transcript - in production, use speech-to-text API
      const transcript = `Today I made ${Math.floor(Math.random() * 5000) + 1000} in revenue with ${Math.floor(Math.random() * 3000)} in expenses.`
      onSave(audioBlob, transcript)
      onClose()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg p-8 w-full max-w-md shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Record Your Day</h2>

        <div className="flex justify-center mb-8">
          <div className="text-5xl font-bold text-accent">{formatTime(recordingTime)}</div>
        </div>

        {!audioURL ? (
          <>
            {!isRecording && (
              <button
                onClick={startRecording}
                className="w-full bg-accent text-accent-foreground py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <Mic className="w-6 h-6" />
                Start Recording
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="w-full bg-destructive text-destructive-foreground py-4 rounded-lg font-bold text-lg hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 mb-4"
              >
                <Square className="w-6 h-6" />
                Stop Recording
              </button>
            )}
          </>
        ) : (
          <>
            <div className="bg-muted rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2 text-foreground">
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Preview</span>
              </div>
              <audio src={audioURL} controls className="w-full" />
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-accent text-accent-foreground py-3 rounded-lg font-bold hover:bg-accent/90 transition-colors mb-2"
            >
              Save Entry
            </button>
          </>
        )}

        <button
          onClick={onClose}
          className="w-full bg-muted text-foreground py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
        >
          {audioURL ? 'Cancel' : 'Close'}
        </button>
      </div>
    </div>
  )
}
