import { supabase } from "../client";
import { z } from "zod";

const AlbumTrackSchema = z.object({
  album_id: z.string(),
  track_id: z.string(),
  position: z.number().int(),
  added_at: z.string(),
});
export type AlbumTrack = z.infer<typeof AlbumTrackSchema>;

export async function getTracksInAlbum(
  album_id: string,
): Promise<AlbumTrack[]> {
  const { data, error } = await supabase
    .from("album_tracks")
    .select("*")
    .eq("album_id", album_id)
    .order("position", { ascending: true });
  if (error) throw error;
  return z.array(AlbumTrackSchema).parse(data);
}

export async function addTrackToAlbum(
  album_id: string,
  track_id: string,
  position: number,
): Promise<AlbumTrack> {
  const { data, error } = await supabase
    .from("album_tracks")
    .insert({ album_id, track_id, position })
    .select()
    .single();
  if (error) throw error;
  return AlbumTrackSchema.parse(data);
}

export async function removeTrackFromAlbum(
  album_id: string,
  track_id: string,
): Promise<void> {
  const { error } = await supabase
    .from("album_tracks")
    .delete()
    .eq("album_id", album_id)
    .eq("track_id", track_id);
  if (error) throw error;
}

export async function updateTrackPosition(
  album_id: string,
  track_id: string,
  position: number,
): Promise<AlbumTrack> {
  const { data, error } = await supabase
    .from("album_tracks")
    .update({ position })
    .eq("album_id", album_id)
    .eq("track_id", track_id)
    .select()
    .single();
  if (error) throw error;
  return AlbumTrackSchema.parse(data);
}

export async function batchUpdatePositions(
  album_id: string,
  positions: Array<{ track_id: string; position: number }>,
): Promise<AlbumTrack[]> {
  const results: AlbumTrack[] = [];
  for (const { track_id, position } of positions) {
    const updated = await updateTrackPosition(album_id, track_id, position);
    results.push(updated);
  }
  return results;
}
