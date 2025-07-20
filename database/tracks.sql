create table public.tracks (
                               id uuid not null default gen_random_uuid (),
                               owner_id uuid not null,
                               title text not null,
                               artist text null,
                               album_id uuid null,
                               track_date date null,
                               file_url text not null,
                               file_size bigint null,
                               duration_secs integer null,
                               cover_art_url text null,
                               is_public boolean not null default false,
                               waveform_data jsonb null,
                               created_at timestamp with time zone not null default now(),
                               updated_at timestamp with time zone not null default now(),
                               constraint tracks_pkey primary key (id),
                               constraint tracks_album_id_fkey foreign KEY (album_id) references albums (id) on delete set null,
                               constraint tracks_owner_id_fkey foreign KEY (owner_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists tracks_owner_id_idx on public.tracks using btree (owner_id) TABLESPACE pg_default;

create index IF not exists tracks_album_id_idx on public.tracks using btree (album_id) TABLESPACE pg_default;
