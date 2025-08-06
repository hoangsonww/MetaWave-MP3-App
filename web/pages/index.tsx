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
  { when: "Q1 ’25", what: "Collaborative album editing" },
  { when: "Q2 ’25", what: "Play analytics dashboard" },
  { when: "Q3 ’25", what: "Advanced tagging & search" },
  { when: "Q4 ’25", what: "AI stem preview & auto‑trims" },
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

  // Counters
  const tracksCount = useCountUp(127000);
  const coversCount = useCountUp(56000);
  const usersCount = useCountUp(3100);

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
        <section className="relative isolate w-full max-w-7xl px-6 pt-28 md:pt-36 text-center">
          {/* Animated gradient orbs / mesh */}
          {/* big blurred dynamic blobs */}
          <div className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 animate-blob rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute top-1/3 -right-40 h-[34rem] w-[34rem] animate-blob2 rounded-full bg-accent/30 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 animate-blob3 rounded-full bg-secondary/25 blur-3xl" />

          {/* subtle grid overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--foreground-rgb),0.1),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-0 bg-grid-fade mask-fade" />

          <div className="mx-auto max-w-5xl relative">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-4 py-2 text-xs font-medium backdrop-blur-md shadow-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Open Beta • Iterate with us</span>
            </div>

            <h1 className="mt-8 font-extrabold tracking-tight text-5xl md:text-6xl lg:text-7xl leading-tight">
              <span className="bg-gradient-to-br from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                MetaWave
              </span>{" "}
              lets you{" "}
              <span className="relative inline-block">
                <span className="text-primary">{displayed}</span>
                <span className="ml-1 inline-block w-[10px] animate-caret bg-primary/80 align-middle" />
              </span>{" "}
              your audio.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              A focused toolkit for creators –{" "}
              <span className="font-semibold text-primary">
                import MP3s, mass-update cover art, sculpt albums with drag &
                drop waveforms, and present a polished public profile
              </span>{" "}
              – all in one accelerated dashboard 🚀
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
            <div className="mt-16 flex flex-col items-center gap-2 text-xs text-muted-foreground">
              <span className="tracking-wide text-primary">
                SCROLL TO EXPLORE
              </span>
              <ArrowDown className="h-6 w-6 animate-bounce text-primary/70" />
            </div>
          </div>
        </section>

        {/* ---------------- Stats ---------------- */}
        <section className="w-full max-w-5xl px-6">
          <div className="grid gap-10 sm:grid-cols-3 text-center">
            {[
              {
                label: "Tracks Managed",
                ref: tracksCount.ref,
                val: tracksCount.val,
              },
              {
                label: "Covers Embedded",
                ref: coversCount.ref,
                val: coversCount.val,
              },
              {
                label: "Creators Onboarded",
                ref: usersCount.ref,
                val: usersCount.val,
              },
            ].map((s) => (
              <div
                key={s.label}
                ref={s.ref}
                className="relative rounded-xl border bg-card/70 p-8 backdrop-blur-md shadow-sm hover:shadow transition"
              >
                <p className="text-4xl font-extrabold text-primary">
                  {s.val.toLocaleString()}+
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-primary/10" />
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- Feature Grid ---------------- */}
        <section className="w-full max-w-7xl px-6" id="features">
          <h2 className="mb-2 text-center text-3xl font-bold md:text-4xl">
            Core Feature Set
          </h2>
          <p className="mb-12 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Build a cohesive sonic catalog with visual clarity, speed and
            delight. 🎹
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featureBlocks.map((f) => (
              <div
                key={f.title}
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

        {/* ---------------- Workflow Section ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                A friction‑free workflow from{" "}
                <span className="text-primary">upload</span> to
                <br />
                polished{" "}
                <span className="bg-gradient-to-r from-primary/80 to-accent bg-clip-text text-transparent">
                  showcase
                </span>
                .
              </h2>
              <ul className="space-y-4 text-sm">
                {[
                  {
                    icon: <FileAudio2 className="h-4 w-4 text-primary" />,
                    text: "Drag in MP3s - metadata parsed where available.",
                  },
                  {
                    icon: <Images className="h-4 w-4 text-primary" />,
                    text: "Embed or batch replace cover art in seconds.",
                  },
                  {
                    icon: <ListMusic className="h-4 w-4 text-primary" />,
                    text: "Create albums & reorder with fluid drag & drop.",
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
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-[3px]">{l.icon}</span>
                    <span className="text-muted-foreground">{l.text}</span>
                  </li>
                ))}
              </ul>
              <div className="flex gap-4 pt-2">
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
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-2xl border bg-card/70 backdrop-blur p-6 shadow-sm overflow-hidden">
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

        {/* ---------------- Tech Stack ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <h2 className="mb-2 text-center text-3xl font-bold">
            Powered by Modern Tech
          </h2>
          <p className="mb-6 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Built with a focus on performance, scalability and developer
            experience. We leverage the latest web technologies to deliver a
            seamless audio management experience. 🎵
          </p>
          <div className="flex flex-wrap justify-center gap-8">
            {techStack.map((t) => (
              <div
                key={t.label}
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

        {/* ---------------- Testimonials ---------------- */}
        <section className="w-full max-w-6xl px-6">
          <h2 className="mb-10 text-center text-3xl font-bold">
            Creators Are Already Feeling the Flow
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl border bg-card/70 p-6 backdrop-blur shadow-sm hover:shadow-md transition"
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
          <h2 className="mb-3 text-center text-3xl font-bold">
            Pricing & Future Tiers
          </h2>
          <p className="mb-12 text-center text-sm text-muted-foreground max-w-xl mx-auto">
            During our public beta, all tiers are free! We value your feedback
            and will iterate based on your needs. Future tiers will unlock even
            more advanced features and team collaboration tools. ✨
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.tier}
                className="group relative flex flex-col rounded-2xl border bg-card/70 p-8 backdrop-blur shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-bold">{tier.tier}</h3>
                <p className="mt-2 text-3xl font-extrabold">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {tier.price}
                  </span>
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

        {/* ---------------- Roadmap ---------------- */}
        <section className="w-full max-w-4xl px-6">
          <h2 className="mb-6 text-center text-3xl font-bold">
            Roadmap Highlights
          </h2>
          <div className="relative pl-6 border-l">
            {roadmap.map((r, i) => (
              <div key={i} className="mb-8 flex gap-4">
                <span className="absolute -left-[7px] mt-1 h-3 w-3 rounded-full bg-primary" />
                <CalendarCheck2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-semibold">{r.when}</p>
                  <p className="text-sm text-muted-foreground">{r.what}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="w-full max-w-5xl px-6">
          <h2 className="mb-4 text-center text-3xl font-bold">
            Frequently Asked Questions
          </h2>
          <p className="mb-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            Have questions? We have answers! Here are some common queries from
            our community. If you need more help, feel free to reach out via our
            GitHub repository's Issues page or support email. 📧
          </p>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
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
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-background to-accent/10 p-[2px]">
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
          <div className="relative overflow-hidden rounded-2xl border bg-card/70 p-10 backdrop-blur">
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
      `}</style>
    </>
  );
}
