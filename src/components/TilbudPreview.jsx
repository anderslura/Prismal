import { useState, useEffect, Fragment } from 'react'
import { hentTemaFarger } from './PdfTemavelger.jsx'
import PrismalLogo from './PrismalLogo.jsx'
import { genererPdfBase64 } from '../api/pdf.js'
import { supabase } from '../lib/supabase.js'

export default function TilbudPreview({ skjema, oppdaterTekst, onLastNed, onTilbake, onNyttTilbud, isPro = true, bruker }) {
  const [visSendModal, setVisSendModal]     = useState(false)
  const [mottakerEpost, setMottakerEpost]   = useState(skjema.kundeEpost || '')
  const [senderStatus, setSenderStatus]     = useState('idle') // idle | sending | sendt | feil
  const [feilmelding, setFeilmelding]       = useState('')
  const [tidligereAntall, setTidligereAntall] = useState(null) // null = ikke hentet ennå

  // Hent antall tidligere tilbud til samme kunde
  useEffect(() => {
    if (!visSendModal || !mottakerEpost || !bruker) return
    setTidligereAntall(null)
    supabase
      .from('sendte_tilbud')
      .select('id', { count: 'exact', head: true })
      .eq('kunde_epost', mottakerEpost.toLowerCase().trim())
      .eq('bruker_id', bruker.id)
      .then(({ count }) => setTidligereAntall(count || 0))
      .catch(() => setTidligereAntall(0))
  }, [visSendModal, mottakerEpost])

  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  // Kun materialer med antall > 0 skal telle med — uten dette filteret blir
  // bibliotek-maler (antall: 0, lastet inn automatisk fra materialbiblioteket)
  // feilaktig regnet som "antall 1" og lagt til i summen. PDF-en (pdf.js)
  // filtrerer allerede riktig — denne forhåndsvisningen må matche.
  const materialerIBruk = skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0)
  const totalMaterialer = materialerIBruk.reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0)), 0)
  const materialerMedPaaslag = materialerIBruk.reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0)) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent) || 0) / 100
  // Materialer kan grupperes under egendefinerte kategori-overskrifter (valgfritt felt per linje).
  // Uten kategori i bruk: vis flat liste akkurat som før (ingen visuell endring).
  // Navngitte kategorier vises først (i den rekkefølgen de først dukket opp); linjer uten
  // kategori vises sist, slik at ingenting "uten kategori" ligger over en kategori-overskrift.
  const materialerHarKategori = materialerIBruk.some(m => m.kategori)
  const materialGrupper = (() => {
    if (!materialerHarKategori) return [{ kategori: null, rader: materialerIBruk }]
    const nokler = []
    const map = {}
    materialerIBruk.forEach(m => {
      const key = m.kategori || ''
      if (!(key in map)) { map[key] = []; nokler.push(key) }
      map[key].push(m)
    })
    const grupper = []
    nokler.filter(Boolean).forEach(k => grupper.push({ kategori: k, rader: map[k] }))
    if (map['']) grupper.push({ kategori: null, rader: map[''] })
    return grupper
  })()
  const kjoringSum       = (parseFloat(skjema.kjoringKm)||0) * (parseFloat(skjema.kjoringSats)||0)
  const kjoringHengerSum = (parseFloat(skjema.kjoringHengerKm)||0) * (parseFloat(skjema.kjoringHengerSats)||0)
  const hengerleieSum    = (parseFloat(skjema.hengerleieDager)||0) * (parseFloat(skjema.hengerleieSats)||0)
  const maskinleieSum    = (parseFloat(skjema.maskinleieDager)||0) * (parseFloat(skjema.maskinleieSats)||0)
  const bomSum       = (skjema.bom       || []).reduce((s, b) => s + (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0), 0)
  const parkeringSum = (skjema.parkering  || []).reduce((s, p) => s + (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0), 0)
  const fergeSum     = (skjema.ferge      || []).reduce((s, f) => s + (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0), 0)
  // Samme filter-prinsipp som materialer: kun rader med faktisk antall og pris regnes med
  const miljoAvgifterIBruk = (skjema.miljoavgifter || []).filter(m => (parseFloat(m.antall)||0) > 0 && (parseFloat(m.pris)||0) > 0)
  const miljoAvgifterSum = miljoAvgifterIBruk.reduce((s, m) => s + (parseFloat(m.antall)||0)*(parseFloat(m.pris)||0), 0)

  // Forhåndsberegnede lister/flagg for seksjonsoverskrifter i pristabellen (speiler pdf.js)
  const arbeidRaderListe = (skjema.arbeidere || []).filter(a => a.timer && a.timepris)
  const bomRaderListe = (skjema.bom || []).filter(b => (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0) > 0)
  const parkeringRaderListe = (skjema.parkering || []).filter(p => (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0) > 0)
  const fergeRaderListe = (skjema.ferge || []).filter(f => (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0) > 0)
  const transportVis = kjoringSum > 0 || kjoringHengerSum > 0 || hengerleieSum > 0 || maskinleieSum > 0 || bomRaderListe.length > 0 || parkeringRaderListe.length > 0 || fergeRaderListe.length > 0
  const miljoPaaslag = miljoAvgifterSum * (parseFloat(skjema.miljoPaaslagProsent)||0) / 100
  const totalEksMva = totalArbeid + totalMaterialer + paaslag + miljoAvgifterSum + miljoPaaslag + kjoringSum + kjoringHengerSum + hengerleieSum + maskinleieSum + bomSum + parkeringSum + fergeSum
  const totalInklMva = totalEksMva * 1.25

  async function sendTilbud() {
    if (!mottakerEpost) return
    setSenderStatus('sending')
    setFeilmelding('')
    try {
      const pdfBase64 = await genererPdfBase64(skjema, isPro)
      // Stripp logoUrl (base64-bilde) — PDF er allerede generert, ikke send logo på nytt
      const { logoUrl: _logo, ...skjemaUtenLogo } = skjema
      const res = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tilEpost:    mottakerEpost,
          skjema:      skjemaUtenLogo,
          pdfBase64,
          brukerEpost: bruker?.email || skjema.firmaEpost || '',
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
                  <p>📋 Tilbudet lagres i din Prismal-historikk.</p>
                  {bruker && tidligereAntall !== null && tidligereAntall > 0 && (
                    <p style={{ color: '#6366f1', fontWeight: 500 }}>
                      📊 Du har sendt {tidligereAntall} tidligere tilbud til denne kunden.
                    </p>
                  )}
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
            {skjema.firmaOrgnr && <p>Org.nr: {skjema.firmaOrgnr}</p>}
            {skjema.firmaNettside && (
              <p>
                <a
                  href={/^https?:\/\//i.test(skjema.firmaNettside) ? skjema.firmaNettside : `https://${skjema.firmaNettside}`}
                  target="_blank" rel="noopener noreferrer" className="dok-nettside-link"
                >
                  {skjema.firmaNettside}
                </a>
              </p>
            )}
            {skjema.firmaFacebookUrl ? (
              <a href={skjema.firmaFacebookUrl} target="_blank" rel="noopener noreferrer" className="dok-fb-knapp">
                Besøk {skjema.firmaFacebookNavn || skjema.firmanavn || 'vår'}s Facebook-side
              </a>
            ) : skjema.firmaFacebookNavn ? (
              <p>Facebook: {skjema.firmaFacebookNavn}</p>
            ) : null}
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
                {arbeidRaderListe.length > 0 && (
                  <Fragment>
                    <tr className="pris-tabell-seksjon"><td colSpan={4}>Arbeid</td></tr>
                    {arbeidRaderListe.map(a => (
                      <tr key={a.id}>
                        <td>Arbeid</td>
                        <td className="td-antall">{a.timer} t</td>
                        <td className="td-pris">{formaterKr(parseFloat(a.timepris))}</td>
                        <td className="td-sum">{formaterKr((parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0))}</td>
                      </tr>
                    ))}
                  </Fragment>
                )}
                {(materialerIBruk.length > 0 || paaslag > 0) && (
                  <Fragment>
                    <tr className="pris-tabell-seksjon"><td colSpan={4}>Materialer</td></tr>
                    {materialGrupper.map((gruppe, gi) => (
                      <Fragment key={gruppe.kategori || `_ukat_${gi}`}>
                        {gruppe.kategori && (
                          <tr className={gi > 0 ? "pris-tabell-kategori pris-tabell-kategori-luft" : "pris-tabell-kategori"}>
                            <td colSpan={4}>{gruppe.kategori}</td>
                          </tr>
                        )}
                        {gruppe.rader.map((m, mi) => (
                          <tr key={m.id} className={(!gruppe.kategori && gi > 0 && mi === 0) ? "pris-tabell-rad-luft" : undefined}>
                            <td>{m.navn}</td>
                            <td className="td-antall">{parseFloat(m.antall) || 1}</td>
                            <td className="td-pris">{formaterKr(m.pris)}</td>
                            <td className="td-sum">{formaterKr(parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0))}</td>
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                    {paaslag > 0 && (
                      <tr>
                        <td>Påslag materialer ({skjema.paaslagProsent}%)</td>
                        <td className="td-antall"></td>
                        <td className="td-pris"></td>
                        <td className="td-sum">{formaterKr(paaslag)}</td>
                      </tr>
                    )}
                  </Fragment>
                )}
                {(miljoAvgifterIBruk.length > 0 || miljoPaaslag > 0) && (
                  <Fragment>
                    <tr className="pris-tabell-seksjon"><td colSpan={4}>Miljøavgifter</td></tr>
                    {miljoAvgifterIBruk.map((m, i) => (
                      <tr key={m.id || i}>
                        <td>{m.navn || 'Miljøavgift'}</td>
                        <td className="td-antall">{m.antall}</td>
                        <td className="td-pris">{formaterKr(m.pris)}</td>
                        <td className="td-sum">{formaterKr((parseFloat(m.antall)||0)*(parseFloat(m.pris)||0))}</td>
                      </tr>
                    ))}
                    {miljoPaaslag > 0 && (
                      <tr>
                        <td>Påslag miljøavgifter ({skjema.miljoPaaslagProsent}%)</td>
                        <td className="td-antall"></td>
                        <td className="td-pris"></td>
                        <td className="td-sum">{formaterKr(miljoPaaslag)}</td>
                      </tr>
                    )}
                  </Fragment>
                )}
                {transportVis && (
                  <Fragment>
                    <tr className="pris-tabell-seksjon"><td colSpan={4}>Transport</td></tr>
                    {kjoringSum > 0 && (
                      <tr>
                        <td>Kjøring</td>
                        <td className="td-antall">{skjema.kjoringKm} km</td>
                        <td className="td-pris">{formaterKr(skjema.kjoringSats)}/km</td>
                        <td className="td-sum">{formaterKr(kjoringSum)}</td>
                      </tr>
                    )}
                    {kjoringHengerSum > 0 && (
                      <tr>
                        <td>Kjøring (bil + henger)</td>
                        <td className="td-antall">{skjema.kjoringHengerKm} km</td>
                        <td className="td-pris">{formaterKr(skjema.kjoringHengerSats)}/km</td>
                        <td className="td-sum">{formaterKr(kjoringHengerSum)}</td>
                      </tr>
                    )}
                    {hengerleieSum > 0 && (
                      <tr>
                        <td>Leie av henger</td>
                        <td className="td-antall">{skjema.hengerleieDager} dag(er)</td>
                        <td className="td-pris">{formaterKr(skjema.hengerleieSats)}/dag</td>
                        <td className="td-sum">{formaterKr(hengerleieSum)}</td>
                      </tr>
                    )}
                    {maskinleieSum > 0 && (
                      <tr>
                        <td>Maskinleie</td>
                        <td className="td-antall">{skjema.maskinleieDager} dag(er)</td>
                        <td className="td-pris">{formaterKr(skjema.maskinleieSats)}/dag</td>
                        <td className="td-sum">{formaterKr(maskinleieSum)}</td>
                      </tr>
                    )}
                    {bomRaderListe.map((b, i) => (
                      <tr key={b.id || i}>
                        <td>Bom</td><td className="td-antall">{b.antall}</td>
                        <td className="td-pris">{formaterKr(b.pris)}</td>
                        <td className="td-sum">{formaterKr((parseFloat(b.antall)||0)*(parseFloat(b.pris)||0))}</td>
                      </tr>
                    ))}
                    {parkeringRaderListe.map((p, i) => (
                      <tr key={p.id || i}>
                        <td>Parkering</td><td className="td-antall">{p.antall}</td>
                        <td className="td-pris">{formaterKr(p.pris)}</td>
                        <td className="td-sum">{formaterKr((parseFloat(p.antall)||0)*(parseFloat(p.pris)||0))}</td>
                      </tr>
                    ))}
                    {fergeRaderListe.map((f, i) => (
                      <tr key={f.id || i}>
                        <td>Ferge</td><td className="td-antall">{f.antall}</td>
                        <td className="td-pris">{formaterKr(f.pris)}</td>
                        <td className="td-sum">{formaterKr((parseFloat(f.antall)||0)*(parseFloat(f.pris)||0))}</td>
                      </tr>
                    ))}
                  </Fragment>
                )}
              </tbody>
              <tfoot>
                {skjema.firmaMvaPliktig !== false ? (
                  <>
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
                  </>
                ) : (
                  <tr className="tfoot-total">
                    <td colSpan={3}><strong>Totalt</strong></td>
                    <td className="td-sum"><strong>{formaterKr(totalEksMva)}</strong></td>
                  </tr>
                )}
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
