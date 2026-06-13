exports.handler = async (event) => {
  console.log('STEP 1: handler started, method:', event.httpMethod)

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  console.log('STEP 2: parsing body, length:', (event.body || '').length)

  let body
  try {
    body = JSON.parse(event.body)
  } catch (e) {
    console.error('STEP 2 FAIL - JSON parse error:', e.message)
    return { statusCode: 400, body: JSON.stringify({ error: 'Ugyldig JSON' }) }
  }

  const { tilEpost, skjema, pdfBase64, brukerEpost, isPro } = body
  console.log('STEP 3: parsed OK, tilEpost:', tilEpost, 'pdfBase64 length:', (pdfBase64 || '').length)

  if (!tilEpost || !pdfBase64 || !skjema) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Mangler påkrevde felt' }) }
  }

  console.log('STEP 4: building Resend payload')

  const resendPayload = {
    from: 'Prismal <kontakt@prismal.no>',
    to: [tilEpost],
    subject: `Tilbud nr. ${skjema.tilbudsnummer} fra ${skjema.firmanavn || 'Prismal'}`,
    html: `<p>Hei ${skjema.kundenavn || ''},</p><p>Vedlagt finner du tilbud nr. <strong>${skjema.tilbudsnummer}</strong>. Tilbudet er gyldig i 30 dager.</p>`,
    attachments: [{ filename: 'tilbud.pdf', content: pdfBase64 }],
  }

  if (brukerEpost) {
    resendPayload.reply_to = brukerEpost
    resendPayload.cc = [brukerEpost]
  }

  console.log('STEP 5: calling Resend API, key present:', !!process.env.RESEND_API_KEY)

  let resendData
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendPayload),
    })
    console.log('STEP 6: Resend responded, status:', res.status)
    const text = await res.text()
    console.log('STEP 7: Resend body:', text.substring(0, 200))
    try { resendData = JSON.parse(text) } catch { resendData = { raw: text } }
    if (!res.ok) throw new Error(resendData?.message || resendData?.raw || `HTTP ${res.status}`)
  } catch (err) {
    console.error('STEP 5 FAIL - Resend error:', err.message)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    }
  }

  console.log('STEP 8: success, id:', resendData?.id)
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, id: resendData?.id }),
  }
}
