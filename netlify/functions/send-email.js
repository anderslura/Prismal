const { createClient } = require('@supabase/supabase-js')

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

  const { tilEpost, skjema, pdfBase64, brukerEpost, bruker_id, isPro } = body

  if (!tilEpost || !pdfBase64 || !skjema) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Mangler påkrevde felt' }) }
  }

  const filnavn = `Tilbud-${skjema.tilbudsnummer}-${(skjema.kundenavn || 'kunde').replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
  const fraAdr = isPro
    ? `${(skjema.firmanavn || 'Tilbud').substring(0, 50)} via Prismal <kontakt@prismal.no>`
    : 'Prismal Tilbud <kontakt@prismal.no>'

  const firmaEpost = skjema.firmaEpost || ''

  let resendData
  try {
    const payload = {
      from: fraAdr,
      to: [tilEpost],
      subject: `Tilbud nr. ${skjema.tilbudsnummer} fra ${skjema.firmanavn || 'Prismal'}`,
      html: byggHtml(skjema, isPro),
      attachments: [{ filename: filnavn, content: pdfBase64 }],
    }

    // Svar-til og kopi går alltid til firma-epost (ikke login-epost)
    if (firmaEpost) {
      payload.reply_to = firmaEpost
      payload.cc = [firmaEpost]
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
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

  // Lagre i Supabase (non-blocking)
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      await sb.from('sendte_tilbud').insert({
        bruker_id: bruker_id || null,
        tilbudsnummer: skjema.tilbudsnummer,
        kundenavn: skjema.kundenavn || null,
        kunde_epost: tilEpost,
        firma_epost: brukerEpost || skjema.firmaEpost || null,
        sendt_dato: new Date().toISOString(),
        resend_id: resendData?.id || null,
      })
    } catch (e) {
      console.error('Supabase-lagring feilet:', e.message)
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ok: true, id: resendData?.id }),
  }
}

function byggHtml(skjema, isPro) {
  const firma = isPro ? (skjema.firmanavn || 'Prismal') : 'Prismal'
  // Kun kort intro — alle detaljer og priser er i PDF-vedlegget
  return `<!DOCTYPE html>
<html lang="no"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#f4f4f7">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;max-width:600px">
      <tr><td style="background:#1e3aaa;padding:28px 32px;color:#fff">
        <p style="margin:0;font-size:12px;opacity:.7">TILBUD</p>
        <h1 style="margin:4px 0 0;font-size:22px">${firma}</h1>
      </td></tr>
      <tr><td style="padding:28px 32px 32px">
        <p style="margin:0;color:#374151;font-size:15px">Hei ${skjema.kundenavn || ''},</p>
        <p style="margin:12px 0 0;color:#374151;font-size:15px;line-height:1.5">
          Vedlagt finner du tilbud nr. <strong>${skjema.tilbudsnummer}</strong> datert ${skjema.dato}.
          Tilbudet er gyldig i 30 dager.
        </p>
        <p style="margin:16px 0 0;color:#374151;font-size:14px">
          Svar på denne e-posten for å godta tilbudet, eller ta kontakt ved spørsmål.
        </p>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
          ${isPro ? `${firma} · ${skjema.firmaEpost || ''} · ${skjema.firmaTelefon || ''}` : 'Sendt med Prismal — prismal.no'}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}
