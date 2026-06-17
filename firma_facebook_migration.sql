-- ============================================================
-- Prismal – legg til Facebook-felt på firma-tabellen
-- Kjør i Supabase SQL Editor: prosjekt hqgjcqvnmwixmscxlakk
-- ============================================================

alter table public.firma
  add column if not exists facebook_navn text,
  add column if not exists facebook_url text;
