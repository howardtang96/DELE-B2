"use client";

import * as React from "react";
import { Play, Square, Volume2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Exam-style listening player. Uses a stored audio file when `audioUrl` is given,
 * otherwise falls back to the browser's Spanish text-to-speech so the mode works
 * before real audio exists. Enforces a max number of plays.
 */
export function AudioPlayer({
  scriptEs,
  audioUrl,
  maxPlays,
  onFirstPlay,
}: {
  scriptEs: string;
  audioUrl?: string;
  maxPlays: number;
  onFirstPlay?: () => void;
}) {
  const [plays, setPlays] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [ttsAvailable, setTtsAvailable] = React.useState(true);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    // Cancel any in-flight speech when the component unmounts.
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const remaining = maxPlays - plays;

  function start() {
    if (remaining <= 0 || playing) return;

    if (audioUrl && audioRef.current) {
      if (plays === 0) onFirstPlay?.();
      setPlays((p) => p + 1);
      setPlaying(true);
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      return;
    }

    // TTS fallback — detect support at click time (avoids SSR/hydration issues).
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setTtsAvailable(false);
      return;
    }
    if (plays === 0) onFirstPlay?.();
    setPlays((p) => p + 1);
    setPlaying(true);
    const u = new SpeechSynthesisUtterance(scriptEs);
    u.lang = "es-ES";
    u.rate = 0.95;
    u.onend = () => setPlaying(false);
    u.onerror = () => setPlaying(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  function stop() {
    setPlaying(false);
    if (audioUrl && audioRef.current) {
      audioRef.current.pause();
    } else if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }

  return (
    <div className="rounded-[var(--radius-app)] border border-border bg-surface p-5">
      {audioUrl ? (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setPlaying(false)}
          preload="none"
        />
      ) : null}

      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Volume2 className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Audio</p>
          <p className="text-xs text-muted-foreground">
            仲可以聽 {Math.max(0, remaining)} 次 / 共 {maxPlays} 次
          </p>
        </div>
        {playing ? (
          <Button variant="outline" size="icon" aria-label="Stop" onClick={stop}>
            <Square className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            aria-label="Play"
            onClick={start}
            disabled={remaining <= 0}
          >
            <Play className="h-5 w-5" />
          </Button>
        )}
      </div>

      {!audioUrl && !ttsAvailable ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-warning">
          <AlertCircle className="h-3.5 w-3.5" />
          呢個瀏覽器唔支援語音播放；可以睇下面嘅文字稿。
        </p>
      ) : null}
    </div>
  );
}
