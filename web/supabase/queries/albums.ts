import { supabase } from "../client";
import { z } from "zod";
import { Track, getTracksByUser as _getTracksByUser } from "./tracks";

/** Album schema & types **/
const AlbumSchema = z.object({
  id: z.string(),
  owner_id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  cover_art_url: z.string().nullable().optional(),
  is_public: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Album = z.infer<typeof AlbumSchema>;

const CreateAlbumSchema = AlbumSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type CreateAlbumInput = z.infer<typeof CreateAlbumSchema>;

const UpdateAlbumSchema = CreateAlbumSchema.partial().extend({
  id: z.string(),
});
export type UpdateAlbumInput = z.infer<typeof UpdateAlbumSchema>;

/** Album CRUD **/
export async function getAlbumsByUser(owner_id: string): Promise<Album[]> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("owner_id", owner_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return z.array(AlbumSchema).parse(data);
}

export async function getAlbumById(id: string): Promise<Album> {
  const { data, error } = await supabase
    .from("albums")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return AlbumSchema.parse(data);
}

export async function createAlbum(input: CreateAlbumInput): Promise<Album> {
  const payload = CreateAlbumSchema.parse(input);
  const { data, error } = await supabase
    .from("albums")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return AlbumSchema.parse(data);
}

export async function updateAlbum(input: UpdateAlbumInput): Promise<Album> {
  const { id, ...patch } = UpdateAlbumSchema.parse(input);
  const { data, error } = await supabase
    .from("albums")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return AlbumSchema.parse(data);
}

export async function deleteAlbum(id: string): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("albums")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  return z.object({ id: z.string() }).parse(data);
}

/** Album ↔ Track pivot schema & types **/
const AlbumTrackSchema = z.object({
  album_id: z.string(),
  track_id: z.string(),
  position: z.number().int(),
  added_at: z.string(),
});
export type AlbumTrack = z.infer<typeof AlbumTrackSchema>;

/** Pivot table operations **/
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

/** Re-export track operations for convenience **/
export const getTracksByUser = _getTracksByUser;
export type { Track };
