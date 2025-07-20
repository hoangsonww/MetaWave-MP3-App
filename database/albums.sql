create table public.albums (
                               id uuid not null default gen_random_uuid (),
                               owner_id uuid not null,
                               title text not null,
                               description text null,
                               cover_art_url text null,
                               is_public boolean not null default false,
                               created_at timestamp with time zone not null default now(),
                               updated_at timestamp with time zone not null default now(),
                               constraint albums_pkey primary key (id),
                               constraint albums_owner_id_fkey foreign KEY (owner_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists albums_owner_id_idx on public.albums using btree (owner_id) TABLESPACE pg_default;
