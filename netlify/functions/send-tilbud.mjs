import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('Ugyldig JSON', { status: 400 })
  }

  const { tilEpost, skjema, pdfBase64, brukerEpost, brukerNavn, bruker_id, isPro } = body

  if (!tilEpost || !pdfBase64 || !skjema) {
    return new Response('Mangler tilEpost, skjema eller pdfBase64', { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const filnavn = `Tilbud-${skjema.tilbudsnummer}-${skjema.kundenavn || 'kunde'}.pdf`

  const fraAdr = isPro
    ? `${skjema.firmanavn || 'Tilbud'} via Prismal <kontakt@prismal.no>`
    : 'Prismal Tilbud <kontakt@prismal.no>'

  let sendResult
  try {
    sendResult = await resend.emails.send({
      from: fraAdr,
      to: [tilEpost],
      reply_to: brukerEpost || skjema.firmaEpost,
      cc: brukerEpost ? [brukerEpost] : undefined,
      subject: `Tilbud nr. ${skjema.tilbudsnummer} fra ${skjema.firmanavn || 'Prismal'}`,
      html: byggHtml(skjema, isPro),
      attachments: [{ filename: filnavn, content: pdfBase64 }],
    })
  } catch (err) {
    console.error('Resend feil:', err)
    return new Response(
      JSON.stringify({ error: 'E-post kunne ikke sendes', detalj: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
      await supabase.from('sendte_tilbud').insert({
        bruker_id: bruker_id || null,
        tilbudsnummer: skjema.tilbudsnummer,
        kundenavn: skjema.kundenavn || null,
        kunde_epost: tilEpost,
        firma_epost: brukerEpost || skjema.firmaEpost || null,
        sendt_dato: new Date().toISOString(),
        resend_id: sendResult?.data?.id || null,
      })
    } catch (dbErr) {
      console.error('Supabase-lagring feilet:', dbErr)
    }
  }

  return new Response(
    JSON.stringify({ ok: true, id: sendResult?.data?.id }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  )
}

function byggHtml(skjema, isPro) {
  const firma = isPro ? (skjema.firmanavn || 'Prismal') : 'Prismal'
  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMat = (skjema.materialer || []).reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.antall)||1)*(parseFloat(m.pris)||0)), 0)
  const paaslag = totalMat * (parseFloat(skjema.paaslagProsent)||0) / 100
  const eksMva = totalArbeid + totalMat + paaslag
  const total = eksMva * 1.25

  return `<!DOCTYPE html>
<html lang="no">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:600px">
        <tr><td style="background:#1e3aaa;padding:28px 32px;color:#fff">
          <p style="margin:0;font-size:13px;opacity:.8">TILBUD</p>
          <h1 style="margin:4px 0 0;font-size:22px">${firma}</h1>
        </td></tr>
        <tr><td style="padding:28px 32px 16px">
          <p style="margin:0;font-size:15px;color:#374151">Hei ${skjema.kundenavn || ''},</p>
          <p style="margin:12px 0 0;font-size:15px;color:#374151">
            Vedlagt finner du tilbud nr. <strong>${skjema.tilbudsnummer}</strong> datert ${skjema.dato}.
            PDF-filen inneholder alle detaljer. Tilbudet er gyldig i 30 dager.
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
              <td style="font-size:15px;font-weight:bold;color:#1e3aaa">Totalt inkl. mva</td>
              <td align="right" style="font-size:15px;font-weight:bold;color:#1e3aaa">${kr(total)}</td>
            </tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 32px">
          <p style="font-size:13px;color:#6b7280;margin:0">
            For å godta tilbudet, svar på denne e-posten innen tilbudets gyldighetsperiode.
          </p>
        </td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb">
          <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center">
            ${isPro ? `${firma} · ${skjema.firmaEpost || ''} · ${skjema.firmaTelefon || ''}` : 'Sendt med <a href="https://prismal.no" style="color:#6366f1">Prismal</a>'}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function kr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall || 0)
}
