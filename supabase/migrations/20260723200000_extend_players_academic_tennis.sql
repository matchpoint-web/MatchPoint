-- Extend players with academic + tennis recruiting fields shown on Player Profile

alter table public.players
  add column if not exists high_school text,
  add column if not exists sat integer,
  add column if not exists toefl integer,
  add column if not exists ielts numeric(2, 1),
  add column if not exists duolingo integer,
  add column if not exists intended_major text,
  add column if not exists usta_ranking text,
  add column if not exists itf_ranking text,
  add column if not exists national_ranking text,
  add column if not exists preferred_ncaa_division text;

comment on column public.players.high_school is 'Player high school name';
comment on column public.players.sat is 'SAT total score (typically 400–1600)';
comment on column public.players.toefl is 'TOEFL iBT score (typically 0–120)';
comment on column public.players.ielts is 'IELTS overall band (typically 0–9)';
comment on column public.players.duolingo is 'Duolingo English Test score (typically 10–160)';
comment on column public.players.intended_major is 'Intended college major';
comment on column public.players.usta_ranking is 'USTA ranking (free-text for national/regional formats)';
comment on column public.players.itf_ranking is 'ITF ranking (free-text)';
comment on column public.players.national_ranking is 'National ranking (free-text)';
comment on column public.players.preferred_ncaa_division is 'Preferred NCAA / NAIA / JUCO division';
