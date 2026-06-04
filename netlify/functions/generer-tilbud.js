/**
 * Netlify Function: /api/generer-tilbud
 * Proxyer kall til Claude API for å generere profesjonell tilbudstekst.
 * API-nøkkel holdes server-side og eksponeres aldri til klienten.
 */

exports.handler = async (event) => {
  // Kun POST tillatt
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ feil: 'Metode ikke tillatt' }) }
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ feil: 'API-nøkkel mangler på server' }) }
  }

  let data
  try {
    data = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, body: JSON.stringify({ feil: 'Ugyldig JSON i forespørsel' }) }
  }

  const { firmanavn, kundenavn, kundeAdresse, beskrivelse, arbeidere, materialer } = data
  const totalArbeid2 = (arbeidere||[]).reduce((s,a) => s+(parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)

  // Bygg prompt
  const totalArbeid = totalArbeid2
  const totalMaterialer = (materialer || []).reduce((s, m) => s + (parseFloat(m.pris) || 0), 0)
  const totalSum = totalArbeid + totalMaterialer

  const materialListe = (materialer || []).length > 0
    ? (materialer || []).map(m => `- ${m.navn}: ${m.pris} kr`).join('\n')
    : 'Ingen materialer spesifisert'

  const prompt = `Du er en profesjonell norsk håndverker som skriver tilbud til kunder. Skriv en kortfattet, profesjonell og tillitsvekkende tilbudstekst på norsk bokmål.

DETALJER OM OPPDRAGET:
- Firma: ${firmanavn || 'Håndverkerbedrift'}
- Kunde: ${kundenavn}${kundeAdresse ? `, ${kundeAdresse}` : ''}
- Oppdrag: ${beskrivelse || 'Se prisoversikt'}
- Arbeid: ${(arbeidere||[]).filter(a=>a.timer).map(a=>`${a.timer}t à ${a.timepris}kr/t`).join(', ') || 'Se prisoversikt'}
- Materialer:
${materialListe}
- Estimert totalsum eks. mva: ${totalSum.toLocaleString('no-NO')} kr

INSTRUKSJONER:
- Skriv 3–4 korte avsnitt med vanlig tekst
- Start med en høflig innledning til kunden ved navn
- Beskriv hva som skal gjøres og hvordan dere vil utføre det
- Nevn eventuelle forbehold (f.eks. uforutsette forhold under arbeidet)
- Avslutt med en enkel oppfordring til å ta kontakt — IKKE inkluder telefonnummer, e-post eller firmanavn på slutten, det er allerede på tilbudet
- IKKE bruk markdown (ingen #, **, *, eller lignende formatering)
- IKKE bruk plassholdere som [Telefonnummer] eller [E-postadresse]
- Ren løpende tekst, ingen overskrifter
- Profesjonell, varm og norsk tone
- Maks 60 ord, 3 korte avsnitt`

  try {
    const respons = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!respons.ok) {
      const feil = await respons.text()
      console.error('Claude API-feil:', feil)
      return { statusCode: 502, body: JSON.stringify({ feil: 'Feil fra AI-tjeneste' }) }
    }

    const json = await respons.json()
    const tekst = json.content?.[0]?.text || ''

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tekst }),
    }
  } catch (e) {
    console.error('Nettverksfeil mot Claude API:', e)
    return { statusCode: 500, body: JSON.stringify({ feil: 'Intern serverfeil' }) }
  }
}
