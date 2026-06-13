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

  const resendPayload = {
    from: fraAdr,
    to: [tilEpost],
    subject: `Tilbud nr. ${skjema.tilbudsnummer} fra ${skjema.firmanavn || 'Prismal'}`,
    html: byggHtml(skjema, isPro),
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
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
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
  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMat = (skjema.materialer || []).reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.antall)||1)*(parseFloat(m.pris)||0)), 0)
  const paaslag = totalMat * (parseFloat(skjema.paaslagProsent)||0) / 100
  const eksMva = totalArbeid + totalMat + paaslag

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
      <tr><td style="padding:28px 32px">
        <p style="margin:0;color:#374151">Hei ${skjema.kundenavn || ''},</p>
        <p style="margin:12px 0 0;color:#374151">
          Vedlagt finner du tilbud nr. <strong>${skjema.tilbudsnummer}</strong> datert ${skjema.dato}.
          Tilbudet er gyldig i 30 dager.
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 24px">
        <table width="100%" cellpadding="8" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px">
          <tr style="background:#f9fafb">
            <td style="font-size:13px;color:#6b7280">Sum eks. mva</td>
            <td align="right" style="font-size:13px;color:#374151">${kr(eksMva)}</td>
          </tr>
          <tr>
            <td style="font-size:13px;color:#6b7280">MVA 25%</td>
            <td align="right" style="font-size:13px;color:#374151">${kr(eksMva * 0.25)}</td>
          </tr>
          <tr style="background:#eef2ff">
            <td style="font-weight:bold;color:#1e3aaa">Totalt inkl. mva</td>
            <td align="right" style="font-weight:bold;color:#1e3aaa">${kr(eksMva * 1.25)}</td>
          </tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 28px">
        <p style="font-size:13px;color:#6b7280;margin:0">Svar på denne e-posten for å godta tilbudet.</p>
      </td></tr>
      <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb">
        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
          ${isPro ? `${firma} · ${skjema.firmaEpost || ''} · ${skjema.firmaTelefon || ''}` : 'Sendt med Prismal — prismal.no'}
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

function kr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall || 0)
}
