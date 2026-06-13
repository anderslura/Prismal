import { useState } from 'react'
import { hentTemaFarger } from './PdfTemavelger.jsx'
import PrismalLogo from './PrismalLogo.jsx'
import { genererPdfBase64 } from '../api/pdf.js'

export default function TilbudPreview({ skjema, oppdaterTekst, onLastNed, onTilbake, onNyttTilbud, isPro = true, bruker }) {
  const [visSendModal, setVisSendModal]   = useState(false)
  const [mottakerEpost, setMottakerEpost] = useState(skjema.kundeEpost || '')
  const [senderStatus, setSenderStatus]   = useState('idle') // idle | sending | sendt | feil
  const [feilmelding, setFeilmelding]     = useState('')

  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMaterialer = skjema.materialer.reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0)), 0)
  const materialerMedPaaslag = skjema.materialer.reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0)) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent) || 0) / 100
  const kjoringSum = (parseFloat(skjema.kjoringKm)||0) * (parseFloat(skjema.kjoringSats)||0)
  const bomSum       = (skjema.bom       || []).reduce((s, b) => s + (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0), 0)
  const parkeringSum = (skjema.parkering  || []).reduce((s, p) => s + (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0), 0)
  const fergeSum     = (skjema.ferge      || []).reduce((s, f) => s + (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0), 0)
  const totalEksMva = totalArbeid + totalMaterialer + paaslag + kjoringSum + bomSum + parkeringSum + fergeSum
  const totalInklMva = totalEksMva * 1.25

  async function sendTilbud() {
    if (!mottakerEpost) return
    setSenderStatus('sending')
    setFeilmelding('')
    try {
      const pdfBase64 = await genererPdfBase64(skjema, isPro)
      const res = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tilEpost:    mottakerEpost,
          skjema,
          pdfBase64,
          brukerEpost: bruker?.email || skjema.firmaEpost || '',
          brukerNavn:  bruker?.user_metadata?.full_name || skjema.firmanavn || '',
          bruker_id:   bruker?.id || null,
          isPro,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Ukjent feil')
      setSenderStatus('sendt')
    } catch (err) {
      setSenderStatus('feil')
      setFeilmelding(err.message || 'Kunne ikke sende e-post')
    }
  }

  return (
    <div className="preview-layout">
      <div className="preview-actions">
        <h2 className="preview-tittel">Forhåndsvisning av tilbud</h2>

        <div className="preview-knapper">
          <button className="btn btn-primary" onClick={onLastNed}>
            ⬇ Last ned PDF
          </button>
          <button
            className="btn btn-primary"
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
            onClick={() => { setVisSendModal(true); setSenderStatus('idle') }}
          >
            ✉️ Send på e-post
          </button>
          <button className="btn btn-secondary" onClick={onTilbake} title="Alt du har fylt inn er bevart">
            ✏️ Endre tilbud
          </button>
          <button className="btn btn-secondary" onClick={onNyttTilbud} style={{ borderColor: '#16a34a', color: '#16a34a' }}>
            + Nytt tilbud
          </button>
        </div>

        <p className="preview-tilbake-hint">
          Trykk «Endre tilbud» for å justere — alt du har fylt inn er bevart.
        </p>

        {paaslag > 0 && (
          <div className="preview-paaslag-notat">Påslag er kun intern kalkyle — vises ikke på PDF som sendes kunden. Beløpet er allerede innbakt i totalprisen.</div>
        )}
      </div>

      {/* ── Send e-post modal ── */}
      {visSendModal && (
        <div className="modal-overlay" onClick={() => { if (senderStatus !== 'sending') setVisSendModal(false) }}>
          <div className="modal-boks send-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-tittel">Send tilbud på e-post</h3>

            {senderStatus === 'sendt' ? (
              <div className="modal-sendt">
                <p className="modal-sendt-ikon">✅</p>
                <p><strong>Tilbudet er sendt!</strong></p>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Kopi er sendt til {skjema.firmaEpost || 'din e-post'}.
                </p>
                <button className="btn btn-secondary" onClick={() => setVisSendModal(false)}>Lukk</button>
              </div>
            ) : (
              <>
                <div className="modal-rad">
                  <label className="modal-label">Til (kundens e-post)</label>
                  <input
                    type="email"
                    className="modal-input"
                    value={mottakerEpost}
                    onChange={e => setMottakerEpost(e.target.value)}
                    placeholder="kunde@epost.no"
                    disabled={senderStatus === 'sending'}
                  />
                </div>

                <div className="modal-info">
                  <p>📎 PDF-tilbudet legges ved automatisk.</p>
                  <p>↩️ Kunden svarer direkte til <strong>{skjema.firmaEpost || 'din e-post'}</strong>.</p>
                  <p>📬 Du får kopi i din innboks.</p>
                </div>

                {senderStatus === 'feil' && (
                  <p className="modal-feil">⚠️ {feilmelding}</p>
                )}

                <div className="modal-knapper">
                  <button
                    className="btn btn-primary"
                    style={{ background: '#6366f1', borderColor: '#6366f1' }}
                    onClick={sendTilbud}
                    disabled={!mottakerEpost || senderStatus === 'sending'}
                  >
                    {senderStatus === 'sending' ? 'Sender …' : '✉️ Send tilbud'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setVisSendModal(false)}
                    disabled={senderStatus === 'sending'}
                  >
                    Avbryt
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="tilbud-dokument">
        {/* HEADER */}
        <div className="dok-header" style={{ background: hentTemaFarger(skjema.pdfTema).header, color: hentTemaFarger(skjema.pdfTema).sub }}>
          <div className="dok-firma">
            {isPro ? (
              <>
                {skjema.logoUrl && (
                  <img src={skjema.logoUrl} alt="Logo" style={{ height: '40px', maxWidth: '120px', objectFit: 'contain', marginBottom: '6px', display: 'block' }} />
                )}
                <h1 className="firma-navn">{skjema.firmanavn || 'Ditt Firma AS'}</h1>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <PrismalLogo />
              </div>
            )}
            {skjema.firmaAdresse && <p>{skjema.firmaAdresse}</p>}
            {skjema.firmaTelefon && <p>Tlf: {skjema.firmaTelefon}</p>}
            {skjema.firmaEpost && <p>{skjema.firmaEpost}</p>}
          </div>
          <div className="dok-meta">
            <div className="dok-meta-rad">
              <span className="meta-label">Tilbudsnr.</span>
              <span className="meta-verdi">{skjema.tilbudsnummer}</span>
            </div>
            <div className="dok-meta-rad">
              <span className="meta-label">Dato</span>
              <span className="meta-verdi">{skjema.dato}</span>
            </div>
            <div className="dok-meta-rad">
              <span className="meta-label">Gyldig til</span>
              <span className="meta-verdi">{gyldigTil(30)}</span>
            </div>
          </div>
        </div>

        <div className="dok-divider" />

        {/* KUNDE */}
        <div className="dok-kunde">
          <p className="dok-label">Tilbud til:</p>
          <p className="kunde-navn">{skjema.kundenavn}</p>
          {skjema.kundeAdresse && <p>{skjema.kundeAdresse}</p>}
          {skjema.kundeEpost && <p>{skjema.kundeEpost}</p>}
        </div>

        {/* TILBUDSTEKST */}
        <div className="dok-seksjon">
          <h3 className="dok-seksjon-tittel">Tilbud</h3>
          <div className="tilbudstekst-wrapper">
            <p className="preview-rediger-hint">✏️ Tilbudsteksten kan redigeres direkte — klikk i feltet under.</p>
            <textarea
              className="tilbudstekst-editor"
              value={skjema.tilbudstekst}
              onChange={e => oppdaterTekst(e.target.value)}
              rows={10}
            />
          </div>
        </div>

        {/* PRISTABELL */}
        <div className="dok-seksjon">
          <h3 className="dok-seksjon-tittel">Prisoversikt</h3>
          <div className="pris-tabell-scroll">
            <table className="pris-tabell">
              <thead>
                <tr>
                  <th>Beskrivelse</th>
                  <th className="th-antall">Antall</th>
                  <th className="th-pris">Enhetspris</th>
                  <th className="th-sum">Sum</th>
                </tr>
              </thead>
              <tbody>
                {(skjema.arbeidere || []).filter(a => a.timer && a.timepris).map(a => (
                  <tr key={a.id}>
                    <td>Arbeid</td>
                    <td className="td-antall">{a.timer} t</td>
                    <td className="td-pris">{formaterKr(parseFloat(a.timepris))}</td>
                    <td className="td-sum">{formaterKr((parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0))}</td>
                  </tr>
                ))}
                {skjema.materialer.map(m => (
                  <tr key={m.id}>
                    <td>{m.navn}</td>
                    <td className="td-antall">{parseFloat(m.antall) || 1}</td>
                    <td className="td-pris">{formaterKr(m.pris)}</td>
                    <td className="td-sum">{formaterKr(parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0))}</td>
                  </tr>
                ))}
                {paaslag > 0 && (
                  <tr>
                    <td>Påslag materialer ({skjema.paaslagProsent}%)</td>
                    <td className="td-antall"></td>
                    <td className="td-pris"></td>
                    <td className="td-sum">{formaterKr(paaslag)}</td>
                  </tr>
                )}
                {kjoringSum > 0 && (
                  <tr>
                    <td>Kjøring</td>
                    <td className="td-antall">{skjema.kjoringKm} km</td>
                    <td className="td-pris">{formaterKr(skjema.kjoringSats)}/km</td>
                    <td className="td-sum">{formaterKr(kjoringSum)}</td>
                  </tr>
                )}
                {(skjema.bom || []).filter(b => (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0) > 0).map((b, i) => (
                  <tr key={b.id || i}>
                    <td>Bom</td><td className="td-antall">{b.antall}</td>
                    <td className="td-pris">{formaterKr(b.pris)}</td>
                    <td className="td-sum">{formaterKr((parseFloat(b.antall)||0)*(parseFloat(b.pris)||0))}</td>
                  </tr>
                ))}
                {(skjema.parkering || []).filter(p => (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0) > 0).map((p, i) => (
                  <tr key={p.id || i}>
                    <td>Parkering</td><td className="td-antall">{p.antall}</td>
                    <td className="td-pris">{formaterKr(p.pris)}</td>
                    <td className="td-sum">{formaterKr((parseFloat(p.antall)||0)*(parseFloat(p.pris)||0))}</td>
                  </tr>
                ))}
                {(skjema.ferge || []).filter(f => (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0) > 0).map((f, i) => (
                  <tr key={f.id || i}>
                    <td>Ferge</td><td className="td-antall">{f.antall}</td>
                    <td className="td-pris">{formaterKr(f.pris)}</td>
                    <td className="td-sum">{formaterKr((parseFloat(f.antall)||0)*(parseFloat(f.pris)||0))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="tfoot-eks-mva">
                  <td colSpan={3}>Sum eks. mva</td>
                  <td className="td-sum">{formaterKr(totalEksMva)}</td>
                </tr>
                <tr className="tfoot-mva">
                  <td colSpan={3}>MVA 25%</td>
                  <td className="td-sum">{formaterKr(totalEksMva * 0.25)}</td>
                </tr>
                <tr className="tfoot-total">
                  <td colSpan={3}><strong>Totalt inkl. mva</strong></td>
                  <td className="td-sum"><strong>{formaterKr(totalInklMva)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* BUNNTEKST */}
        <div className="dok-footer">
          <p>Tilbudet er gyldig i 30 dager fra utstedelsesdato.</p>
          <p className="aksept-klausul">
            <strong>Aksept av tilbud:</strong> For å godta dette tilbudet må skriftlig aksept sendes til{' '}
            <strong>{skjema.firmaEpost || 'e-post oppgitt i kontaktinformasjon'}</strong>{' '}
            innen tilbudets gyldighetsperiode. Muntlig aksept er ikke bindende.
          </p>
        </div>
      </div>
    </div>
  )
}

function formaterKr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall)
}

function gyldigTil(dager) {
  const d = new Date()
  d.setDate(d.getDate() + dager)
  return d.toLocaleDateString('no-NO')
}
