// pages/library.tsx
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getTracksByUser, updateTrack, Track } from "@/supabase/queries/tracks";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrackCard } from "@/components/tracks/TrackCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import JSZip from "jszip";
import { supabase } from "@/supabase/client";
import { v4 as uuid } from "uuid";
import { CheckSquare, Square, Image, DownloadCloud } from "lucide-react";
import Head from "next/head";

export default function LibraryPage() {
  const router = useRouter();
  const { profile, loading } = useSessionProfile();
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  // Redirect to login only after we've confirmed the user is not authenticated
  useEffect(() => {
    if (!loading && profile === null) {
      router.replace("/login");
    }
  }, [profile, loading, router]);

  const load = async () => {
    if (!profile) return;
    setTracks(null);
    const data = await getTracksByUser(profile.id);
    setTracks(data);
    setSelected(new Set());
  };

  // Once we have a profile, fetch their tracks
  useEffect(() => {
    if (profile) {
      load();
    }
  }, [profile]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected =
    !!tracks && tracks.length > 0 && selected.size === tracks.length;

  const exportZip = async () => {
    if (!tracks || selected.size === 0) return;
    const zip = new JSZip();
    const chosen = tracks.filter((t) => selected.has(t.id));
    for (const t of chosen) {
      const buf = await fetch(t.file_url).then((r) => r.arrayBuffer());
      zip.file(`${t.title}.mp3`, buf);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tracks.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBatchCover = async () => {
    if (!batchFile || !profile) return;
    setBatchLoading(true);
    for (const trackId of selected) {
      const path = `${profile.id}/batch-covers/${uuid()}-${batchFile.name}`;
      const { error: upErr } = await supabase.storage
        .from("covers")
        .upload(path, batchFile, { upsert: true });
      if (upErr) {
        toast.error(upErr.message);
        continue;
      }
      const publicUrl = supabase.storage.from("covers").getPublicUrl(path)
        .data.publicUrl!;
      try {
        await updateTrack({ id: trackId, cover_art_url: publicUrl });
      } catch {
        // ignore per-track errors
      }
    }
    toast.success("Cover art updated for selected tracks");
    setBatchLoading(false);
    setBatchOpen(false);
    setBatchFile(null);
    load();
  };

  return (
    <>
      <Head>
        <title>Your Tracks - Audio Library</title>
        <meta
          name="description"
          content="Manage your audio tracks, edit metadata, and batch update cover art."
        />
      </Head>
      <AppLayout>
        <div className="mx-auto max-w-7xl px-6 py-10">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            {tracks === null ? (
              <>
                <Skeleton className="h-8 w-48" />
                <div className="ml-auto flex gap-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold">Your Tracks</h1>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (allSelected) setSelected(new Set());
                      else setSelected(new Set(tracks.map((t) => t.id)));
                    }}
                  >
                    {allSelected ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}{" "}
                    {allSelected ? "Unselect All" : "Select All"}
                  </Button>

                  <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={selected.size === 0}
                      >
                        <Image className="h-4 w-4" /> Batch Cover
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-card/80 backdrop-blur-lg rounded-2xl p-6">
                      <DialogHeader>
                        <DialogTitle>Batch Edit Cover Art</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {selected.size} track
                          {selected.size > 1 ? "s" : ""} selected
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            setBatchFile(e.target.files?.[0] || null)
                          }
                        />
                        {batchFile && (
                          <img
                            src={URL.createObjectURL(batchFile)}
                            className="mt-2 h-40 w-full rounded object-cover border"
                          />
                        )}
                      </div>
                      <DialogFooter className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBatchOpen(false);
                            setBatchFile(null);
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleBatchCover}
                          disabled={!batchFile || batchLoading}
                        >
                          {batchLoading ? "Applying..." : "Apply"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={selected.size === 0}
                    onClick={exportZip}
                  >
                    <DownloadCloud className="h-4 w-4" /> Download ZIP
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Tracks Grid */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {tracks === null
              ? Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-lg" />
                ))
              : tracks.map((t) => (
                  <div key={t.id} className="relative">
                    <div className="absolute left-3 top-2 z-10">
                      <Checkbox
                        checked={selected.has(t.id)}
                        onCheckedChange={() => toggle(t.id)}
                        className="h-5 w-5 border-border data-[state=checked]:bg-primary"
                      />
                    </div>
                    <TrackCard track={t} onChanged={load} />
                  </div>
                ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
