/**
 * Netlify Function: /api/create-portal
 * Oppretter en Stripe Customer Portal-sesjon for abonnementsadministrasjon.
 * Pro-brukere kan endre betalingsmetode, se fakturaer og kansellere abonnement.
 *
 * Påkrevde Netlify-miljøvariabler:
 *   STRIPE_SECRET_KEY — fra Stripe-dashboardet
 *
 * NB: Customer Portal må aktiveres i Stripe-dashboardet:
 *   Stripe → Settings → Billing → Customer portal → Activate
 */

const Stripe = require('stripe')

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ feil: 'Metode ikke tillatt' }) }
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  if (!stripeKey) {
    return { statusCode: 500, body: JSON.stringify({ feil: 'Stripe-konfigurasjon mangler' }) }
  }

  let data
  try {
    data = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ feil: 'Ugyldig JSON i forespørsel' }) }
  }

  const { stripe_customer_id } = data

  if (!stripe_customer_id) {
    return { statusCode: 400, body: JSON.stringify({ feil: 'stripe_customer_id er påkrevd' }) }
  }

  const stripe = Stripe(stripeKey)

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer:   stripe_customer_id,
      return_url: 'https://prismal.no/',
    })

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (e) {
    console.error('Stripe portal-feil:', e.message)
    return { statusCode: 500, body: JSON.stringify({ feil: 'Kunne ikke åpne abonnementsportal' }) }
  }
}
