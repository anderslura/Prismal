/**
 * Kaller Netlify Function som proxyer til Claude API.
 * API-nøkkel eksponeres aldri i frontend-koden.
 */
export async function genererTilbudstekst(skjema) {
  const respons = await fetch('/.netlify/functions/generer-tilbud', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firmanavn: skjema.firmanavn,
      kundenavn: skjema.kundenavn,
      kundeAdresse: skjema.kundeAdresse,
      beskrivelse: skjema.beskrivelse,
      timer: skjema.timer,
      timepris: skjema.timepris,
      materialer: skjema.materialer,
    }),
  })

  if (!respons.ok) {
    const data = await respons.json().catch(() => ({}))
    throw new Error(data.feil || 'Ukjent feil fra server')
  }

  const data = await respons.json()
  return data.tekst
}
