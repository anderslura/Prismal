-- ============================================================
-- Prismal – materialbibliotek med RLS
-- Kjør i Supabase SQL Editor: prosjekt hqgjcqvnmwixmscxlakk
-- ============================================================

create table if not exists public.materialer (
  id           uuid        default gen_random_uuid() primary key,
  bruker_id    uuid        references auth.users(id) on delete cascade not null,
  navn         text        not null,
  pris         numeric     default 0,
  has_paaslag  boolean     default true,
  sist_brukt   timestamptz default now(),
  unique (bruker_id, navn)
);

-- RLS: kun eier ser og endrer sine materialer
alter table public.materialer enable row level security;

create policy "Bruker ser egne materialer"
  on public.materialer for select
  using (auth.uid() = bruker_id);

create policy "Bruker oppretter egne materialer"
  on public.materialer for insert
  with check (auth.uid() = bruker_id);

create policy "Bruker oppdaterer egne materialer"
  on public.materialer for update
  using (auth.uid() = bruker_id);

create policy "Bruker sletter egne materialer"
  on public.materialer for delete
  using (auth.uid() = bruker_id);

-- Indeks for rask navn-søk og sortering på sist brukt
create index if not exists materialer_navn_idx    on public.materialer (bruker_id, navn);
create index if not exists materialer_brukt_idx   on public.materialer (bruker_id, sist_brukt desc);
