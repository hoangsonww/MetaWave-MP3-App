"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  Music2,
  Edit2,
  Plus,
  Disc3,
  Check,
  Lock,
  Share2,
  Copy,
  AtSign,
  GripVertical,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  getAlbumById,
  getTracksInAlbum,
  updateTrackPosition,
  addTrackToAlbum,
  getTracksByUser,
  updateAlbum,
  Album,
  Track,
} from "@/supabase/queries/albums";
import { getTracksByAlbum } from "@/supabase/queries/tracks";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { TrackCard } from "@/components/tracks/TrackCard";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/supabase/client";
import Head from "next/head";

function SortableGridItem({
  track,
  onChanged,
  draggable,
}: {
  track: Track & { position?: number };
  onChanged: () => void;
  draggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: track.id,
      disabled: !draggable,
    });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {draggable && (
        <button
          {...attributes}
          {...listeners}
          className="absolute right-2 top-2 z-20 rounded-md p-0.5 bg-card/80 border border-border cursor-grab opacity-0 group-hover:opacity-100 transition active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
      <TrackCard track={track} onChanged={onChanged} />
    </div>
  );
}

function AddTrackCard({
  track,
  toAdd,
  setToAdd,
}: {
  track: Track;
  toAdd: Set<string>;
  setToAdd: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const [duration, setDuration] = useState("–");

  useEffect(() => {
    const audio = new Audio(track.file_url);
    const handler = () => {
      const sec = audio.duration;
      if (!isNaN(sec)) {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60)
          .toString()
          .padStart(2, "0");
        setDuration(`${m}:${s}`);
      }
    };
    audio.addEventListener("loadedmetadata", handler);
    return () => {
      audio.removeEventListener("loadedmetadata", handler);
      audio.pause();
      audio.src = "";
    };
  }, [track.file_url]);

  return (
    <label className="relative block border border-border rounded-lg overflow-hidden hover:shadow-md transition cursor-pointer">
      <input
        type="checkbox"
        checked={toAdd.has(track.id)}
        onChange={(e) =>
          setToAdd((prev) => {
            const next = new Set(prev);
            e.target.checked ? next.add(track.id) : next.delete(track.id);
            return next;
          })
        }
        className="absolute top-2 left-2 z-20 h-5 w-5 accent-primary"
      />

      <div className="flex h-full flex-col">
        {/* cover */}
        <div className="aspect-square w-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
          {track.cover_art_url ? (
            <img
              src={track.cover_art_url}
              alt={track.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-sm text-muted-foreground">No Cover</div>
          )}
        </div>

        {/* metadata */}
        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <h4 className="font-semibold truncate">{track.title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {track.artist || "—"}
            </p>
          </div>
          <div className="mt-2 text-xs text-muted-foreground flex justify-between">
            <span>{duration}</span>
            <span>
              {track.track_date
                ? new Date(track.track_date).toLocaleDateString()
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </label>
  );
}

export default function AlbumDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile } = useSessionProfile();
  const { profile: session, loading: authLoading } = useSessionProfile();

  const [album, setAlbum] = useState<Album | null>(null);
  const [tracks, setTracks] = useState<(Track & { position: number })[] | null>(
    null,
  );
  const [available, setAvailable] = useState<Track[]>([]);
  const [toAdd, setToAdd] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState<string | null>(null);
  const [editCover, setEditCover] = useState<File | null>(null);
  const [editPublic, setEditPublic] = useState(false);

  useEffect(() => {
    if (!authLoading && session === null) router.replace("/login");
  }, [authLoading, session, router]);

  const load = async () => {
    if (!id) return;
    setAlbum(null);
    setTracks(null);

    const a = await getAlbumById(id as string);
    setAlbum(a);
    setEditTitle(a.title);
    setEditDesc(a.description ?? "");
    setEditPublic(a.is_public);

    const owner = session && a.owner_id === session.id;

    if (owner && profile) {
      const raw = await getTracksInAlbum(id as string);
      const all = await getTracksByUser(profile.id);
      const mapped = raw
        .map((r) => {
          const t = all.find((x) => x.id === r.track_id)!;
          return { ...t, position: r.position };
        })
        .sort((x, y) => x.position - y.position);
      setTracks(mapped);
      setAvailable(all.filter((t) => !mapped.some((m) => m.id === t.id)));
      setToAdd(new Set());
    } else {
      const all = await getTracksByAlbum(id as string);
      const visible = all.filter((t) => t.is_public);
      setTracks(visible.map((t, i) => ({ ...t, position: i })));
    }
  };

  useEffect(() => {
    load();
  }, [id, profile, session]);

  const onDragEnd = async (e: DragEndEvent) => {
    if (!tracks) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tracks.findIndex((t) => t.id === active.id);
    const newIndex = tracks.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(tracks, oldIndex, newIndex).map((t, i) => ({
      ...t,
      position: i + 1,
    }));
    setTracks(reordered);
    await updateTrackPosition(id as string, active.id as string, newIndex + 1);
  };

  const isOwner = session && album && session.id === album.owner_id;
  const allowed = album && (album.is_public || isOwner);

  const togglePublic = async (val: boolean) => {
    if (!album || !isOwner) return;
    const updated = await updateAlbum({ id: album.id, is_public: val });
    setAlbum(updated);
  };

  const openEdit = () => {
    if (!isOwner) return;
    setEditCover(null);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!album || !isOwner) return;
    let cover_url = album.cover_art_url;
    if (editCover) {
      const path = `albums/${album.id}/${editCover.name}`;
      const { error: upErr } = await supabase.storage
        .from("covers")
        .upload(path, editCover, { upsert: true });
      if (upErr) toast.error(upErr.message);
      else
        cover_url = supabase.storage.from("covers").getPublicUrl(path)
          .data.publicUrl;
    }
    await updateAlbum({
      id: album.id,
      title: editTitle,
      description: editDesc,
      cover_art_url: cover_url,
      is_public: editPublic,
    });
    toast.success("Album updated");
    setEditOpen(false);
    load();
  };

  const applyAdd = async () => {
    if (!id || !tracks || toAdd.size === 0 || !isOwner) return;
    setAdding(true);
    let pos = tracks.length;
    for (const tid of toAdd) {
      pos += 1;
      await addTrackToAlbum(id as string, tid, pos);
    }
    setAdding(false);
    load();
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const onCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };
  const onEmail = () =>
    window.open(
      `mailto:?subject=${encodeURIComponent(
        album?.title ?? "",
      )}&body=${encodeURIComponent(shareUrl)}`,
      "_self",
    );
  const onNativeShare = () => {
    // @ts-ignore
    if (navigator.share)
      navigator
        .share({
          title: album?.title,
          text: album?.description ?? "",
          url: shareUrl,
        })
        .catch(() => {});
  };

  return (
    <>
      <Head>
        <title>
          {album ? `${album.title} - Audio Library` : "Loading Album..."}
        </title>
        <meta
          name="description"
          content="View and manage your album, add tracks, and edit details."
        />
      </Head>

      <AppLayout>
        {authLoading || album === null ? (
          <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : !allowed ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-muted-foreground">
            <Lock className="h-12 w-12" />
            <p className="text-lg font-semibold">
              You don’t have access to this album.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
            {/*  Header */}
            <div className="relative rounded-2xl overflow-hidden">
              {album.cover_art_url ? (
                <>
                  <img
                    src={album.cover_art_url}
                    alt={album.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                </>
              ) : (
                <div className="w-full h-64 bg-gradient-to-br from-secondary/30 to-muted/30 flex items-center justify-center rounded-2xl">
                  <Disc3 className="text-secondary/60 w-20 h-20" />
                </div>
              )}

              {/*  Controls */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {/* Share */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                    >
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
                        <Share2 className="h-4 w-4 mr-2" /> Share via...
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Owner‑only */}
                {isOwner && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="capitalize cursor-pointer"
                        >
                          {album.is_public ? "Public" : "Private"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => togglePublic(true)}
                          className="capitalize flex items-center gap-2"
                        >
                          {album.is_public && <Check className="h-4 w-4" />}
                          Public
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => togglePublic(false)}
                          className="capitalize flex items-center gap-2"
                        >
                          {!album.is_public && <Check className="h-4 w-4" />}
                          Private
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={openEdit}
                          className="cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Album</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="inline-block">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="outline"
                                className="cursor-pointer"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>

                            <DialogContent className="max-w-3xl rounded-2xl p-6 shadow-xl">
                              <DialogHeader>
                                <DialogTitle>Add Tracks</DialogTitle>
                              </DialogHeader>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
                                {available.length > 0 ? (
                                  available.map((t) => (
                                    <AddTrackCard
                                      key={t.id}
                                      track={t}
                                      toAdd={toAdd}
                                      setToAdd={setToAdd}
                                    />
                                  ))
                                ) : (
                                  <p className="col-span-full text-center text-sm text-muted-foreground">
                                    No tracks available
                                  </p>
                                )}
                              </div>

                              <DialogFooter className="flex justify-end gap-2 mt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => setToAdd(new Set())}
                                >
                                  Clear
                                </Button>
                                <Button
                                  onClick={applyAdd}
                                  disabled={adding || toAdd.size === 0}
                                >
                                  {adding ? "Adding..." : "Add"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Tracks</p>
                      </TooltipContent>
                    </Tooltip>
                  </>
                )}
              </div>

              <div className="absolute bottom-4 left-4 text-white z-10">
                <h1 className="text-4xl font-bold drop-shadow-lg">
                  {album.title}
                </h1>
                {album.description && (
                  <p className="mt-2 text-lg drop-shadow-md">
                    {album.description}
                  </p>
                )}
              </div>
            </div>

            {/*  Edit dialog */}
            {isOwner && (
              <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Album</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-title">Title</Label>
                      <Input
                        id="edit-title"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Title"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-desc">Description</Label>
                      <Textarea
                        id="edit-desc"
                        value={editDesc || ""}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        placeholder="Description"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-cover">Cover Art</Label>
                      <Input
                        id="edit-cover"
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setEditCover(e.target.files?.[0] || null)
                        }
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-public">Visibility</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              id="edit-public"
                              size="sm"
                              variant="outline"
                              className="capitalize"
                            >
                              {editPublic ? "Public" : "Private"}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setEditPublic(true)}
                              className="capitalize flex items=center gap-2"
                            >
                              {editPublic && <Check className="h-4 w-4" />}
                              Public
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setEditPublic(false)}
                              className="capitalize flex items-center gap-2"
                            >
                              {!editPublic && <Check className="h-4 w-4" />}
                              Private
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveEdit}>Save</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/*  Tracks grid */}
            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={isOwner ? onDragEnd : () => {}}
            >
              <SortableContext
                items={tracks?.map((t) => t.id) ?? []}
                strategy={rectSortingStrategy}
              >
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  {tracks === null ? (
                    Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-[300px]">
                        <Skeleton className="h-96 rounded-lg" />
                      </div>
                    ))
                  ) : tracks.length > 0 ? (
                    tracks.map((t) => (
                      <div key={t.id} className="w-[300px]">
                        <SortableGridItem
                          track={t}
                          onChanged={load}
                          draggable={isOwner!}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full w-full text-center text-muted-foreground">
                      No tracks in this album.
                    </p>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}
      </AppLayout>
    </>
  );
}
