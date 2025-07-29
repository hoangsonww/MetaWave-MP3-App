"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Track } from "@/supabase/queries/tracks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, HardDrive, Folder, RefreshCw } from "lucide-react";
import AudioPlayerWave from "@/components/wave/AudioPlayerWave";

function formatDuration(sec: number | null | undefined) {
  if (!sec || isNaN(sec)) return "–";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TrackCard({
  track,
  onChanged,
}: {
  track: Track;
  onChanged: () => void;
}) {
  const router = useRouter();
  const [duration, setDuration] = useState("–");

  useEffect(() => {
    const audio = new Audio(track.file_url);
    const handler = () => setDuration(formatDuration(audio.duration));
    audio.addEventListener("loadedmetadata", handler);
    return () => {
      audio.removeEventListener("loadedmetadata", handler);
      audio.pause();
      audio.src = "";
    };
  }, [track.file_url]);

  return (
    <div
      onClick={() => router.push(`/tracks/${track.id}`)}
      className="block no-underline"
    >
      <Card
        style={{ width: 300 }}
        className="group overflow-hidden border-border/60 bg-card/70 backdrop-blur transition hover:shadow-lg hover:border-primary cursor-pointer"
      >
        {/* cover */}
        <CardHeader className="p-0 mt-2">
          <div className="relative">
            <div className="aspect-square w-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
              {track.cover_art_url ? (
                <img
                  src={track.cover_art_url}
                  alt={track.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm text-muted-foreground">No Cover</span>
              )}
            </div>
            <div className="absolute right-2 top-2 flex gap-1">
              <Badge variant={track.is_public ? "default" : "secondary"}>
                {track.is_public ? "Public" : "Private"}
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* body */}
        <CardContent className="space-y-3 pt-0 p-4">
          <h3 className="font-semibold leading-tight">{track.title}</h3>
          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
            {track.artist || "—"}
          </p>

          {/* metadata */}
          <div className="mt-2 space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {track.track_date
                  ? new Date(track.track_date).toLocaleDateString()
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <HardDrive className="h-4 w-4" />
              <span>
                {track.file_size
                  ? (track.file_size / 1024 / 1024).toFixed(2) + " MB"
                  : "—"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Folder className="h-4 w-4" />
              <span>{track.album_id ?? "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              <span>{new Date(track.updated_at).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(track.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* waveform - stop propagation so play clicks don't bubble */}
          <div
            className="rounded-md border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <AudioPlayerWave src={track.file_url} small />
          </div>

          {/* tags */}
          {track.tags?.length ? (
            <div className="mt-2 flex flex-wrap gap-1">
              {track.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer bg-primary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
