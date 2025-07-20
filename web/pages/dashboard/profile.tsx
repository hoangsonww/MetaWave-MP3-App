"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateProfile, Profile } from "@/supabase/queries/profiles";
import { supabase } from "@/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Pencil, Search as SearchIcon } from "lucide-react";

const profileFormSchema = z.object({
  name: z.string().min(1, "Required"),
  handle: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, "Alphanumeric or underscore")
    .min(3),
  bio: z.string().optional(),
  dob: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { profile: session, loading } = useSessionProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);

  const { control, handleSubmit, reset } = useForm<ProfileForm>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.name || "",
      handle: session?.handle || "",
      bio: session?.bio || "",
      dob: session?.dob || "",
    },
  });

  // redirect once we know there's no session
  useEffect(() => {
    if (!loading && session === null) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  // initialize form when session arrives
  useEffect(() => {
    if (session) {
      reset({
        name: session.name,
        handle: session.handle,
        bio: session.bio ?? "",
        dob: session.dob ?? "",
      });
    }
  }, [session, reset]);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return setResults([]);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,handle,avatar_url")
      .or(`name.ilike.%${searchQ}%,handle.ilike.%${searchQ}%`)
      .limit(20);
    if (error) return toast.error(error.message);
    setResults(data as Profile[]);
  };

  const onSubmit = async (vals: ProfileForm) => {
    if (!session) return;
    let avatar_url = session.avatar_url;
    if (avatarFile) {
      const path = `avatars/${session.id}/${avatarFile.name}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, avatarFile, { upsert: true });
      if (upErr) {
        toast.error(upErr.message);
        return;
      }
      avatar_url = supabase.storage.from("avatars").getPublicUrl(path)
        .data.publicUrl!;
    }

    try {
      await updateProfile({
        id: session.id,
        name: vals.name,
        handle: vals.handle,
        bio: vals.bio ?? null,
        dob: vals.dob ?? null,
        avatar_url,
      });
      toast.success("Profile updated");
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Update failed");
    }
  };

  // show loading skeleton
  if (loading || (!loading && session === undefined)) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
          <div className="flex items-center gap-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-8 w-20 rounded" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1 rounded" />
              <Skeleton className="h-10 w-20 rounded" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // if no session (and not loading) we returned null after redirect
  if (session === null) {
    return null;
  }

  // main content
  return (
    <>
      <Head>
        <title>Profile Settings - Audio Library</title>
        <meta
          name="description"
          content="Manage your profile settings, update your avatar, and search for users."
        />
      </Head>
      <AppLayout>
        <div className="mx-auto max-w-3xl px-6 py-10 space-y-10">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session.avatar_url || ""} />
              <AvatarFallback>{session.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{session.name}</h1>
              <p className="text-sm text-muted-foreground">@{session.handle}</p>
            </div>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <Controller
                    name="name"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          {...field}
                          className="mt-2"
                        />
                        {fieldState.error && (
                          <p className="text-destructive text-sm mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="handle"
                    control={control}
                    render={({ field, fieldState }) => (
                      <div>
                        <Label htmlFor="handle">Handle</Label>
                        <Input
                          id="handle"
                          placeholder="username_123"
                          {...field}
                          className="mt-2"
                        />
                        {fieldState.error && (
                          <p className="text-destructive text-sm mt-1">
                            {fieldState.error.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="dob"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          {...field}
                          value={field.value || ""}
                          className="mt-2"
                        />
                      </div>
                    )}
                  />
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          {...field}
                          value={field.value || ""}
                          className="mt-2"
                        />
                      </div>
                    )}
                  />
                  <div>
                    <Label htmlFor="avatar">Avatar</Label>
                    <Input
                      id="avatar"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setAvatarFile(e.target.files?.[0] || null)
                      }
                      className="mt-2"
                    />
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">Save</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search Users */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-1">
              Search Users
            </h2>
            <form onSubmit={onSearch} className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-10"
                  placeholder="By name or handle"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                size="sm"
                className="flex items-center gap-1"
              >
                <SearchIcon className="h-4 w-4" /> Go
              </Button>
            </form>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.handle}`}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 hover:shadow-lg transition"
                >
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={u.avatar_url || ""} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{u.name}</p>
                  <p className="text-sm text-muted-foreground">@{u.handle}</p>
                </Link>
              ))}
              {results.length === 0 && searchQ.trim() !== "" && (
                <p className="col-span-full text-center text-sm text-muted-foreground">
                  No users found.
                </p>
              )}
            </div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
