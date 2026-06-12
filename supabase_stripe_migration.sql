-- ============================================================
-- Prismal — Stripe-integrasjon: migrasjon av profiles-tabell
-- Kjør dette i Supabase SQL-editor (én gang)
-- ============================================================

-- Legg til Pro-status og Stripe-kunde-ID
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pro BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Indeks for rask oppdatering fra webhook (customer.subscription.deleted)
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id
  ON profiles (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Bekreft at kolonnene finnes
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('pro', 'stripe_customer_id');
