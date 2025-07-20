import { supabase } from "../client";
import { z } from "zod";

const ProfileSchema = z.object({
  id: z.string(), // this is the auth.users.id
  email: z.string().email(),
  name: z.string(),
  dob: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  handle: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Profile = z.infer<typeof ProfileSchema>;

const CreateProfileSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  dob: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().nullable().optional(),
  handle: z.string(),
});
export type CreateProfileInput = z.infer<typeof CreateProfileSchema>;

const UpdateProfileSchema = CreateProfileSchema.partial().extend({
  id: z.string(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export async function getProfileById(id: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return ProfileSchema.parse(data);
}

export async function createProfile(
  input: CreateProfileInput,
): Promise<Profile> {
  const payload = CreateProfileSchema.parse(input);
  const { data, error } = await supabase
    .from("profiles")
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return ProfileSchema.parse(data);
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<Profile> {
  const { id, ...patch } = UpdateProfileSchema.parse(input);
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return ProfileSchema.parse(data);
}
