import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { format, formatDistanceToNow } from "date-fns";

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSessionProfile } from "@/hooks/useSessionProfile";
import { getTracksByUser, type Track } from "@/supabase/queries";
import type {
  ActivityChartProps,
  ActivityPoint,
} from "@/components/insights/ActivityChart";
import type {
  TagDistributionChartProps,
  TagSlice,
} from "@/components/insights/TagDistributionChart";
import type {
  DurationBucket,
  DurationDistributionChartProps,
} from "@/components/insights/DurationDistributionChart";

const ActivityChart = dynamic<ActivityChartProps>(
  () =>
    import("@/components/insights/ActivityChart").then(
      (mod) => mod.ActivityChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartPlaceholder message="Preparing your upload timeline..." />
    ),
  },
);

const TagDistributionChart = dynamic<TagDistributionChartProps>(
  () =>
    import("@/components/insights/TagDistributionChart").then(
      (mod) => mod.TagDistributionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartPlaceholder message="Crunching tag distribution..." />
    ),
  },
);

const DurationDistributionChart = dynamic<DurationDistributionChartProps>(
  () =>
    import("@/components/insights/DurationDistributionChart").then(
      (mod) => mod.DurationDistributionChart,
    ),
  {
    ssr: false,
    loading: () => (
      <ChartPlaceholder message="Mapping your listening ranges..." />
    ),
  },
);

const DEMO_TRACKS: Track[] = [
  {
    id: "demo-aurora",
    owner_id: "demo-user",
    title: "Aurora Skyline",
    artist: "MetaWave",
    album_id: null,
    track_date: "2024-01-14T10:00:00.000Z",
    file_url: "https://example.com/aurora.mp3",
    file_size: 6_400_000,
    duration_secs: 312,
    cover_art_url: null,
    is_public: true,
    waveform_data: null,
    created_at: "2024-01-16T10:00:00.000Z",
    updated_at: "2024-01-16T10:00:00.000Z",
    tags: ["ambient", "deep-focus"],
  },
  {
    id: "demo-solstice",
    owner_id: "demo-user",
    title: "Solstice Bloom",
    artist: "MetaWave",
    album_id: null,
    track_date: "2024-03-02T18:30:00.000Z",
    file_url: "https://example.com/solstice.mp3",
    file_size: 9_200_000,
    duration_secs: 468,
    cover_art_url: null,
    is_public: true,
    waveform_data: null,
    created_at: "2024-03-03T09:00:00.000Z",
    updated_at: "2024-03-03T09:00:00.000Z",
    tags: ["electronica", "uplifting"],
  },
  {
    id: "demo-nightfall",
    owner_id: "demo-user",
    title: "Nightfall Protocol",
    artist: "MetaWave",
    album_id: null,
    track_date: "2024-05-20T21:15:00.000Z",
    file_url: "https://example.com/nightfall.mp3",
    file_size: 5_300_000,
    duration_secs: 256,
    cover_art_url: null,
    is_public: true,
    waveform_data: null,
    created_at: "2024-05-21T11:20:00.000Z",
    updated_at: "2024-05-21T11:20:00.000Z",
    tags: ["synthwave", "instrumental"],
  },
  {
    id: "demo-murmur",
    owner_id: "demo-user",
    title: "Ocean Murmur",
    artist: "MetaWave",
    album_id: null,
    track_date: "2024-07-08T06:45:00.000Z",
    file_url: "https://example.com/ocean.mp3",
    file_size: 12_000_000,
    duration_secs: 642,
    cover_art_url: null,
    is_public: true,
    waveform_data: null,
    created_at: "2024-07-09T08:05:00.000Z",
    updated_at: "2024-07-09T08:05:00.000Z",
    tags: ["ambient", "longform"],
  },
  {
    id: "demo-embers",
    owner_id: "demo-user",
    title: "City Embers",
    artist: "MetaWave",
    album_id: null,
    track_date: "2024-09-14T19:00:00.000Z",
    file_url: "https://example.com/embers.mp3",
    file_size: 7_800_000,
    duration_secs: 384,
    cover_art_url: null,
    is_public: true,
    waveform_data: null,
    created_at: "2024-09-15T10:10:00.000Z",
    updated_at: "2024-09-15T10:10:00.000Z",
    tags: ["downtempo", "nocturnal"],
  },
  {
    id: "demo-horizon",
    owner_id: "demo-user",
    title: "Horizon Drift",
    artist: "MetaWave",
    album_id: null,
    track_date: "2024-11-01T12:00:00.000Z",
    file_url: "https://example.com/horizon.mp3",
    file_size: 4_900_000,
    duration_secs: 198,
    cover_art_url: null,
    is_public: true,
    waveform_data: null,
    created_at: "2024-11-02T07:45:00.000Z",
    updated_at: "2024-11-02T07:45:00.000Z",
    tags: ["chill", "instrumental"],
  },
];

