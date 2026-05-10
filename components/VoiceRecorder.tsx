"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, X, CheckCircle2, Loader2 } from "lucide-react";

interface VoiceRecorderProps {
  onClose: () => void;
  onSave: (audioBlob: Blob) => Promise<void>;
}

const NUM_BARS = 28;

function WaveformBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-16">
      {Array.from({ length: NUM_BARS }).map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            height: active ? `${Math.random() * 60 + 10}%` : "20%",
            animationDelay: `${(i * 0.08) % 0.8}s`,
            animationDuration: active ? `${0.5 + (i % 5) * 0.1}s` : "0s",
            opacity: active ? 1 : 0.35,
            transition: "height 0.15s ease, opacity 0.3s",
          }}
        />
      ))}
    </div>
  );
}

export function VoiceRecorder({ onClose, onSave }: VoiceRecorderProps) {
  const [phase, setPhase] = useState<
    "idle" | "recording" | "preview" | "processing" | "saved"
  >("idle");
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* timer */
  useEffect(() => {
    if (phase === "recording") {
      timerRef.current = setInterval(
        () => setRecordingTime((t) => t + 1),
        1000,
      );
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioURL(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        setPhase("preview");
      };

      mr.start();
      setRecordingTime(0);
      setPhase("recording");
    } catch {
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSave = async () => {
    if (!audioChunksRef.current.length) return;
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    setPhase("processing");
    try {
      await onSave(blob);
      setPhase("saved");
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      alert("Something went wrong processing your voice entry.");
      setPhase("preview");
    }
  };

  const reRecord = () => {
    setAudioURL(null);
    setIsPlaying(false);
    setRecordingTime(0);
    setPhase("idle");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={phase === "processing" ? undefined : onClose}
      />

      {/* Sheet */}
      <div className="relative z-10 w-full sm:max-w-md glass-card rounded-t-3xl sm:rounded-2xl p-8 shadow-2xl animate-fade-in-up">
        {/* Close */}
        {phase !== "processing" && (
          <button
            id="voice-recorder-close"
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ── IDLE / RECORDING ── */}
        {(phase === "idle" || phase === "recording") && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Record Your Day
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Speak naturally — revenue, expenses, highlights
              </p>
            </div>

            {/* Timer */}
            <div className="text-center mb-4">
              <span
                className={`text-4xl font-mono font-bold tabular-nums ${
                  phase === "recording"
                    ? "text-accent"
                    : "text-muted-foreground/40"
                }`}
              >
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Waveform */}
            <div className="mb-6">
              <WaveformBars active={phase === "recording"} />
            </div>

            {/* Mic button */}
            <div className="flex justify-center mb-6">
              {phase === "idle" ? (
                <button
                  id="voice-start-btn"
                  onClick={startRecording}
                  className="relative flex items-center justify-center w-20 h-20 rounded-full btn-gold-shimmer shadow-lg shadow-accent/30 hover:scale-105 transition-transform"
                >
                  <Mic className="w-8 h-8 text-accent-foreground" />
                  <span className="absolute inset-0 rounded-full animate-pulse-ring border-2 border-accent/50" />
                </button>
              ) : (
                <button
                  id="voice-stop-btn"
                  onClick={stopRecording}
                  className="flex items-center justify-center w-20 h-20 rounded-full bg-destructive hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/30"
                >
                  <Square className="w-8 h-8 text-destructive-foreground fill-current" />
                </button>
              )}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              {phase === "idle"
                ? "Tap the mic to start"
                : "Tap to stop recording"}
            </p>
          </>
        )}

        {/* ── PREVIEW ── */}
        {phase === "preview" && audioURL && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-foreground">
                Preview Recording
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Duration: {formatTime(recordingTime)}
              </p>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={audioURL}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />

            {/* Play/pause visual */}
            <div className="flex justify-center mb-6">
              <button
                id="voice-play-btn"
                onClick={togglePlay}
                className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary hover:bg-primary/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-primary" />
                ) : (
                  <Play className="w-8 h-8 text-primary fill-current ml-1" />
                )}
              </button>
            </div>

            <WaveformBars active={isPlaying} />

            <div className="mt-6 flex flex-col gap-2">
              <button
                id="voice-save-btn"
                onClick={handleSave}
                className="w-full btn-gold-shimmer text-accent-foreground py-3.5 rounded-xl font-bold text-base hover:opacity-90 transition-opacity"
              >
                Save Entry
              </button>
              <button
                id="voice-rerecord-btn"
                onClick={reRecord}
                className="w-full bg-muted text-foreground py-3 rounded-xl font-medium hover:bg-muted/80 transition-colors text-sm"
              >
                Record Again
              </button>
            </div>
          </>
        )}

        {/* ── PROCESSING ── */}
        {phase === "processing" && (
          <div className="flex flex-col items-center py-12 gap-5 animate-pulse">
            <Loader2 className="w-16 h-16 text-accent animate-spin" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Analyzing Audio</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Using AI to extract revenue & expenses...
              </p>
            </div>
          </div>
        )}

        {/* ── SAVED ── */}
        {phase === "saved" && (
          <div className="flex flex-col items-center py-12 gap-4 animate-fade-in-up">
            <CheckCircle2 className="w-16 h-16 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Entry Saved!</h2>
            <p className="text-sm text-muted-foreground text-center">
              Your Ajo Score is being updated on-chain…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
