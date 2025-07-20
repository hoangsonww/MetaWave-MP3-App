-- 1) Add the tags column (defaults to empty array)
ALTER TABLE public.tracks
    ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- 2) Create a GIN index so you can efficiently query/filter by tags
CREATE INDEX IF NOT EXISTS tracks_tags_idx
    ON public.tracks
    USING GIN (tags);
