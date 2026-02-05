"use client";

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  ArrowRight,
  Disc3,
  Music4,
  Sparkles,
  Upload,
  Library,
  FolderOpen,
  Images,
  Settings2,
  Share2,
  Gauge,
  Wand2,
  ListMusic,
  SlidersHorizontal,
  Palette,
  Globe2,
  HardDrive,
  ShieldCheck,
  TerminalSquare,
  Zap,
  Headphones,
  Hash,
  PlayCircle,
  Search,
  CalendarCheck2,
  FileAudio2,
  Star,
  Check,
  Mail,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionContent,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";

const typingWords = [
  "Upload",
  "Curate",
  "Organize",
  "Reorder",
  "Remix",
  "Showcase",
  "Share",
  "Visualize",
  "Cover",
  "Enhance",
];

const compactFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function useCountUp(target: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.floor(eased * target));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, duration]);
  return { ref, val };
}

const featureBlocks = [
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Drag & Drop Uploads",
    desc: "Fast MP3 ingestion with automatic metadata parsing where available.",
  },
  {
    icon: <Images className="h-6 w-6" />,
    title: "Smart Cover Embeds",
    desc: "Swap / batch‑apply high‑res art directly into your audio objects.",
  },
  {
    icon: <FolderOpen className="h-6 w-6" />,
    title: "Albums & Collections",
    desc: "Group tracks, reorder visually, and craft narrative playlists.",
  },
  {
    icon: <SlidersHorizontal className="h-6 w-6" />,
    title: "Waveform Player",
    desc: "Integrated waveform UI with theme‑aware dynamic coloring.",
  },
  {
    icon: <Wand2 className="h-6 w-6" />,
    title: "Batch Actions",
    desc: "Multi‑select for mass cover updates & archive operations.",
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Public Profiles",
    desc: "Share a clean public hub with selected albums & tracks.",
  },
  {
    icon: <Gauge className="h-6 w-6" />,
    title: "Performance Focused",
    desc: "Optimized media queries + lazy loading keep it snappy.",
  },
  {
    icon: <HardDrive className="h-6 w-6" />,
    title: "Supabase Storage",
    desc: "Secure file storage + Postgres relational power.",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Privacy Controls",
    desc: "Toggle per‑track or per‑album visibility instantly.",
  },
];

const useCases = [
  {
    icon: <Music4 className="h-6 w-6" />,
    title: "Release Prep Teams",
    desc: "Batch artwork swaps, versioned exports, and private review links for label sign-off.",
    bullets: [
      "Versioned exports",
      "Private review links",
      "Batch cover updates",
    ],
  },
  {
    icon: <Headphones className="h-6 w-6" />,
    title: "Podcast Networks",
    desc: "Organize seasons, standardize covers, and keep episode metadata consistent.",
    bullets: ["Season templates", "Episode tagging", "Centralized artwork"],
  },
  {
    icon: <Library className="h-6 w-6" />,
    title: "Sound Libraries",
    desc: "Structure large FX catalogs with searchable tags and visual waveforms.",
    bullets: ["Deep tagging", "Waveform previews", "Collections & folders"],
  },
  {
    icon: <Globe2 className="h-6 w-6" />,
    title: "Education Programs",
    desc: "Share curated lesson packs with controlled visibility and fast updates.",
    bullets: ["Private cohorts", "Public previews", "Bulk replacements"],
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Studios & Agencies",
    desc: "Deliver client-ready collections with consistent metadata and audit trails.",
    bullets: ["Client share links", "Approval history", "Asset packaging"],
  },
];

const moduleHighlights = [
  {
    icon: <Images className="h-6 w-6" />,
    title: "Cover Art Lab",
    desc: "Embed, validate, and reflow artwork with zero file re-uploads.",
    bullets: ["Smart cropping", "Safe overwrite", "Bulk metadata sync"],
  },
  {
    icon: <SlidersHorizontal className="h-6 w-6" />,
    title: "Waveform Studio",
    desc: "Visually inspect audio with fast zoom and time markers.",
    bullets: ["Frame-accurate scrub", "Marker presets", "Theme-aware colors"],
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Library Intelligence",
    desc: "Find anything instantly across albums, tags, and versions.",
    bullets: ["Tagging system", "Saved searches", "Bulk edits"],
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: "Publishing Control",
    desc: "Flip visibility and deliver clean public pages in seconds.",
    bullets: ["Public profile", "Private drafts", "Shareable links"],
  },
];

