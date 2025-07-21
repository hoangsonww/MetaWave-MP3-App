import { supabase } from "../client";
import { z } from "zod";

const TrackSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  title: z.string(),
  artist: z.string().nullable().optional(),
  album_id: z.string().nullable().optional(),
  track_date: z.string().nullable().optional(),
  file_url: z.string(),
  file_size: z.number().int().nullable().optional(),
  duration_secs: z.number().int().nullable().optional(),
  cover_art_url: z.string().nullable().optional(),
  is_public: z.boolean(),
  waveform_data: z.unknown().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
  tags: z.array(z.string()).optional(),
});
export type Track = z.infer<typeof TrackSchema>;

const CreateTrackSchema = TrackSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type CreateTrackInput = z.infer<typeof CreateTrackSchema>;

const UpdateTrackSchema = CreateTrackSchema.partial().extend({
  id: z.string(),
});
export type UpdateTrackInput = z.infer<typeof UpdateTrackSchema>;

export async function getTracksByUser(user_id: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("owner_id", user_id) // ← renamed
    .order("created_at", { ascending: false });
  if (error) throw error;
  return z.array(TrackSchema).parse(data);
}

export async function getTrackById(id: string): Promise<Track> {
  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return TrackSchema.parse(data);
}

export async function getTracksByAlbum(album_id: string): Promise<Track[]> {
  const { data, error } = await supabase
    .from("album_tracks")
    .select("position, track:track_id (*)")
    .eq("album_id", album_id)
    .order("position", { ascending: true });

  if (error) throw error;

  const tracks = (data as any[]).map((row) => row.track);
  return z.array(TrackSchema).parse(tracks);
}

export async function createTrack(input: CreateTrackInput): Promise<Track> {
  const payload = CreateTrackSchema.parse(input);
  const { data, error } = await supabase
    .from("tracks")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return TrackSchema.parse(data);
}

export async function updateTrack(input: UpdateTrackInput): Promise<Track> {
  const { id, ...patch } = UpdateTrackSchema.parse(input);
  const { data, error } = await supabase
    .from("tracks")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return TrackSchema.parse(data);
}

export async function deleteTrack(id: string): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("tracks")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  return z.object({ id: z.string() }).parse(data);
}

export async function updateTrackTags(
  track_id: string,
  tags: string[],
): Promise<string[]> {
  const { data, error } = await supabase
    .from("tracks")
    .update({ tags })
    .eq("id", track_id)
    .select("tags")
    .single();

  if (error) throw error;
  // supabase returns { tags: [...] }
  return (data as { tags: string[] }).tags;
}
