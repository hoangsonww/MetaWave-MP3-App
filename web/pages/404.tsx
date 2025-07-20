"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search } from "lucide-react";

export default function NotFoundPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center flex-1 text-center py-20 px-4">
        <AlertCircle className="mb-6 h-20 w-20 text-destructive animate-bounce" />
        <h1 className="text-7xl font-extrabold mb-4 text-primary">404</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! The page you’re looking for doesn’t exist.
        </p>

        <div className="flex flex-wrap gap-4 mb-8">
          <Link href="/">
            <Button variant="default" className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
