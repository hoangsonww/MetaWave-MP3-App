create table public.profiles (
                                 id uuid not null,
                                 email public.citext not null,
                                 name text not null,
                                 dob date null,
                                 bio text null,
                                 avatar_url text null,
                                 handle public.citext not null,
                                 created_at timestamp with time zone not null default now(),
                                 updated_at timestamp with time zone not null default now(),
                                 full_name text null,
                                 condition_tags text[] not null default array[]::text[],
                                 constraint profiles_pkey primary key (id),
                                 constraint profiles_email_key unique (email),
                                 constraint profiles_handle_key unique (handle),
                                 constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists profiles_handle_idx on public.profiles using btree (handle) TABLESPACE pg_default;

create index IF not exists profiles_name_idx on public.profiles using btree (name) TABLESPACE pg_default;
