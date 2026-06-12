/**
 * Netlify Function: /api/stripe-webhook
 * Mottar og verifiserer Stripe-webhooks. Oppdaterer pro-status i Supabase.
 *
 * Påkrevde Netlify-miljøvariabler:
 *   STRIPE_SECRET_KEY        — fra Stripe-dashboardet
 *   STRIPE_WEBHOOK_SECRET    — signeringsnøkkel fra webhook-oppsettet i Stripe
 *   SUPABASE_URL             — https://hqgjcqvnmwixmscxlakk.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (ikke anon key!) fra Supabase Settings → API
 *
 * Stripe-events som håndteres:
 *   checkout.session.completed      → setter pro=true og lagrer stripe_customer_id
 *   customer.subscription.deleted   → setter pro=false (abonnement avsluttet/kansellert)
 */

const Stripe = require('stripe')
const { createClient } = require('@supabase/supabase-js')

exports.handler = async (event) => {
  // Kun POST fra Stripe
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Metode ikke tillatt' }
  }

  const stripeKey       = process.env.STRIPE_SECRET_KEY
  const webhookSecret   = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl     = process.env.SUPABASE_URL
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseService) {
    console.error('Mangler én eller flere miljøvariabler for Stripe-webhook')
    return { statusCode: 500, body: 'Konfigurasjon mangler på server' }
  }

  const stripe   = Stripe(stripeKey)
  const supabase = createClient(supabaseUrl, supabaseService)

  // ── Verifiser Stripe-signatur ───────────────────────────────────────
  // event.body er rå request-body som string — påkrevd for signaturverifisering
  let webhookEvent
  try {
    webhookEvent = stripe.webhooks.constructEvent(
      event.body,
      event.headers['stripe-signature'],
      webhookSecret
    )
  } catch (e) {
    console.error('Stripe signaturverifisering feilet:', e.message)
    return { statusCode: 400, body: `Ugyldig webhook-signatur: ${e.message}` }
  }

  const obj = webhookEvent.data.object

  // ── checkout.session.completed → aktiver Pro ────────────────────────
  if (webhookEvent.type === 'checkout.session.completed') {
    const bruker_id        = obj.metadata?.bruker_id
    const stripe_customer_id = obj.customer

    if (!bruker_id) {
      console.error('bruker_id mangler i checkout session metadata — kan ikke oppdatere profil')
      // Returnerer 200 for å unngå at Stripe prøver på nytt (dette er en programmeringsfeil, ikke en transient feil)
      return { statusCode: 200, body: JSON.stringify({ advarsel: 'bruker_id mangler' }) }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ pro: true, stripe_customer_id })
      .eq('bruker_id', bruker_id)

    if (error) {
      console.error('Supabase-feil ved Pro-aktivering:', error.message)
      return { statusCode: 500, body: 'Databasefeil — Stripe vil prøve igjen' }
    }

    console.log(`✓ Pro aktivert for bruker_id=${bruker_id} (Stripe-kunde: ${stripe_customer_id})`)
  }

  // ── customer.subscription.deleted → deaktiver Pro ──────────────────
  if (webhookEvent.type === 'customer.subscription.deleted') {
    const stripe_customer_id = obj.customer

    const { error } = await supabase
      .from('profiles')
      .update({ pro: false })
      .eq('stripe_customer_id', stripe_customer_id)

    if (error) {
      console.error('Supabase-feil ved Pro-deaktivering:', error.message)
      return { statusCode: 500, body: 'Databasefeil — Stripe vil prøve igjen' }
    }

    console.log(`✓ Pro deaktivert for Stripe-kunde=${stripe_customer_id}`)
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mottatt: true }),
  }
}
