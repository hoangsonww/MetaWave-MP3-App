"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { supabase } from "@/supabase/client";
import { LogOut, Music2, Sun, Moon, Monitor, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Linkedin } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useSessionProfile } from "@/hooks/useSessionProfile";

type Theme = "light" | "dark" | "system";

function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");

  const applyTheme = useCallback((newTheme: Theme) => {
    const root = document.documentElement;
    if (newTheme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else if (newTheme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
    setTheme(newTheme);
  }, []);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    const initial: Theme =
      stored === "light" || stored === "dark" ? stored : "system";
    applyTheme(initial);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      if (!localStorage.getItem("theme")) {
        applyTheme("system");
      }
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [applyTheme]);

  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          {theme === "light" ? (
            <Sun className="h-5 w-5" />
          ) : theme === "dark" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Monitor className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem
          onSelect={() => applyTheme("light")}
          className={`flex items-center gap-2 ${
            theme === "light" ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          <Sun className="h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => applyTheme("dark")}
          className={`flex items-center gap-2 ${
            theme === "dark" ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          <Moon className="h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => applyTheme("system")}
          className={`flex items-center gap-2 ${
            theme === "system" ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          <Monitor className="h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { profile } = useSessionProfile();

  return (
    <div className="min-h-screen flex flex-col">
      <Header router={router} profile={profile} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Header({
  router,
  profile,
}: {
  router: ReturnType<typeof useRouter>;
  profile: any;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Music2 className="h-6 w-6 text-primary" /> MetaWave
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link href="/dashboard" className={navActive(router, "/dashboard")}>
            Library
          </Link>
          <Link
            href="/dashboard/albums"
            className={navActive(router, "/dashboard/albums")}
          >
            Albums
          </Link>
          <Link
            href="/dashboard/insights"
            className={navActive(router, "/dashboard/insights")}
          >
            Insights
          </Link>
          <Link
            href="/dashboard/profile"
            className={navActive(router, "/dashboard/profile")}
          >
            Profile
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link href="/dashboard/upload">
            <Button size="sm">
              <Upload className="mr-1 h-4 w-4" />
              Upload
            </Button>
          </Link>
          <ThemeToggle />
          {profile && (
            <Link href={`/dashboard/profile`}>
              <Avatar className="h-9 w-9 hover:ring-2 ring-primary transition">
                <AvatarImage src={profile.avatar_url || ""} />
                <AvatarFallback>{profile.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              supabase.auth.signOut().then(() => router.push("/login"))
            }
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background/70 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 sm:flex-row">
        {/* Credit */}
        <p className="text-center text-sm text-muted-foreground">
          © {year} MetaWave. Made with <span className="text-red-500">♥</span>{" "}
          by{" "}
          <Link
            href="https://sonnguyenhoang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:text-primary hover:underline transition"
          >
            Son Nguyen
          </Link>
          .
        </p>

        {/* Social Icons */}
        <div className="flex items-center gap-6">
          <Link
            href="https://github.com/hoangsonww"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-muted-foreground transition"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5 group-hover:text-primary transition-colors" />
          </Link>
          <Link
            href="https://linkedin.com/in/hoangsonw"
            target="_blank"
            rel="noopener noreferrer"
            className="group text-muted-foreground transition"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5 group-hover:text-primary transition-colors" />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function navActive(router: ReturnType<typeof useRouter>, path: string) {
  const { pathname } = router;
  const isExact = path === "/dashboard";
  const active = isExact ? pathname === path : pathname.startsWith(path);
  return `transition-colors hover:text-primary ${
    active ? "text-primary" : "text-muted-foreground"
  }`;
}