export default function InsightsPage() {
  const router = useRouter();
  const { profile, loading } = useSessionProfile();
  const [tracks, setTracks] = useState<Track[] | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (process.env.NODE_ENV !== "production") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "1") {
        setDemoMode(true);
      }
    }
  }, []);

  useEffect(() => {
    if (!demoMode && !loading && profile === null) {
      router.replace("/login");
    }
  }, [demoMode, profile, loading, router]);

  useEffect(() => {
    if (demoMode) {
      setTracks(DEMO_TRACKS);
      return;
    }
    if (!profile) return;
    (async () => {
      try {
        const data = await getTracksByUser(profile.id);
        setTracks(data);
      } catch (error) {
        console.error("Failed to load tracks for insights", error);
        setTracks([]);
      }
    })();
  }, [demoMode, profile]);

  const activity = useMemo<ActivityPoint[]>(() => {
    if (!tracks?.length) return [];
    const map = new Map<string, { count: number; minutes: number; label: string }>();
    for (const track of tracks) {
      const source = track.track_date ?? track.created_at;
      const date = new Date(source);
      if (Number.isNaN(date.getTime())) continue;
      const key = format(date, "yyyy-MM");
      const label = format(date, "MMM yyyy");
      const entry = map.get(key) ?? { count: 0, minutes: 0, label };
      entry.count += 1;
      entry.minutes += (track.duration_secs ?? 0) / 60;
      entry.label = label;
      map.set(key, entry);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([month, value]) => ({
        month,
        label: value.label,
        uploads: value.count,
        minutes: value.minutes,
      }));
  }, [tracks]);

  const tagSlices = useMemo<TagSlice[]>(() => {
    if (!tracks?.length) return [];
    const tally = new Map<string, number>();
    tracks.forEach((track) => {
      (track.tags ?? []).forEach((tag) => {
        tally.set(tag, (tally.get(tag) ?? 0) + 1);
      });
    });
    return Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));
  }, [tracks]);

  const durationBuckets = useMemo<DurationBucket[]>(() => {
    if (!tracks?.length) return [];
    const buckets: { label: string; from: number; to: number | null; tracks: number }[] = [
      { label: "Under 2 min", from: 0, to: 120, tracks: 0 },
      { label: "2 – 5 min", from: 120, to: 300, tracks: 0 },
      { label: "5 – 10 min", from: 300, to: 600, tracks: 0 },
      { label: "Over 10 min", from: 600, to: null, tracks: 0 },
    ];

    tracks.forEach((track) => {
      const duration = track.duration_secs ?? 0;
      if (!duration) return;
      for (const bucket of buckets) {
        if (
          duration >= bucket.from &&
          (bucket.to === null || duration < bucket.to)
        ) {
          bucket.tracks += 1;
          break;
        }
      }
    });

    return buckets
      .filter((bucket) => bucket.tracks > 0)
      .map((bucket) => ({ bucket: bucket.label, tracks: bucket.tracks }));
  }, [tracks]);

  const totalDurationSecs = useMemo(
    () =>
      tracks?.reduce(
        (acc, track) => acc + (track.duration_secs ?? 0),
        0,
      ) ?? 0,
    [tracks],
  );

  const totalFileSize = useMemo(
    () =>
      tracks?.reduce((acc, track) => acc + (track.file_size ?? 0), 0) ?? 0,
    [tracks],
  );

  const tracksWithDuration = useMemo(
    () => tracks?.filter((track) => (track.duration_secs ?? 0) > 0) ?? [],
    [tracks],
  );

  const averageDuration = tracksWithDuration.length
    ? totalDurationSecs / tracksWithDuration.length
    : 0;

  const longestTracks = useMemo(() => {
    if (!tracksWithDuration.length) return [];
    return [...tracksWithDuration]
      .sort((a, b) => (b.duration_secs ?? 0) - (a.duration_secs ?? 0))
      .slice(0, 5);
  }, [tracksWithDuration]);

  const newestTrack = useMemo(() => {
    if (!tracks?.length) return null;
    return [...tracks].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];
  }, [tracks]);

  const mostUsedTag = tagSlices.length ? tagSlices[0] : null;

  const averageGapDays = useMemo(() => {
    if (!tracks?.length || tracks.length < 2) return null;
    const sorted = [...tracks].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    let gapTotal = 0;
    let gaps = 0;
    for (let index = 1; index < sorted.length; index += 1) {
      const previous = new Date(sorted[index - 1].created_at).getTime();
      const current = new Date(sorted[index].created_at).getTime();
      if (Number.isNaN(previous) || Number.isNaN(current)) continue;
      gapTotal += current - previous;
      gaps += 1;
    }
    if (!gaps) return null;
    return gapTotal / gaps / (1000 * 60 * 60 * 24);
  }, [tracks]);

  const firstActivityLabel = activity.length ? activity[0].label : null;
  const activeMonths = activity.length;

  const loadingState = tracks === null;

  return (
    <>
      <Head>
        <title>Catalog Insights - MetaWave</title>
        <meta
          name="description"
          content="Visualize catalog momentum, tag balance, and listening time across your MetaWave library."
        />
      </Head>
      <AppLayout>
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="mb-10 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                Insights
              </div>
              {demoMode && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Demo dataset
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Catalog Intelligence</h1>
                <p className="mt-1 max-w-2xl text-muted-foreground">
                  Understand how your uploads evolve, which tags define your sound, and where long-form listens live.
                </p>
              </div>
              {hydrated && tracks && (
                <span className="text-sm text-muted-foreground">
                  Last refreshed {formatDistanceToNow(new Date(), { addSuffix: true })}
                </span>
              )}
            </div>
          </div>

          {loadingState ? (
            <SummarySkeleton />
          ) : (
            <SummaryGrid
              totalTracks={tracks?.length ?? 0}
              totalDuration={totalDurationSecs}
              averageDuration={averageDuration}
              totalFileSize={totalFileSize}
              activeMonths={activeMonths}
              firstActivityLabel={firstActivityLabel}
              averageGapDays={averageGapDays}
              mostUsedTag={mostUsedTag?.name ?? null}
              newestTrackTitle={newestTrack?.title ?? null}
              newestTrackCreatedAt={newestTrack?.created_at ?? null}
            />
          )}

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card className="bg-card/70 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Release cadence</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Monthly uploads paired with cumulative minutes of music.
                </p>
              </CardHeader>
              <CardContent>
                {loadingState ? (
                  <ChartSkeleton />
                ) : (
                  <ActivityChart data={activity} />
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Tag distribution</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Highlights the 10 tags you lean on the most.
                </p>
              </CardHeader>
              <CardContent>
                {loadingState ? (
                  <ChartSkeleton />
                ) : (
                  <TagDistributionChart data={tagSlices} />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <Card className="bg-card/70 backdrop-blur lg:col-span-2">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Listening range</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Shows how many tracks land in each duration bracket.
                </p>
              </CardHeader>
              <CardContent>
                {loadingState ? (
                  <ChartSkeleton />
                ) : (
                  <DurationDistributionChart data={durationBuckets} />
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/70 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Longest sessions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Your top marathon tracks ranked by runtime.
                </p>
              </CardHeader>
              <CardContent>
                {loadingState ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : longestTracks.length ? (
                  <ol className="space-y-4">
                    {longestTracks.map((track, index) => (
                      <li key={track.id} className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium leading-tight">{track.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDuration(track.duration_secs ?? 0)} · Uploaded {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add track durations to surface your longest recordings.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    </>
  );
}

function SummarySkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="bg-card/60 backdrop-blur">
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-32" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SummaryGrid({
  totalTracks,
  totalDuration,
  averageDuration,
  totalFileSize,
  activeMonths,
  firstActivityLabel,
  averageGapDays,
  mostUsedTag,
  newestTrackTitle,
  newestTrackCreatedAt,
}: {
  totalTracks: number;
  totalDuration: number;
  averageDuration: number;
  totalFileSize: number;
  activeMonths: number;
  firstActivityLabel: string | null;
  averageGapDays: number | null;
  mostUsedTag: string | null;
  newestTrackTitle: string | null;
  newestTrackCreatedAt: string | null;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card className="bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tracks managed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalTracks}</div>
          <p className="mt-2 text-xs text-muted-foreground">
            {activeMonths ? (
              <>
                Active across {activeMonths} month{activeMonths > 1 ? "s" : ""}
                {firstActivityLabel ? ` since ${firstActivityLabel}` : ""}
              </>
            ) : (
              "Upload your first track to start the timeline."
            )}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Total listening time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalDuration ? formatDuration(totalDuration) : "—"}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Across {totalDuration ? tracksLabel(totalDuration, averageDuration) : "tracks awaiting duration data"}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Typical track length
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {averageDuration ? formatDuration(averageDuration) : "—"}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {averageGapDays
              ? `New music roughly every ${Math.round(averageGapDays)} day${Math.round(averageGapDays) === 1 ? "" : "s"}`
              : "Upload more tracks to map your cadence."}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card/60 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Storage footprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {totalFileSize ? formatFileSize(totalFileSize) : "—"}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {mostUsedTag ? (
              <>
                Core tag
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {mostUsedTag}
                </Badge>
              </>
            ) : newestTrackTitle ? (
              <>
                Latest upload
                <span className="font-medium text-foreground">{newestTrackTitle}</span>
                {newestTrackCreatedAt && (
                  <span>
                    ({formatDistanceToNow(new Date(newestTrackCreatedAt), {
                      addSuffix: true,
                    })})
                  </span>
                )}
              </>
            ) : (
              "Add tags to surface your signature sounds."
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function ChartPlaceholder({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0m";
  const totalSeconds = Math.round(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs ? `${secs}s` : ""}`.trim();
  }
  return `${secs}s`;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function tracksLabel(totalDuration: number, averageDuration: number) {
  if (totalDuration === 0) return "tracks awaiting duration data";
  if (averageDuration === 0) return "tracks with durations";
  const estimatedCount = Math.round(totalDuration / averageDuration);
  return `${estimatedCount} track${estimatedCount === 1 ? "" : "s"}`;
}
