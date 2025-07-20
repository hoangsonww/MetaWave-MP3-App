create table public.tags (
                             id uuid not null default gen_random_uuid (),
                             owner_id uuid not null,
                             name text not null,
                             category text null,
                             created_at timestamp with time zone not null default now(),
                             updated_at timestamp with time zone not null default now(),
                             constraint tags_pkey primary key (id),
                             constraint tags_owner_id_name_key unique (owner_id, name),
                             constraint tags_owner_id_fkey foreign KEY (owner_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists tags_owner_id_idx on public.tags using btree (owner_id) TABLESPACE pg_default;
