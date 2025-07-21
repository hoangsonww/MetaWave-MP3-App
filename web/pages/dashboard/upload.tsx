"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/supabase/client";
import { createTrack } from "@/supabase/queries/tracks";
import { v4 as uuid } from "uuid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { parseBuffer } from "music-metadata-browser";
import { Info } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [isPublic, setPublic] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { profile: session, loading: loadingSession } = useSessionProfile();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loadingSession && !session) {
      router.replace("/login");
    }
  }, [loadingSession, session, router]);

  // When user selects an MP3, try to auto-extract embedded cover art
  useEffect(() => {
    if (!file) {
      setCoverFile(null);
      return;
    }

    file
      .arrayBuffer()
      .then((buffer) => {
        const uint8 = new Uint8Array(buffer);
        // @ts-ignore
        return parseBuffer(uint8, { duration: false });
      })
      .then((metadata) => {
        const pic = metadata.common.picture?.[0];
        if (pic) {
          const blob = new Blob([pic.data], { type: pic.format });
          const ext = pic.format.split("/")[1] || "jpg";
          const fname = `embedded.${ext}`;
          const f = new File([blob], fname, { type: pic.format });
          setCoverFile(f);
        }
      })
      .catch((err) => {
        console.warn("No embedded cover art found:", err);
      });
  }, [file]);

  const run = async () => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File too large: maximum 50 MB");
      return;
    }
    setLoading(true);

    // ensure session
    const { data: sessData, error: sessErr } = await supabase.auth.getSession();
    if (sessErr || !sessData.session) {
      toast.error("You must be logged in");
      setLoading(false);
      return;
    }
    const owner_id = sessData.session.user.id;

    // 1) upload audio
    const audioPath = `${owner_id}/${uuid()}.mp3`;
    const { error: uploadErr } = await supabase.storage
      .from("tracks")
      .upload(audioPath, file);
    if (uploadErr) {
      toast.error(uploadErr.message);
      setLoading(false);
      return;
    }
    const { data: audioPublic } = supabase.storage
      .from("tracks")
      .getPublicUrl(audioPath);

    // 2) upload cover (extracted or manual)
    let cover_art_url: string | null = null;
    if (coverFile) {
      const coverPath = `${owner_id}/covers/${uuid()}-${coverFile.name}`;
      const { error: covErr } = await supabase.storage
        .from("covers")
        .upload(coverPath, coverFile);
      if (covErr) {
        toast.error(covErr.message);
      } else {
        cover_art_url = supabase.storage.from("covers").getPublicUrl(coverPath)
          .data.publicUrl;
      }
    }

    // 3) insert into database
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
      setCoverFile(null);
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
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept="audio/mpeg"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    <strong>Note:</strong> You cannot upload MP3 files larger
                    than 50MB.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
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
              <span className="text-sm font-medium">
                {isPublic ? "Public" : "Private"} Track
              </span>
              <Switch checked={isPublic} onCheckedChange={setPublic} />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">Cover Art</p>
              {/* user can override the extracted art here */}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              />
              {coverFile && (
                <img
                  src={URL.createObjectURL(coverFile)}
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
