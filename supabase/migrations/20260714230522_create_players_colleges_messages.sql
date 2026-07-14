-- MatchPoint Week 1: core tables

create table public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nationality text,
  graduation_year integer,
  utr numeric(4, 2),
  bio text,
  created_at timestamptz not null default now()
);

create table public.colleges (
  id uuid primary key default gen_random_uuid(),
  school_name text not null,
  division text,
  location text,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players (id) on delete cascade,
  college_id uuid not null references public.colleges (id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index messages_player_id_idx on public.messages (player_id);
create index messages_college_id_idx on public.messages (college_id);
