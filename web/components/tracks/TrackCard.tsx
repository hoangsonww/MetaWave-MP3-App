"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/supabase/client";
import { v4 as uuid } from "uuid";
import { Track, updateTrack, deleteTrack } from "@/supabase/queries/tracks";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  HardDrive,
  Folder,
  RefreshCw,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AudioPlayerWave from "@/components/wave/AudioPlayerWave";
import { toast } from "sonner";

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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist || "");
  const [date, setDate] = useState(track.track_date || "");
  const [isPublic, setPublic] = useState(track.is_public);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [duration, setDuration] = useState<string>("–");

  // --- TAGS STATE ---
  const [modalTags, setModalTags] = useState<string[]>(track.tags ?? []);
  const [newTag, setNewTag] = useState("");

  // reset modalTags whenever you open
  useEffect(() => {
    if (open) {
      setModalTags(track.tags ?? []);
      setNewTag("");
    }
  }, [open, track.tags]);

  useEffect(() => {
    const audio = new Audio(track.file_url);
    const onMeta = () => setDuration(formatDuration(audio.duration));
    audio.addEventListener("loadedmetadata", onMeta);
    return () => {
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.pause();
      audio.src = "";
    };
  }, [track.file_url]);

  const save = async () => {
    setSaving(true);
    let coverUrl = track.cover_art_url || null;
    if (coverFile) {
      const path = `${track.owner_id}/covers/${uuid()}-${coverFile.name}`;
      const { error: covErr } = await supabase.storage
        .from("covers")
        .upload(path, coverFile, { upsert: true });
      if (covErr) {
        toast.error(covErr.message);
      } else {
        coverUrl = supabase.storage.from("covers").getPublicUrl(path)
          .data.publicUrl;
      }
    }

    try {
      await updateTrack({
        id: track.id,
        title,
        artist,
        track_date: date || null,
        cover_art_url: coverUrl,
        is_public: isPublic,
        tags: modalTags,
      });
      toast.success("Track updated");
      setOpen(false);
      onChanged();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTrack(track.id);
      toast.success("Track deleted");
      onChanged();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Deletion failed");
    }
  };

  // tag helpers
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !modalTags.includes(t)) {
      setModalTags([...modalTags, t]);
    }
  };
  const removeTag = (tag: string) => {
    setModalTags(modalTags.filter((t) => t !== tag));
  };
  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(newTag);
      setNewTag("");
    }
  };

  return (
    <Card
      className="group overflow-hidden border-border/60 bg-card/70 backdrop-blur transition hover:shadow-lg hover:border-primary"
      style={{ width: 300 }}
    >
      <CardHeader className="p-0 mt-2">
        <div className="relative">
          <div className="aspect-square w-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
            {track.cover_art_url ? (
              <img
                src={track.cover_art_url}
                className="h-full w-full object-cover"
                loading="lazy"
                alt={track.title}
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

      <CardContent className="space-y-3 pt-0 p-4">
        {/* Title & Artist */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold leading-tight">{track.title}</h3>
            <p className="text-xs text-muted-foreground truncate max-w-[150px]">
              {track.artist || " - "}
            </p>

            {/* Metadata Section */}
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {track.track_date
                    ? new Date(track.track_date).toLocaleDateString()
                    : "–"}
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
                    : "–"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Folder className="h-4 w-4" />
                <span>{track.album_id ?? " - "}</span>
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
          </div>

          {/* Edit / Delete Buttons */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
            {/* Track edit */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Track</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="track-title">Title</Label>
                    <Input
                      id="track-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="track-artist">Artist</Label>
                    <Input
                      id="track-artist"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="track-date">Release Date</Label>
                    <Input
                      id="track-date"
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
                    {coverFile && (
                      <img
                        src={URL.createObjectURL(coverFile)}
                        className="mt-2 h-24 w-full rounded object-cover"
                      />
                    )}
                  </div>

                  {/* --- Tags Editor --- */}
                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-1 mb-2 mt-2">
                      {modalTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="inline-flex items-center bg-primary text-primary-foreground cursor-pointer"
                        >
                          {tag}
                          <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() => removeTag(tag)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Type a tag and press Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={onTagKeyDown}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="visibility-switch">
                      {isPublic ? "Public" : "Private"}
                    </Label>
                    <Switch
                      id="visibility-switch"
                      checked={isPublic}
                      onCheckedChange={(checked: any) => setPublic(checked)}
                    />
                  </div>
                  <Button onClick={save} className="w-full" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Track delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="icon"
                  variant="destructive"
                  onPointerDownCapture={(e) => e.stopPropagation()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Track</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this track? This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Waveform Player */}
        <div className="rounded-md border border-border">
          <AudioPlayerWave src={track.file_url} small />
        </div>

        {/* --- Display Tags as Pills Below Waveform --- */}
        {track.tags && track.tags.length > 0 && (
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
        )}
      </CardContent>
    </Card>
  );
}
