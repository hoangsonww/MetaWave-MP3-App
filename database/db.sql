-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- 1. Profiles: use auth.users.id as primary key
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
                                 id           uuid       PRIMARY KEY
                                     REFERENCES auth.users(id) ON DELETE CASCADE,
                                 email        citext     NOT NULL UNIQUE,
                                 name         text       NOT NULL,
                                 dob          date,
                                 bio          text,
                                 avatar_url   text,
                                 handle       citext     NOT NULL UNIQUE,
                                 created_at   timestamptz NOT NULL DEFAULT now(),
                                 updated_at   timestamptz NOT NULL DEFAULT now()
);

-- 2. Albums
DROP TABLE IF EXISTS public.albums CASCADE;
CREATE TABLE public.albums (
                               id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
                               owner_id      uuid        NOT NULL
                                   REFERENCES public.profiles(id) ON DELETE CASCADE,
                               title         text        NOT NULL,
                               description   text,
                               cover_art_url text,
                               is_public     boolean     NOT NULL DEFAULT FALSE,
                               created_at    timestamptz NOT NULL DEFAULT now(),
                               updated_at    timestamptz NOT NULL DEFAULT now()
);

-- 3. Tracks
DROP TABLE IF EXISTS public.tracks CASCADE;
CREATE TABLE public.tracks (
                               id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
                               owner_id       uuid        NOT NULL
                                   REFERENCES public.profiles(id) ON DELETE CASCADE,
                               title          text        NOT NULL,
                               artist         text,
                               album_id       uuid        REFERENCES public.albums(id) ON DELETE SET NULL,
                               track_date     date,
                               file_url       text        NOT NULL,
                               file_size      bigint,
                               duration_secs  integer,
                               cover_art_url  text,
                               is_public      boolean     NOT NULL DEFAULT FALSE,
                               waveform_data  jsonb,
                               created_at     timestamptz NOT NULL DEFAULT now(),
                               updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 4. Album ↔ Track ordering
DROP TABLE IF EXISTS public.album_tracks CASCADE;
CREATE TABLE public.album_tracks (
                                     album_id   uuid        NOT NULL
                                         REFERENCES public.albums(id) ON DELETE CASCADE,
                                     track_id   uuid        NOT NULL
                                         REFERENCES public.tracks(id) ON DELETE CASCADE,
                                     position   integer     NOT NULL,
                                     added_at   timestamptz NOT NULL DEFAULT now(),
                                     PRIMARY KEY (album_id, track_id)
);

-- 5. Tags
DROP TABLE IF EXISTS public.tags CASCADE;
CREATE TABLE public.tags (
                             id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
                             owner_id     uuid        NOT NULL
                                 REFERENCES public.profiles(id) ON DELETE CASCADE,
                             name         text        NOT NULL,
                             category     text,
                             created_at   timestamptz NOT NULL DEFAULT now(),
                             updated_at   timestamptz NOT NULL DEFAULT now(),
                             UNIQUE (owner_id, name)
);

-- 6. Track ↔ Tag pivot
DROP TABLE IF EXISTS public.track_tags CASCADE;
CREATE TABLE public.track_tags (
                                   track_id   uuid        NOT NULL
                                       REFERENCES public.tracks(id) ON DELETE CASCADE,
                                   tag_id     uuid        NOT NULL
                                       REFERENCES public.tags(id) ON DELETE CASCADE,
                                   tagged_at  timestamptz NOT NULL DEFAULT now(),
                                   PRIMARY KEY (track_id, tag_id)
);

-- 7. Indexes
CREATE INDEX ON public.profiles    USING btree(handle);
CREATE INDEX ON public.profiles    USING btree(name);
CREATE INDEX ON public.albums      USING btree(owner_id);
CREATE INDEX ON public.tracks      USING btree(owner_id);
CREATE INDEX ON public.tracks      USING btree(album_id);
CREATE INDEX ON public.album_tracks(album_id, position);
CREATE INDEX ON public.tags        USING btree(owner_id);
