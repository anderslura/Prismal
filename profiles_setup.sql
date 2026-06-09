-- ── Profiles: teller generasjoner per bruker ──────────────────────────
create table if not exists profiles (
  bruker_id          uuid primary key references auth.users(id) on delete cascade,
  generasjoner_brukt int  not null default 0,
  opprettet          timestamptz default now()
);

-- RLS
alter table profiles enable row level security;

drop policy if exists "Les egen profil"    on profiles;
drop policy if exists "Oppdater egen profil" on profiles;

create policy "Les egen profil"
  on profiles for select
  using (auth.uid() = bruker_id);

create policy "Oppdater egen profil"
  on profiles for update
  using (auth.uid() = bruker_id);

-- Auto-opprett profil ved ny bruker
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (bruker_id)
  values (new.id)
  on conflict (bruker_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Backfill eksisterende brukere
insert into profiles (bruker_id)
select id from auth.users
on conflict (bruker_id) do nothing;