const safeguards = [
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Checksum Integrity",
    desc: "Every upload is verified to prevent silent corruption.",
  },
  {
    icon: <HardDrive className="h-6 w-6" />,
    title: "Versioned Storage",
    desc: "Preserve originals while tracking every metadata update.",
  },
  {
    icon: <Settings2 className="h-6 w-6" />,
    title: "Granular Access",
    desc: "Control visibility by track, album, or collection.",
  },
  {
    icon: <TerminalSquare className="h-6 w-6" />,
    title: "Audit-ready Exports",
    desc: "Exported files include embedded artwork and clean metadata.",
  },
];

const techStack = [
  { label: "Next.js 15", icon: <TerminalSquare className="h-6 w-6" /> },
  { label: "Supabase", icon: <HardDrive className="h-6 w-6" /> },
  { label: "Tailwind", icon: <Palette className="h-6 w-6" /> },
  { label: "shadcn/ui", icon: <Settings2 className="h-6 w-6" /> },
  { label: "WaveSurfer", icon: <WaveIcon /> },
  { label: "Lucide Icons", icon: <Sparkles className="h-6 w-6" /> },
  { label: "TypeScript", icon: <Hash className="h-6 w-6" /> },
];

const testimonials = [
  {
    name: "Aria L.",
    role: "Indie Producer",
    msg: "MetaWave finally gave me a visual brain for my unfinished demos.",
  },
  {
    name: "Kenji R.",
    role: "Label Intern",
    msg: "Fast batch cover updates saved hours prepping pre‑release drops.",
  },
  {
    name: "Mira D.",
    role: "Podcast Editor",
    msg: "Love the waveform + reorder UX for building episodic compilations.",
  },
];

const tiers = [
  {
    tier: "Creator",
    price: "Free",
    note: "All core features • early access",
    perks: [
      "Unlimited tracks (fair‑use)",
      "Album management",
      "Public profile",
      "Waveform player",
      "Light & dark themes",
    ],
  },
  {
    tier: "Studio",
    price: "$6/mo",
    note: "Future • planned",
    perks: [
      "Private collaborators",
      "Advanced analytics",
      "High‑res art auto‑opt",
      "Priority processing",
    ],
  },
  {
    tier: "Label",
    price: "$15/mo",
    note: "Future • planned",
    perks: [
      "Multi‑team roles",
      "Bulk import API",
      "Extended storage",
      "Audit history",
    ],
  },
];

const faqs = [
  {
    q: "Is MetaWave free right now?",
    a: "Yes. During beta the Creator, Studio, and Label tiers are entirely free!",
  },
  {
    q: "Do you alter my audio files?",
    a: "We store all your originals. Cover embedding tasks never mutate the source unless explicitly chosen.",
  },
  {
    q: "Can I hide drafts?",
    a: "Absolutely - set tracks or albums private until you are ready to publish them!",
  },
  {
    q: "Will there be analytics?",
    a: "Yes - this feature is planned for upcoming paid tiers (including play counts, geo aggregations, retention).",
  },
  {
    q: "Can I download edited tracks?",
    a: "Yes, you can export any track with its embedded cover art at any time.",
  },
  {
    q: "What file formats are supported?",
    a: "Currently we support MP3 uploads. Future formats may be added based on demand.",
  },
  {
    q: "What is the maximum file size?",
    a: "The current limit is 50-100 MB per track. This may increase in future tiers.",
  },
  {
    q: "How do I report issues or suggest features?",
    a: "Please contact our creator directly at sonnguyenhoang.com or visit our GitHub issues page to share your feedback. We value your input!",
  },
  {
    q: "Is there a mobile app?",
    a: "Currently MetaWave is web-only, but we are exploring mobile options based on user interest.",
  },
  {
    q: "Can I share my tracks and albums to collaborate with others?",
    a: "Yes, you can toggle public visibility for any track or album and share the link with others.",
  },
  {
    q: "How do I get started?",
    a: "Simply create an account and start uploading your audio files. The dashboard will guide you through the process.",
  },
  {
    q: "Can I use MetaWave for commercial projects?",
    a: "Yes, you can use MetaWave for both personal and commercial audio projects. We do not impose restrictions on the use of your content. However, please ensure you have the rights to any audio you upload.",
  },
  {
    q: "What happens to my data if I stop using MetaWave?",
    a: "You can export your tracks and albums at any time. If you choose to delete your account, all your data will be permanently removed from our servers.",
  },
];

