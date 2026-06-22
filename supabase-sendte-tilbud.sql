-- Kjør dette i Supabase SQL Editor
-- Table: sendte_tilbud

create table if not exists sendte_tilbud (
  id            uuid primary key default gen_random_uuid(),
  bruker_id     uuid references auth.users(id) on delete set null,
  tilbudsnummer text,
  kundenavn     text,
  kunde_epost   text not null,
  firma_epost   text,
  sendt_dato    timestamptz not null default now(),
  resend_id     text
);

-- Row Level Security
alter table sendte_tilbud enable row level security;

-- Brukere ser kun egne sendte tilbud
create policy "Eier kan lese"
  on sendte_tilbud for select
  using (auth.uid() = bruker_id);

-- Brukere kan slette egne rader (f.eks. test-/feiltilbud i historikken)
create policy "Eier kan slette"
  on sendte_tilbud for delete
  using (auth.uid() = bruker_id);

-- Backend (service_role) kan skrive
-- (service_role bypasser RLS automatisk)

-- Index for rask oppslag per bruker
create index if not exists idx_sendte_tilbud_bruker_id on sendte_tilbud(bruker_id);
create index if not exists idx_sendte_tilbud_sendt_dato on sendte_tilbud(sendt_dato desc);
