create table public.track_tags (
                                   track_id uuid not null,
                                   tag_id uuid not null,
                                   tagged_at timestamp with time zone not null default now(),
                                   constraint track_tags_pkey primary key (track_id, tag_id),
                                   constraint track_tags_tag_id_fkey foreign KEY (tag_id) references tags (id) on delete CASCADE,
                                   constraint track_tags_track_id_fkey foreign KEY (track_id) references tracks (id) on delete CASCADE
) TABLESPACE pg_default;
