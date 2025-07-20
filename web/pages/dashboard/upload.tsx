import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/supabase/client";
import { createTrack } from "@/supabase/queries/tracks";
import { v4 as uuid } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useSessionProfile } from "@/hooks/useSessionProfile";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isPublic, setPublic] = useState(true);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { profile: session, loading: loadingSession } = useSessionProfile();

  useEffect(() => {
    if (!loadingSession && session === null) {
      router.replace("/login");
    }
  }, [loadingSession, session, router]);

  const run = async () => {
    if (!file) return;
    setLoading(true);

    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
      toast.error("You must be logged in");
      setLoading(false);
      return;
    }
    const owner_id = sessionData.session.user.id;

    // upload audio
    const audioPath = `${owner_id}/${uuid()}.mp3`;
    const { error: upErr } = await supabase.storage
      .from("tracks")
      .upload(audioPath, file);
    if (upErr) {
      toast.error(upErr.message);
      setLoading(false);
      return;
    }
    const { data: audioPublic } = supabase.storage
      .from("tracks")
      .getPublicUrl(audioPath);

    // upload cover if present
    let cover_art_url: string | null = null;
    if (cover) {
      const coverPath = `${owner_id}/covers/${uuid()}-${cover.name}`;
      const { error: covErr } = await supabase.storage
        .from("covers")
        .upload(coverPath, cover);
      if (covErr) {
        toast.error(covErr.message);
      } else {
        cover_art_url = supabase.storage.from("covers").getPublicUrl(coverPath)
          .data.publicUrl;
      }
    }

    try {
      await createTrack({
        owner_id,
        title: title || file.name.replace(/\.mp3$/i, ""),
        artist: artist || null,
        album_id: null,
        track_date: null,
        file_url: audioPublic.publicUrl,
        file_size: file.size,
        duration_secs: null,
        cover_art_url,
        is_public: isPublic,
        waveform_data: null,
      });
      toast.success("Uploaded");
      // reset form
      setFile(null);
      setTitle("");
      setArtist("");
      setCover(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create track");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Track - Audio Library</title>
        <meta
          name="description"
          content="Upload your audio tracks, add metadata, and manage your music library."
        />
      </Head>
      <AppLayout>
        <div className="mx-auto max-w-xl px-6 py-10">
          <h1 className="text-3xl font-bold mb-6">Upload Track</h1>
          <div className="space-y-5 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur">
            <Input
              type="file"
              accept="audio/mpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Public</span>
              <Switch checked={isPublic} onCheckedChange={setPublic} />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Cover Art</p>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCover(e.target.files?.[0] || null)}
              />
              {cover && (
                <img
                  src={URL.createObjectURL(cover)}
                  className="mt-3 h-40 w-full rounded object-cover"
                />
              )}
            </div>
            <Button
              disabled={!file || loading}
              onClick={run}
              className="w-full"
            >
              {loading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