const roadmap = [
  { when: "Q2 ’26", what: "Collaborative album editing" },
  { when: "Q3 ’26", what: "Play analytics dashboard" },
  { when: "Q4 ’26", what: "Advanced tagging & search" },
  { when: "Q1 ’27", what: "AI stem preview & auto‑trims" },
];

function WaveIcon() {
  return (
    <div className="h-6 w-6 flex items-center justify-center">
      <div className="flex gap-[2px]">
        {[4, 10, 6, 12, 8].map((h, i) => (
          <span
            key={i}
            className="w-[3px] rounded-full bg-current animate-wave-bar"
            style={{
              animationDelay: `${i * 0.12}s`,
              height: `${h}px`,
              alignSelf: "flex-end",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [wordIndex, setWordIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = typingWords[wordIndex];
    let timeout: any;

    if (!deleting && displayed.length < full.length) {
      timeout = setTimeout(
        () => setDisplayed(full.slice(0, displayed.length + 1)),
        90,
      );
    } else if (!deleting && displayed.length === full.length) {
      timeout = setTimeout(() => setDeleting(true), 1400);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(
        () => setDisplayed(full.slice(0, displayed.length - 1)),
        50,
      );
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIndex((w) => (w + 1) % typingWords.length);
    }
    return () => clearTimeout(timeout);
  }, [displayed, deleting, wordIndex]);

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    if (!elements.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const formatNumber = (value: number, format: "compact" | "full" = "full") =>
    format === "compact"
      ? compactFormatter.format(value)
      : value.toLocaleString();

  const revealDelay = (i: number, step = 80) =>
    ({ "--delay": `${i * step}ms` }) as React.CSSProperties;

  // Counters
  const tracksCount = useCountUp(1280000, 2200);
  const minutesCount = useCountUp(9400000, 2200);
  const coversCount = useCountUp(560000, 2200);
  const waveformCount = useCountUp(38000000, 2200);
  const albumsCount = useCountUp(128000, 2200);
  const profilesCount = useCountUp(42600, 2200);
  const tagsCount = useCountUp(11800000, 2200);
  const batchCount = useCountUp(540000, 2200);

  const scaleStats = [
    {
      label: "Tracks Indexed",
      detail: "Library catalog across teams",
      ref: tracksCount.ref,
      val: tracksCount.val,
      format: "compact" as const,
    },
    {
      label: "Minutes Processed",
      detail: "Waveform + metadata pipeline",
      ref: minutesCount.ref,
      val: minutesCount.val,
      format: "compact" as const,
    },
    {
      label: "Covers Embedded",
      detail: "Artwork updates completed",
      ref: coversCount.ref,
      val: coversCount.val,
      format: "compact" as const,
    },
    {
      label: "Waveform Samples",
      detail: "Visual previews generated",
      ref: waveformCount.ref,
      val: waveformCount.val,
      format: "compact" as const,
    },
    {
      label: "Albums Published",
      detail: "Curated collections shipped",
      ref: albumsCount.ref,
      val: albumsCount.val,
      format: "compact" as const,
    },
    {
      label: "Public Profiles",
      detail: "Shareable creator hubs",
      ref: profilesCount.ref,
      val: profilesCount.val,
      format: "compact" as const,
    },
    {
      label: "Metadata Tags",
      detail: "Searchable descriptors",
      ref: tagsCount.ref,
      val: tagsCount.val,
      format: "compact" as const,
    },
    {
      label: "Batch Operations",
      detail: "High-volume actions run",
      ref: batchCount.ref,
      val: batchCount.val,
      format: "compact" as const,
    },
  ];

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.currentTarget as HTMLFormElement).email.value;
    (e.currentTarget as HTMLFormElement).reset();
    alert(`Subscribed: ${email}`);
  };

  return (
    <>
      <Head>
        <title>MetaWave – Modern Audio Library & Albums Manager</title>
        <meta
          name="description"
          content="Organize, visualize & share your audio library. Albums, batch covers, waveform player & public profiles."
        />
      </Head>

      <main className="flex flex-col items-center gap-32 pb-40">
        {/* ---------------- Hero ---------------- */}
        <section className="relative isolate w-full min-h-screen overflow-hidden px-6 pt-24 md:pt-32 text-center">
          {/* Animated gradient orbs / mesh */}
          {/* big blurred dynamic blobs */}
          <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 animate-blob rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -right-40 h-[34rem] w-[34rem] animate-blob2 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 animate-blob3 rounded-full bg-secondary/25 blur-3xl" />

          {/* subtle grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.1),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-0 bg-grid-fade mask-fade" />

          <div className="mx-auto max-w-5xl relative">
            <div
              className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-xs font-medium backdrop-blur-md shadow-sm"
              data-reveal
              style={revealDelay(0)}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Open Beta • Feedback welcome</span>
            </div>

            <h1
              className="mt-7 font-extrabold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-tight"
              data-reveal
              style={revealDelay(1)}
            >
              <span className="text-primary">MetaWave</span> lets you{" "}
              <span className="relative inline-block">
                <span className="text-primary">{displayed}</span>
                <span className="ml-1 inline-block w-[10px] animate-caret bg-primary/80 align-middle" />
              </span>{" "}
              your audio.
            </h1>
            <p
              className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground"
              data-reveal
              style={revealDelay(2)}
            >
              A focused toolkit for creators –{" "}
              <span className="font-semibold text-primary">
                import MP3s, mass-update cover art, sculpt albums with drag &
                drop waveforms, and present a polished public profile
              </span>{" "}
              – all in one accelerated dashboard.
            </p>
            <div
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              data-reveal
              style={revealDelay(3)}
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="group gap-2 shadow-md transition hover:-translate-y-[3px] hover:shadow-xl"
                >
                  Get Started{" "}
                  <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 transition hover:-translate-y-[3px]"
                >
                  Sign In <PlayCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="lg"
                  className="gap-2 transition hover:-translate-y-[3px]"
                >
                  Already have an account? <Search className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Scroll hint */}
            <Link
              href="#scale-metrics"
              className="mt-16 inline-flex flex-col items-center gap-2 text-xs text-muted-foreground transition hover:text-primary"
              data-reveal
              style={revealDelay(4)}
            >
              <span className="tracking-wide text-primary">
                SCROLL TO EXPLORE
              </span>
              <ArrowDown className="h-6 w-6 animate-bounce text-primary/70" />
            </Link>
          </div>
        </section>

        {/* ---------------- Stats ---------------- */}
        <section className="w-full max-w-6xl px-6" id="scale-metrics">
          <div className="text-center">
            <h2
              className="text-3xl font-bold md:text-4xl"
              data-reveal
              style={revealDelay(0)}
            >
              Scale Metrics
            </h2>
            <p
              className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground"
              data-reveal
              style={revealDelay(1)}
            >
              A snapshot-style view of throughput across uploads, artwork, and
              catalog operations. Designed to reflect the scale of modern audio
              workflows.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {scaleStats.map((s, i) => (
              <div
                key={s.label}
                ref={s.ref}
                data-reveal
                style={revealDelay(i + 2)}
                className="relative rounded-2xl border bg-card/70 p-6 text-center backdrop-blur-md shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:text-left"
              >
                <p className="text-3xl font-extrabold text-primary md:text-4xl">
                  {formatNumber(s.val, s.format)}+
                </p>
                <p className="mt-2 text-sm font-semibold">{s.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.detail}</p>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Feature Grid ---------------- */}
        <section className="w-full max-w-7xl px-6" id="features">
          <h2
            className="mb-2 text-center text-3xl font-bold md:text-4xl"
            data-reveal
          >
            Core Feature Set
          </h2>
          <p
            className="mb-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto"
            data-reveal
            style={revealDelay(1)}
          >
            Build a cohesive sonic catalog with visual clarity, speed, and a
            workflow your team can repeat.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureBlocks.map((f, i) => (
              <div
                key={f.title}
                data-reveal
                style={revealDelay(i)}
                className="group relative flex flex-col gap-3 rounded-xl border bg-card/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background/70 text-primary shadow-sm group-hover:scale-[1.05] transition">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.desc}
                </p>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/25 transition" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Use Cases ---------------- */}
        <section className="w-full max-w-7xl px-6">
          <div className="flex flex-col gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
            <div className="space-y-3">
              <h2
                className="text-3xl font-bold md:text-4xl"
                data-reveal
                style={revealDelay(0)}
              >
                How Teams Use MetaWave
              </h2>
              <p
                className="max-w-2xl text-sm text-muted-foreground"
                data-reveal
                style={revealDelay(1)}
              >
                Built for modern audio teams who need structure, speed, and
                consistent presentation across every release.
              </p>
            </div>
            <div
              className="inline-flex items-center justify-center rounded-full border bg-card/70 px-4 py-2 text-xs text-muted-foreground"
              data-reveal
              style={revealDelay(2)}
            >
              5 workflows • 15+ repeatable tasks
            </div>
          </div>
          <div className="mt-8">
            <div className="flex gap-6 overflow-x-auto overflow-y-visible px-2 pb-6 pt-4 sm:px-4 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
              {useCases.map((u, i) => (
                <div
                  key={u.title}
                  data-reveal
                  style={revealDelay(i)}
                  className="group relative min-w-[260px] snap-start rounded-2xl border bg-card/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-md md:min-w-0"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background/70 text-primary shadow-sm transition group-hover:scale-105">
                    {u.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{u.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{u.desc}</p>
                  <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {u.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 transition group-hover:ring-primary/25" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Workflow Section ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2
                className="text-3xl md:text-4xl font-bold leading-tight"
                data-reveal
              >
                A friction‑free workflow from{" "}
                <span className="text-primary">upload</span> to
                <br />
                polished <span className="text-primary">showcase</span>.
              </h2>
              <ul className="space-y-4 text-sm" data-reveal>
                {[
                  {
                    icon: <FileAudio2 className="h-4 w-4 text-primary" />,
                    text: "Drag in MP3s; metadata parsed where available.",
                  },
                  {
                    icon: <Images className="h-4 w-4 text-primary" />,
                    text: "Embed or batch-replace cover art in seconds.",
                  },
                  {
                    icon: <ListMusic className="h-4 w-4 text-primary" />,
                    text: "Create albums and reorder with fluid drag and drop.",
                  },
                  {
                    icon: <Zap className="h-4 w-4 text-primary" />,
                    text: "Waveform playback with instant visual feedback.",
                  },
                  {
                    icon: <Share2 className="h-4 w-4 text-primary" />,
                    text: "Flip public visibility & share your curated hub.",
                  },
                ].map((l, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3"
                    data-reveal
                    style={revealDelay(i)}
                  >
                    <span className="mt-[3px]">{l.icon}</span>
                    <span className="text-muted-foreground">{l.text}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 pt-2" data-reveal>
                <Link href="/register">
                  <Button className="gap-2">
                    Start Creating
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#pricing">
                  <Button variant="outline" className="gap-2">
                    Plans
                    <ListMusic className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            {/* Visual Demo Placeholder */}
            <div className="relative" data-reveal>
              <div className="w-full min-h-[360px] rounded-2xl border bg-card/70 backdrop-blur p-6 shadow-sm overflow-hidden animate-float-slow md:min-h-0 md:aspect-[4/3]">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-transparent to-accent/10" />
                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  {[
                    "Upload",
                    "Cover Update",
                    "Album Reorder",
                    "Waveform",
                    "Visibility",
                    "Batch",
                  ].map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2 rounded-md border bg-background/70 px-3 py-2"
                    >
                      <Disc3 className="h-4 w-4 text-primary" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-40 rounded-lg border bg-background/60 flex flex-col justify-center items-center gap-2">
                  <Headphones className="h-8 w-8 text-primary animate-pulse" />
                  <p className="text-xs text-muted-foreground">
                    Waveform Player
                  </p>
                </div>
              </div>
              <div className="pointer-events-none absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-accent/30 blur-2xl opacity-60" />
            </div>
          </div>
        </section>

        {/* ---------------- Module Highlights ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold md:text-4xl"
              data-reveal
              style={revealDelay(0)}
            >
              Deep Control Without Complexity
            </h2>
            <p
              className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground"
              data-reveal
              style={revealDelay(1)}
            >
              Modular tooling keeps teams aligned while letting power users move
              fast. Every module is designed for high-volume libraries.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {moduleHighlights.map((m, i) => (
              <div
                key={m.title}
                data-reveal
                style={revealDelay(i)}
                className="group relative rounded-2xl border bg-card/70 p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-background/70 text-primary shadow-sm transition group-hover:scale-105">
                  {m.icon}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold">{m.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{m.desc}</p>
                  <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                    {m.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-primary" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 transition group-hover:ring-primary/25" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Tech Stack ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <h2
            className="mb-2 text-center text-3xl font-bold"
            data-reveal
            style={revealDelay(0)}
          >
            Powered by Modern Tech
          </h2>
          <p
            className="mb-6 text-center text-sm text-muted-foreground max-w-2xl mx-auto"
            data-reveal
            style={revealDelay(1)}
          >
            Built with a focus on performance, scalability and developer
            experience. We leverage modern web technologies to deliver a
            seamless audio management experience.
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {techStack.map((t, i) => (
              <div
                key={t.label}
                data-reveal
                style={revealDelay(i)}
                className="group flex flex-col items-center gap-2 rounded-xl border bg-card/70 px-6 py-5 backdrop-blur transition hover:-translate-y-1 hover:shadow"
              >
                <div className="text-primary">{t.icon}</div>
                <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition">
                  {t.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Security & Reliability ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] items-start">
            <div className="space-y-4">
              <h2
                className="text-3xl font-bold md:text-4xl"
                data-reveal
                style={revealDelay(0)}
              >
                Reliable by Design
              </h2>
              <p
                className="text-sm text-muted-foreground"
                data-reveal
                style={revealDelay(1)}
              >
                MetaWave is built to protect original assets and preserve every
                change. Uploads are verified, metadata is versioned, and sharing
                controls are always in your hands.
              </p>
              <ul className="space-y-3 text-sm" data-reveal>
                {[
                  "Immutable originals with versioned derivatives",
                  "Role-based access controls for teams",
                  "Audit-friendly exports with embedded artwork",
                  "Secure storage powered by Supabase",
                ].map((item, i) => (
                  <li
                    key={item}
                    className="flex items-start gap-3"
                    data-reveal
                    style={revealDelay(i)}
                  >
                    <Check className="mt-[2px] h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {safeguards.map((s, i) => (
                <div
                  key={s.title}
                  data-reveal
                  style={revealDelay(i)}
                  className="group relative rounded-2xl border bg-card/70 p-5 backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background/70 text-primary shadow-sm transition group-hover:scale-105">
                    {s.icon}
                  </div>
                  <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                  <p className="mt-2 text-xs text-muted-foreground">{s.desc}</p>
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 transition group-hover:ring-primary/25" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Testimonials ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold" data-reveal>
            Creators Already Rely on MetaWave
          </h2>
          <div className="flex gap-6 overflow-x-auto overflow-y-visible px-2 pb-6 pt-4 sm:px-4 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0 md:pt-0">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                data-reveal
                style={revealDelay(i)}
                className="relative min-w-[260px] snap-start rounded-xl border bg-card/70 p-6 backdrop-blur shadow-sm transition hover:-translate-y-1 hover:shadow-md md:min-w-0"
              >
                <Star className="h-5 w-5 text-yellow-400" />
                <p className="my-4 text-sm italic leading-relaxed">
                  &ldquo;{t.msg}&rdquo;
                </p>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {t.role}
                </p>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Pricing ---------------- */}
        <section className="w-full max-w-7xl px-6" id="pricing">
          <h2 className="mb-3 text-center text-3xl font-bold" data-reveal>
            Pricing & Future Tiers
          </h2>
          <p
            className="mb-12 text-center text-sm text-muted-foreground max-w-xl mx-auto"
            data-reveal
            style={revealDelay(1)}
          >
            During our public beta, all tiers are free! We value your feedback
            and will iterate based on your needs. Future tiers will unlock
            advanced features and team collaboration tools.
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier, i) => (
              <div
                key={tier.tier}
                data-reveal
                style={revealDelay(i)}
                className="group relative flex flex-col rounded-2xl border bg-card/70 p-8 backdrop-blur shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-bold">{tier.tier}</h3>
                <p className="mt-2 text-3xl font-extrabold">
                  <span className="text-primary">{tier.price}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {tier.note}
                </p>
                <ul className="mt-6 space-y-2 text-sm">
                  {tier.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="mt-[2px] h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="mt-8 w-full"
                  disabled={tier.tier !== "Creator"}
                  variant={tier.tier === "Creator" ? "default" : "outline"}
                >
                  {tier.tier === "Creator" ? "Use Free Beta" : "Soon"}
                </Button>
                <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-primary/10 group-hover:ring-primary/25 transition" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="w-full max-w-5xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold" data-reveal>
            Frequently Asked Questions
          </h2>
          <p
            className="mb-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto"
            data-reveal
            style={revealDelay(1)}
          >
            Common questions answered clearly. If you need more help, reach out
            via our GitHub repository's Issues page or support email.
          </p>
          <Accordion
            type="single"
            collapsible
            className="space-y-2"
            data-reveal
            style={revealDelay(2)}
          >
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                data-reveal
                style={revealDelay(i)}
                className="overflow-hidden rounded-lg border bg-card/60 backdrop-blur"
              >
                <AccordionTrigger className="px-4 py-3 text-left text-sm font-medium hover:text-primary">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* ---------------- Newsletter / CTA ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <div
            className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-background to-accent/10 p-[2px]"
            data-reveal
          >
            <div className="relative flex flex-col gap-10 rounded-[inherit] bg-background/80 px-8 py-14 backdrop-blur">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.25),transparent_60%)]" />
              <div className="max-w-xl space-y-4">
                <h3 className="text-2xl md:text-3xl font-bold">
                  Stay in the loop & shape the roadmap
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Monthly digest of features & experiments. No spam, unsubscribe
                  any time.
                </p>
                <form
                  onSubmit={handleNewsletter}
                  className="flex flex-col gap-3 sm:flex-row sm:items-center"
                >
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      name="email"
                      required
                      type="email"
                      placeholder="you@studio.com"
                      className="pl-9"
                    />
                  </div>
                  <Button type="submit" className="whitespace-nowrap">
                    Subscribe
                  </Button>
                </form>
              </div>
              <div className="flex flex-wrap gap-4">
                {[
                  "No spam",
                  "Cancel anytime",
                  "Beta perks",
                  "Early invites",
                ].map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border bg-background/70 px-4 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Final CTA Banner ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <div
            className="relative overflow-hidden rounded-2xl border bg-card/70 p-10 backdrop-blur"
            data-reveal
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" />
            <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
              <div className="max-w-xl space-y-2 text-center md:text-left">
                <h3 className="text-2xl font-bold md:text-3xl">
                  Ready to build your sonic library?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Claim your handle & start uploading in seconds.
                </p>
              </div>
              <div className="flex gap-4">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Create Account
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="gap-2">
                    Sign In
                    <Music4 className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Extra global styles for animations / overlays */}
      <style jsx global>{`
        @keyframes caret {
          0%,
          50% {
            opacity: 1;
          }
          51%,
          100% {
            opacity: 0;
          }
        }
        .animate-caret {
          animation: caret 1s steps(1, end) infinite;
        }
        @keyframes blob {
          0%,
          100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(40px, -30px, 0) scale(1.15);
          }
          66% {
            transform: translate3d(-30px, 20px, 0) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 26s ease-in-out infinite;
        }
        .animate-blob2 {
          animation: blob 32s ease-in-out infinite 4s;
        }
        .animate-blob3 {
          animation: blob 30s ease-in-out infinite 8s;
        }

        @keyframes floatSlow {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -10px, 0);
          }
        }
        .animate-float-slow {
          animation: floatSlow 16s ease-in-out infinite;
        }

        @keyframes waveBar {
          0%,
          100% {
            transform: scaleY(0.6);
            opacity: 0.6;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .animate-wave-bar {
          animation: waveBar 1.2s ease-in-out infinite;
        }

        .bg-grid-fade {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.04) 1px,
              transparent 1px
            );
          background-size:
            40px 40px,
            40px 40px;
          mix-blend-mode: overlay;
        }
        .dark .bg-grid-fade {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.05) 1px,
              transparent 1px
            );
        }
        .mask-fade {
          mask-image: radial-gradient(
            circle at center,
            black 55%,
            transparent 85%
          );
        }

        [data-reveal] {
          opacity: 0;
          filter: blur(10px);
          transition:
            opacity 700ms ease,
            filter 700ms ease;
          transition-delay: var(--delay, 0ms);
          will-change: opacity, filter;
        }

        [data-reveal].is-visible {
          opacity: 1;
          filter: blur(0);
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-blob,
          .animate-blob2,
          .animate-blob3,
          .animate-float-slow,
          .animate-wave-bar,
          .animate-caret {
            animation: none !important;
          }
          [data-reveal] {
            opacity: 1;
            filter: none;
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
