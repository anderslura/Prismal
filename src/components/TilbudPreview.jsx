import { hentTemaFarger } from './PdfTemavelger.jsx'
import PrismalLogo from './PrismalLogo.jsx'

export default function TilbudPreview({ skjema, oppdaterTekst, onLastNed, onTilbake, onNyttTilbud, isPro = true }) {
  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMaterialer = skjema.materialer.reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0)), 0)
  const materialerMedPaaslag = skjema.materialer.reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.sum) || (parseFloat(m.antall)||1) * (parseFloat(m.pris)||0)) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent) || 0) / 100
  const totalEksMva = totalArbeid + totalMaterialer + paaslag
  const totalInklMva = totalEksMva * 1.25

  return (
    <div className="preview-layout">
      <div className="preview-actions">
        <h2 className="preview-tittel">Forhåndsvisning av tilbud</h2>
        <div className="preview-knapper">
          <button className="btn btn-secondary" onClick={() => oppdaterTekst(skjema.tilbudstekst)}>
            Rediger tekst
          </button>
          <button className="btn btn-primary" onClick={onLastNed}>
            ⬇ Last ned PDF
          </button>
          <button className="btn btn-secondary" onClick={onNyttTilbud} style={{borderColor: '#16a34a', color: '#16a34a'}}>
            + Nytt tilbud
          </button>
        </div>
        {paaslag > 0 && (
          <div className="preview-paaslag-notat">Påslag er kun intern kalkyle — vises ikke på PDF som sendes kunden. Beløpet er allerede innbakt i totalprisen.</div>
        )}
      </div>

      <div className="tilbud-dokument">
        {/* HEADER */}
        <div className="dok-header" style={{background: hentTemaFarger(skjema.pdfTema).header, color: hentTemaFarger(skjema.pdfTema).sub}}>
          <div className="dok-firma">
            {isPro ? (
              <>
                {skjema.logoUrl && (
                  <img src={skjema.logoUrl} alt="Logo" style={{height:'40px', maxWidth:'120px', objectFit:'contain', marginBottom:'6px', display:'block'}} />
                )}
                <h1 className="firma-navn">{skjema.firmanavn || 'Ditt Firma AS'}</h1>
              </>
            ) : (
              <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px'}}>
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
