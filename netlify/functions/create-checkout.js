/**
 * Netlify Function: /api/create-checkout
 * Oppretter en Stripe Checkout Session for Prismal Pro-abonnement.
 * Returnerer en URL som frontend redirecter brukeren til.
 *
 * Påkrevde Netlify-miljøvariabler:
 *   STRIPE_SECRET_KEY   — fra Stripe-dashboardet
 *   STRIPE_PRICE_ID     — månedlig pris for Prismal Pro
 */

const Stripe = require('stripe')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ feil: 'Metode ikke tillatt' }) }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const priceId   = process.env.STRIPE_PRICE_ID

  if (!stripeKey || !priceId) {
    console.error('Mangler STRIPE_SECRET_KEY eller STRIPE_PRICE_ID')
    return { statusCode: 500, body: JSON.stringify({ feil: 'Stripe-konfigurasjon mangler på server' }) }
  }

  let data
  try {
    data = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ feil: 'Ugyldig JSON i forespørsel' }) }
  }

  const { epost, bruker_id, stripe_customer_id } = data

  if (!epost || !bruker_id) {
    return { statusCode: 400, body: JSON.stringify({ feil: 'epost og bruker_id er påkrevd' }) }
  }

  const stripe = Stripe(stripeKey)

  try {
    const sessionParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      // bruker_id lagres i metadata slik at webhook kan koble betaling til riktig profil
      metadata: { bruker_id },
      success_url: 'https://prismal.no/?pro=suksess',
      cancel_url:  'https://prismal.no/?pro=avbrutt',
      // Norsk lokalisering i Stripe Checkout
      locale: 'nb',
    }

    // Bruk eksisterende Stripe-kunde for å unngå duplikater ved re-abonnement
    if (stripe_customer_id) {
      sessionParams.customer = stripe_customer_id
    } else {
      sessionParams.customer_email = epost
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (e) {
    console.error('Stripe checkout-feil:', e.message)
    return { statusCode: 500, body: JSON.stringify({ feil: 'Kunne ikke opprette betalingsøkt' }) }
  }
}
