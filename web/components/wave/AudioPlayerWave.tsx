"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";

export default function AudioPlayerWave({
  src,
  small,
}: {
  src: string;
  small?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const ws = useRef<WaveSurfer | null>(null);
  const { resolvedTheme } = useTheme();
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // swallow AbortError from Wavesurfer XHR aborts
    const onUnhandled = (e: PromiseRejectionEvent) => {
      if (e.reason?.name === "AbortError") e.preventDefault();
    };
    window.addEventListener("unhandledrejection", onUnhandled);

    // destroy any existing instance
    ws.current?.destroy();

    // read computed CSS variables for actual colors
    const styles = getComputedStyle(document.documentElement);
    const wave1 = styles.getPropertyValue("--primary").trim();
    const wave2 = styles.getPropertyValue("--primary-foreground").trim();
    const prog1 = styles.getPropertyValue("--accent").trim();
    const prog2 = styles.getPropertyValue("--accent-foreground").trim();

    // create new Wavesurfer with gradient stops
    ws.current = WaveSurfer.create({
      container: containerRef.current,
      barWidth: 2,
      cursorWidth: 1,
      height: small ? 60 : 100,
      waveColor: [wave1, wave2],
      progressColor: [prog1, prog2],
    });

    ws.current.load(src);
    ws.current.on("ready", () => setReady(true));
    ws.current.on("finish", () => setPlaying(false));

    return () => {
      try {
        ws.current?.stop();
        ws.current?.empty();
        ws.current?.unAll();
        ws.current?.destroy();
      } catch {
        // ignore cleanup errors
      }
      ws.current = null;
      window.removeEventListener("unhandledrejection", onUnhandled);
    };
  }, [src, small, resolvedTheme]);

  const toggle = () => {
    if (!ready || !ws.current) return;
    ws.current.playPause();
    setPlaying(ws.current.isPlaying());
  };

  return (
    <div className="flex items-center gap-3 p-2">
      <Button size="sm" variant="outline" onClick={toggle} disabled={!ready}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <div className="flex-1" ref={containerRef} />
    </div>
  );
}
