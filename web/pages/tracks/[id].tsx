"use client";

import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState, useCallback } from "react";
import {
  getTrackById,
  updateTrack,
  deleteTrack,
  Track,
} from "@/supabase/queries/tracks";
import { supabase } from "@/supabase/client";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { AppLayout } from "@/components/layout/AppLayout";
import AudioPlayerWave from "@/components/wave/AudioPlayerWave";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Copy,
  AtSign,
  Share2,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  HardDrive,
  Folder,
  RefreshCw,
  X,
  Disc3,
  Check,
  Lock,
  Music2,
} from "lucide-react";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
import { ID3Writer } from "browser-id3-writer";

function formatDuration(sec: number | null | undefined) {
  if (!sec || isNaN(sec)) return "–";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function TrackDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile, loading: authLoading } = useSessionProfile();

  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [duration, setDuration] = useState("–");

  const [editOpen, setEditOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [date, setDate] = useState("");
  const [isPublic, setPublic] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTrack = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const t = await getTrackById(id as string);
      setTrack(t);
      setTitle(t.title);
      setArtist(t.artist ?? "");
      setDate(t.track_date ?? "");
      setPublic(t.is_public);
      setTags(t.tags ?? []);

      if (t.duration_secs) {
        setDuration(formatDuration(t.duration_secs));
      } else {
        try {
          const audio = new Audio(t.file_url);
          const handler = () => {
            setDuration(formatDuration(audio.duration));
            audio.removeEventListener("loadedmetadata", handler);
          };
          audio.addEventListener("loadedmetadata", handler);
          audio.addEventListener("error", () => {
            /* ignore CORS / private‑bucket errors */
          });
        } catch {
          /* ignore */
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to load track");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && !authLoading) fetchTrack();
  }, [id, authLoading, fetchTrack]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const onCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success(
      "Link copied! Paste it to your friends so they can listen to this track!",
    );
  };
  const onEmail = () =>
    window.open(
      `mailto:?subject=${encodeURIComponent(
        track?.title ?? "",
      )}&body=${encodeURIComponent(shareUrl)}`,
      "_self",
    );
  const onNativeShare = () => {
    // @ts-ignore
    if (navigator.share) {
      navigator
        .share({
          title: track?.title,
          text: track?.artist ?? "",
          url: shareUrl,
        })
        .catch(() => {});
    }
  };

  const openEdit = () => {
    setCoverFile(null);
    setEditOpen(true);
  };

  const addTag = (t: string) => {
    const tag = t.trim();
    if (tag && !tags.includes(tag)) setTags((p) => [...p, tag]);
  };
  const removeTag = (t: string) => setTags((p) => p.filter((x) => x !== t));
  const onTagKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
      setNewTag("");
    }
  };

  const onSave = async () => {
    if (!track) return;
    setSaving(true);
    let cover = track.cover_art_url;
    if (coverFile) {
      const path = `tracks/${track.id}/cover-${uuid()}`;
      const { error } = await supabase.storage
        .from("covers")
        .upload(path, coverFile, { upsert: true });
      if (error) toast.error(error.message);
      else
        cover = supabase.storage.from("covers").getPublicUrl(path)
          .data.publicUrl;
    }
    try {
      await updateTrack({
        id: track.id,
        title,
        artist: artist || null,
        track_date: date || null,
        cover_art_url: cover,
        is_public: isPublic,
        tags,
      });
      toast.success("Track updated");
      setEditOpen(false);
      fetchTrack();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!track) return;
    await deleteTrack(track.id);
    toast.success("Track deleted");
    router.push("/dashboard");
  };

  const isOwner = profile && track && profile.id === track.owner_id;
  const allowed = track && (track.is_public || isOwner);

  const onDownload = async () => {
    if (!track) return;
    try {
      const audioRes = await fetch(track.file_url);
      if (!audioRes.ok)
        throw new Error("Unable to fetch audio file for download");
      const audioBuf = await audioRes.arrayBuffer();
      const writer = new ID3Writer(audioBuf);

      writer
        .setFrame("TIT2", title || track.title)
        .setFrame("TPE1", [artist || track.artist || ""])
        .setFrame("TALB", track.album_id ?? "")
        // @ts-ignore
        .setFrame("TYER", (date || track.track_date || "").slice(0, 4))
        .setFrame("COMM", {
          description: "Comment",
          text: "Downloaded from Audio Library",
        });

      if (track.cover_art_url) {
        const imgRes = await fetch(track.cover_art_url);
        if (imgRes.ok) {
          const imgBuf = await imgRes.arrayBuffer();
          // @ts-ignore
          writer.setFrame("APIC", {
            type: 3,
            data: new Uint8Array(imgBuf),
            description: "Cover",
          });
        }
      }

      writer.addTag();
      const blob = writer.getBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title || track.title}.mp3`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || "Download failed");
    }
  };

  return (
    <>
      <Head>
        <title>{track ? `${track.title} — ${track.artist}` : "Loading…"}</title>
      </Head>

      <AppLayout>
        {loading || authLoading ? (
          <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        ) : !allowed ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
            <Lock className="h-12 w-12" />
            <p className="text-lg font-semibold">
              You don’t have access to this track.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
            <div className="relative rounded-2xl overflow-hidden">
              {track!.cover_art_url ? (
                <>
                  <img
                    src={track!.cover_art_url}
                    alt={track!.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-secondary/30 to-muted/30 flex items-center justify-center rounded-2xl">
                  <Disc3 className="text-secondary/60 w-20 h-20" />
                </div>
              )}

              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4" /> Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onCopy}>
                      <Copy className="h-4 w-4 mr-2" /> Copy link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onEmail}>
                      <AtSign className="h-4 w-4 mr-2" /> Email
                    </DropdownMenuItem>
                    {/* @ts-ignore */}
                    {navigator.share && (
                      <DropdownMenuItem onClick={onNativeShare}>
                        <Share2 className="h-4 w-4 mr-2" /> Native…
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  size="icon"
                  variant="outline"
                  onClick={onDownload}
                  title="Download MP3"
                >
                  <Music2 className="h-4 w-4" />
                </Button>

                {isOwner && (
                  <Button size="icon" variant="outline" onClick={openEdit}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="absolute bottom-4 left-4 text-white z-10">
                <h1 className="text-4xl font-bold drop-shadow-lg">
                  {track!.title}
                </h1>
                <p className="text-lg drop-shadow-md">{track!.artist}</p>
              </div>
            </div>

            <div className="w-full rounded-md border border-border overflow-hidden">
              <AudioPlayerWave src={track!.file_url} />
            </div>

            <div className="rounded-lg border border-border bg-card/70 p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      Release Date:
                    </span>
                    <span>
                      {track!.track_date
                        ? new Date(track!.track_date).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      Duration:
                    </span>
                    <span>{duration}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <HardDrive className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      File Size:
                    </span>
                    <span>
                      {track!.file_size
                        ? `${(track!.file_size / 1024 / 1024).toFixed(2)} MB`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Folder className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">Album:</span>
                    <span>{track!.album_id ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 shrink-0" />
                    <span className="font-medium text-foreground">
                      Last Updated:
                    </span>
                    <span>{new Date(track!.updated_at).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Tags
                  </h3>
                  {track!.tags?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {track!.tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 bg-primary text-primary-foreground rounded-full text-xs"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No tags</p>
                  )}
                </div>
              </div>
              {isOwner && (
                <div className="flex justify-end">
                  <Button size="sm" variant="destructive" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-1" /> Delete Track
                  </Button>
                </div>
              )}
            </div>

            {isOwner && (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Track</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="artist">Artist</Label>
                      <Input
                        id="artist"
                        value={artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Release Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Cover Art</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setCoverFile(e.target.files?.[0] || null)
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2 mt-2">
                        {tags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            className="flex items-center gap-1 px-2 py-1 bg-secondary/20 rounded-full text-xs"
                            onClick={() => removeTag(t)}
                          >
                            {t}
                            <X className="h-3 w-3" />
                          </button>
                        ))}
                      </div>
                      <Input
                        placeholder="New tag…"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={onTagKey}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Public</Label>
                      <Switch checked={isPublic} onCheckedChange={setPublic} />
                    </div>
                    <Button
                      onClick={onSave}
                      className="w-full"
                      disabled={saving}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      {saving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(false)}
                    >
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </AppLayout>
    </>
  );
}
