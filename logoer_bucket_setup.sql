-- ============================================================
-- Prismal – Supabase Storage bucket for logoer
-- Kjør i Supabase SQL Editor: prosjekt hqgjcqvnmwixmscxlakk
-- ============================================================

-- Opprett public bucket (filer tilgjengelig via URL uten auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'logoer',
  'logoer',
  true,
  2097152, -- 2 MB maks per fil (komprimert logo er alltid godt under)
  array['image/png','image/jpeg','image/webp','image/svg+xml']
)
on conflict (id) do nothing;

-- RLS: bruker kan laste opp/oppdatere/slette kun i sin egen mappe (user_id/logo.*)
create policy "Bruker laster opp egen logo"
  on storage.objects for insert
  with check (
    bucket_id = 'logoer'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Bruker oppdaterer egen logo"
  on storage.objects for update
  using (
    bucket_id = 'logoer'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Bruker sletter egen logo"
  on storage.objects for delete
  using (
    bucket_id = 'logoer'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Alle kan lese (public bucket – nødvendig for PDF-visning)
create policy "Alle kan se logoer"
  on storage.objects for select
  using (bucket_id = 'logoer');
