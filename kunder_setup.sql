-- ============================================================
-- Prismal – kunder-tabell med RLS
-- Kjør i Supabase SQL Editor: prosjekt hqgjcqvnmwixmscxlakk
-- ============================================================

create table if not exists public.kunder (
  id           uuid        default gen_random_uuid() primary key,
  bruker_id    uuid        references auth.users(id) on delete cascade not null,
  mobil        text        not null,
  navn         text,
  adresse      text,
  epost        text,
  opprettet_at timestamptz default now(),
  oppdatert_at timestamptz default now(),
  unique (bruker_id, mobil)
);

-- Row Level Security: hver bruker ser kun sine egne kunder
alter table public.kunder enable row level security;

create policy "Bruker ser egne kunder"
  on public.kunder for select
  using (auth.uid() = bruker_id);

create policy "Bruker oppretter egne kunder"
  on public.kunder for insert
  with check (auth.uid() = bruker_id);

create policy "Bruker oppdaterer egne kunder"
  on public.kunder for update
  using (auth.uid() = bruker_id);

create policy "Bruker sletter egne kunder"
  on public.kunder for delete
  using (auth.uid() = bruker_id);

-- Automatisk oppdatering av oppdatert_at ved UPDATE
create or replace function public.set_oppdatert_at()
  returns trigger language plpgsql as $$
begin
  new.oppdatert_at = now();
  return new;
end;
$$;

drop trigger if exists kunder_oppdatert_at on public.kunder;
create trigger kunder_oppdatert_at
  before update on public.kunder
  for each row execute function public.set_oppdatert_at();

-- Indeks for raskere navn-søk
create index if not exists kunder_navn_idx on public.kunder (bruker_id, navn);
