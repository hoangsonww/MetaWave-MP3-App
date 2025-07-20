"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { getAlbumsByUser, createAlbum, Album } from "@/supabase/queries/albums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function AlbumsList() {
  const router = useRouter();
  const { profile: session, loading } = useSessionProfile();
  const [albums, setAlbums] = useState<Album[] | null>(null);
  const [title, setTitle] = useState("");

  // Redirect to login if not authenticated (after loading completes)
  useEffect(() => {
    if (!loading && session === null) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  // Fetch albums for the user
  const loadAlbums = async () => {
    if (!session) return;
    setAlbums(null);
    try {
      const data = await getAlbumsByUser(session.id);
      setAlbums(data);
    } catch (err) {
      console.error(err);
      setAlbums([]);
    }
  };

  useEffect(() => {
    if (session) {
      loadAlbums();
    }
  }, [session]);

  const handleCreate = async () => {
    if (!session || !title.trim()) return;
    try {
      await createAlbum({
        owner_id: session.id,
        title: title.trim(),
        description: null,
        cover_art_url: null,
        is_public: false,
      });
      setTitle("");
      await loadAlbums();
    } catch (err: any) {
      console.error(err);
    }
  };

  // Show overall page skeleton while session is loading
  if (loading || session === undefined) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  // If we know user is not logged in, don't render anything (redirect already happening)
  if (session === null) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Albums - Audio Library</title>
        <meta
          name="description"
          content="Manage your music albums, create new ones, and organize your tracks."
        />
      </Head>
      <AppLayout>
        <div className="mx-auto max-w-5xl px-6 py-10 space-y-6">
          {/* Header */}
          {albums === null ? (
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-48" />
              <div className="ml-auto flex gap-2">
                <Skeleton className="h-10 w-56" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Albums</h1>
              <div className="ml-auto flex gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="New album title"
                  className="w-56"
                />
                <Button onClick={handleCreate} disabled={!title.trim()}>
                  Create
                </Button>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {albums === null
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))
              : albums.map((a) => (
                  <Link
                    key={a.id}
                    href={`/dashboard/albums/${a.id}`}
                    className="group rounded-xl border border-border bg-card/60 p-4 hover:border-primary transition"
                  >
                    {a.cover_art_url && (
                      <img
                        src={a.cover_art_url}
                        alt={a.title}
                        className="mb-3 aspect-square w-full rounded-xl object-cover"
                      />
                    )}
                    <h3 className="font-semibold group-hover:text-primary">
                      {a.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {a.is_public ? "Public" : "Private"}
                    </p>
                  </Link>
                ))}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
