create table public.album_tracks (
                                     album_id uuid not null,
                                     track_id uuid not null,
                                     position integer not null,
                                     added_at timestamp with time zone not null default now(),
                                     constraint album_tracks_pkey primary key (album_id, track_id),
                                     constraint album_tracks_album_id_fkey foreign KEY (album_id) references albums (id) on delete CASCADE,
                                     constraint album_tracks_track_id_fkey foreign KEY (track_id) references tracks (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists album_tracks_album_id_position_idx on public.album_tracks using btree (album_id, "position") TABLESPACE pg_default;
