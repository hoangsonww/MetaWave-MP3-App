import { supabase } from "../client";
import { z } from "zod";

const TagSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  category: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Tag = z.infer<typeof TagSchema>;

const CreateTagSchema = TagSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});
export type CreateTagInput = z.infer<typeof CreateTagSchema>;

const UpdateTagSchema = CreateTagSchema.partial().extend({
  id: z.string(),
});
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;

export async function getTagsByUser(user_id: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("user_id", user_id)
    .order("name", { ascending: true });
  if (error) throw error;
  return z.array(TagSchema).parse(data);
}

export async function getTagById(id: string): Promise<Tag> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return TagSchema.parse(data);
}

export async function createTag(input: CreateTagInput): Promise<Tag> {
  const payload = CreateTagSchema.parse(input);
  const { data, error } = await supabase
    .from("tags")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return TagSchema.parse(data);
}

export async function updateTag(input: UpdateTagInput): Promise<Tag> {
  const { id, ...patch } = UpdateTagSchema.parse(input);
  const { data, error } = await supabase
    .from("tags")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return TagSchema.parse(data);
}

export async function deleteTag(id: string): Promise<{ id: string }> {
  const { data, error } = await supabase
    .from("tags")
    .delete()
    .eq("id", id)
    .select("id")
    .single();
  if (error) throw error;
  return z.object({ id: z.string() }).parse(data);
}

export async function getTagsForTrack(track_id: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("track_tags")
    .select("tag:tags(*)")
    .eq("track_id", track_id);
  if (error) throw error;
  const tags = (data ?? []).map((row: any) => row.tag);
  return z.array(TagSchema).parse(tags);
}

export async function addTagToTrack(
  track_id: string,
  tag_id: string,
): Promise<void> {
  const { error } = await supabase
    .from("track_tags")
    .insert({ track_id, tag_id });
  if (error) throw error;
}

export async function removeTagFromTrack(
  track_id: string,
  tag_id: string,
): Promise<void> {
  const { error } = await supabase
    .from("track_tags")
    .delete()
    .eq("track_id", track_id)
    .eq("tag_id", tag_id);
  if (error) throw error;
}
