// pages/register.tsx
"use client";

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, AtSign, Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  handle: z
    .string()
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Alphanumeric or underscore only" })
    .min(3, { message: "Handle must be at least 3 characters" }),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email, password }: FormData) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a confirmation link");
      router.push("/login");
    }
  };

  const inputStyles =
    "shadow-sm bg-input text-input-foreground placeholder:text-muted-foreground focus:shadow-md focus:ring-2 focus:ring-primary focus:outline-none transition";

  return (
    <>
      <Head>
        <title>Create Account – MetaWave</title>
        <meta
          name="description"
          content="Register for MetaWave and start sharing your music."
        />
      </Head>

      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card/70 p-8 backdrop-blur-md animate-in fade-in duration-500">
          <div className="text-center">
            <User className="mx-auto h-10 w-10 text-primary" />
            <h1 className="mt-4 text-3xl font-bold">Create Account</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join MetaWave - upload, share & manage your music.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  className={`pl-10 ${inputStyles}`}
                  {...register("email")}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  placeholder="Password"
                  className={`pl-10 pr-10 ${inputStyles}`}
                  {...register("password")}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="sr-only" htmlFor="name">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Name"
                  className={`pl-10 ${inputStyles}`}
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Handle */}
            <div>
              <label className="sr-only" htmlFor="handle">
                Handle
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="handle"
                  placeholder="Handle (public username)"
                  className={`pl-10 ${inputStyles}`}
                  {...register("handle")}
                  aria-invalid={!!errors.handle}
                />
              </div>
              {errors.handle && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.handle.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
