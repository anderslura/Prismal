-- ============================================================
-- Prismal – legg til mva_pliktig på firma-tabellen
-- Kjør i Supabase SQL Editor: prosjekt hqgjcqvnmwixmscxlakk
-- ============================================================

alter table public.firma
  add column if not exists mva_pliktig boolean not null default true;
