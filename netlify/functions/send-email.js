exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  let body
  try {
    body = JSON.parse(event.body)
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Ugyldig JSON' }) }
  }

  const { tilEpost, skjema, pdfBase64, brukerEpost, isPro } = body

  if (!tilEpost || !pdfBase64 || !skjema) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Mangler påkrevde felt' }) }
  }

  const filnavn = `Tilbud-${skjema.tilbudsnummer}-${(skjema.kundenavn || 'kunde').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
  const fraAdr = isPro
    ? `${(skjema.firmanavn || 'Tilbud').substring(0, 50)} via Prismal <kontakt@prismal.no>`
    : 'Prismal Tilbud <kontakt@prismal.no>'

  const resendPayload = {
    from: fraAdr,
    to: [tilEpost],
    subject: `Tilbud nr. ${skjema.tilbudsnummer} fra ${skjema.firmanavn || 'Prismal'}`,
    html: `<p>Hei ${skjema.kundenavn || ''},</p><p>Vedlagt finner du tilbud nr. <strong>${skjema.tilbudsnummer}</strong>. Tilbudet er gyldig i 30 dager.</p>`,
    attachments: [{ filename: filnavn, content: pdfBase64 }],
  }

  if (brukerEpost) {
    resendPayload.reply_to = brukerEpost
    resendPayload.cc = [brukerEpost]
  }

  let resendData
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })
    const text = await res.text()
    try { resendData = JSON.parse(text) } catch { resendData = { raw: text } }
    if (!res.ok) throw new Error(resendData?.message || resendData?.raw || `HTTP ${res.status}`)
  } catch (err) {
    console.error('Resend feil:', err.message)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, id: resendData?.id }),
  }
}
