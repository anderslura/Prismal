-- ============================================================
-- Prismal – firma-tabell med RLS
-- Kjør i Supabase SQL Editor: prosjekt hqgjcqvnmwixmscxlakk
-- ============================================================

create table if not exists public.firma (
  bruker_id    uuid        references auth.users(id) on delete cascade primary key,
  firmanavn    text,
  telefon      text,
  epost        text,
  adresse      text,
  orgnr        text,
  nettside     text,
  logo_url     text,
  oppdatert_at timestamptz default now()
);

-- Row Level Security: kun eier ser og endrer sin rad
alter table public.firma enable row level security;

create policy "Bruker ser eget firma"
  on public.firma for select
  using (auth.uid() = bruker_id);

create policy "Bruker oppretter eget firma"
  on public.firma for insert
  with check (auth.uid() = bruker_id);

create policy "Bruker oppdaterer eget firma"
  on public.firma for update
  using (auth.uid() = bruker_id);

create policy "Bruker sletter eget firma"
  on public.firma for delete
  using (auth.uid() = bruker_id);

-- Automatisk oppdatert_at
create or replace function public.set_firma_oppdatert_at()
  returns trigger language plpgsql as $$
begin
  new.oppdatert_at = now();
  return new;
end;
$$;

drop trigger if exists firma_oppdatert_at on public.firma;
create trigger firma_oppdatert_at
  before update on public.firma
  for each row execute function public.set_firma_oppdatert_at();
