import PdfTemavelger from './PdfTemavelger.jsx'
import { useState } from 'react'

export default function TilbudSkjema({ skjema, oppdater, onGenerer, laster, feil, prisliste, setPrisliste, isPro }) {

  const [nyNavn, setNyNavn] = useState('')
  const [nyAnt, setNyAnt] = useState('')
  const [nyPris, setNyPris] = useState('')
  const [nyHasPaaslag, setNyHasPaaslag] = useState(true)

  function leggTilArbeider() {
    const lagretPris = (() => { try { return localStorage.getItem('timepris') || '' } catch { return '' } })()
    oppdater('arbeidere', [...skjema.arbeidere, { id: Date.now(), timer: '', timepris: lagretPris }])
  }

  function oppdaterArbeider(i, felt, verdi) {
    const ny = [...skjema.arbeidere]
    ny[i] = { ...ny[i], [felt]: verdi }
    oppdater('arbeidere', ny)
    if (felt === 'timepris') { try { localStorage.setItem('timepris', verdi) } catch {} }
  }

  function leggTilMaterial() {
    if (!nyNavn) return
    const ant = parseFloat(nyAnt) || 1
    const pris = parseFloat(nyPris) || 0
    oppdater('materialer', [...skjema.materialer, { id: Date.now(), navn: nyNavn, antall: ant, pris: pris, sum: pris * ant, hasPaaslag: nyHasPaaslag }])
    // Lagre linje til bibliotek
    try {
      const eksisterende = JSON.parse(localStorage.getItem('materialLinjer') || '[]')
      const finnes = eksisterende.some(l => l.navn.toLowerCase() === nyNavn.toLowerCase())
      if (!finnes) {
        const oppdatert = [...eksisterende, { navn: nyNavn, pris: pris, hasPaaslag: nyHasPaaslag }]
        localStorage.setItem('materialLinjer', JSON.stringify(oppdatert))
      }
    } catch {}
    setNyNavn(''); setNyPris(''); setNyAnt('1')
  }


  function oppdaterMaterial(id, felt, verdi) {
    oppdater('materialer', skjema.materialer.map(m => {
      if (m.id !== id) return m
      const oppdatert = { ...m, [felt]: verdi }
      oppdatert.sum = (parseFloat(oppdatert.antall) || 1) * (parseFloat(oppdatert.pris) || 0)
      return oppdatert
    }))
  }

  function fjernMaterial(id) {
    const fjernet = skjema.materialer.find(m => m.id === id)
    oppdater('materialer', skjema.materialer.filter(m => m.id !== id))
    // Fjern også fra localStorage-biblioteket
    if (fjernet) {
      try {
        const oppdatert = JSON.parse(localStorage.getItem('materialLinjer') || '[]')
          .filter(l => l.navn !== fjernet.navn)
        localStorage.setItem('materialLinjer', JSON.stringify(oppdatert))
      } catch {}
    }
  }

  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMaterialer = skjema.materialer.reduce((s, m) => s + (parseFloat(m.sum)||0), 0)
  const materialerMedPaaslag = skjema.materialer.reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.sum)||0) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent)||0) / 100
  const totalSum = totalArbeid + totalMaterialer + paaslag

  return (
    <div className="skjema-layout">
      <div className="skjema-kolonne">

        {/* FIRMA */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Din bedrift</h2>
          <div className="felt-gruppe">
            <label>Firmanavn</label>
            <input type="text" placeholder="Ola Nordmann AS" value={skjema.firmanavn} onChange={e => oppdater('firmanavn', e.target.value)} />
          </div>
          <div className="felt-rad">
            <div className="felt-gruppe">
              <label>Telefon</label>
              <input type="tel" placeholder="900 00 000" value={skjema.firmaTelefon} onChange={e => oppdater('firmaTelefon', e.target.value)} />
            </div>
            <div className="felt-gruppe">
              <label>E-post</label>
              <input type="email" placeholder="post@firma.no" value={skjema.firmaEpost} onChange={e => oppdater('firmaEpost', e.target.value)} />
            </div>
          </div>
          <div className="felt-gruppe">
            <label>Adresse</label>
            <input type="text" placeholder="Gateveien 1, 0001 Oslo" value={skjema.firmaAdresse} onChange={e => oppdater('firmaAdresse', e.target.value)} />
          </div>
          <div className="felt-rad">
            <div className="felt-gruppe">
              <label>Org.nr</label>
              <input type="text" placeholder="123456789" maxLength={9} value={skjema.firmaOrgnr||''} onChange={e => oppdater('firmaOrgnr', e.target.value.replace(/\D/g, '').slice(0,9))} />
            </div>
            <div className="felt-gruppe">
              <label>Nettside</label>
              <input type="text" placeholder="www.firma.no" value={skjema.firmaNettside||''} onFocus={() => { if(!skjema.firmaNettside) oppdater('firmaNettside', 'www.') }} onChange={e => oppdater('firmaNettside', e.target.value)} />
            </div>
          </div>
          <div className="felt-gruppe">
            <label>Logo på PDF {!isPro && <span className="pro-badge">PRO</span>}</label>
            {isPro ? (
              <div className="logo-opplasting">
                {skjema.logoUrl ? (
                  <div className="logo-preview">
                    <img src={skjema.logoUrl} alt="Logo" className="logo-img" />
                    <button className="btn-fjern" onClick={() => oppdater('logoUrl', '')}>×</button>
                  </div>
                ) : (
                  <label className="logo-velg-knapp">
                    Velg logofil (PNG/JPG)
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" style={{display:'none'}} onChange={e => {
                      const fil = e.target.files[0]; if (!fil) return
                      const reader = new FileReader()
                      reader.onload = ev => oppdater('logoUrl', ev.target.result)
                      reader.readAsDataURL(fil)
                    }} />
                  </label>
                )}
              </div>
            ) : (
              <div className="pro-locked">🔒 Tilgjengelig på Pro-plan (99 kr/mnd)</div>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px'}}>
            <p className="lagret-info">✓ Lagres automatisk</p>
            <button className="btn-lenke roed" onClick={() => {
              if (confirm('Nullstille lagret firmainformasjon?')) {
                localStorage.removeItem('firma'); localStorage.removeItem('logoUrl')
                ;['firmanavn','firmaTelefon','firmaEpost','firmaAdresse','firmaOrgnr','firmaNettside','logoUrl'].forEach(f => oppdater(f, ''))
              }
            }}>Nullstill</button>
          </div>
        </section>

        {/* KUNDE */}
        <section className="skjema-seksjon">
          <div className="seksjon-tittel-rad">
            <h2 className="seksjon-tittel">Kunde</h2>
            <button className="btn-lenke roed" onClick={() => {
              ;['kundenavn','kundeAdresse','kundeEpost','beskrivelse'].forEach(f => oppdater(f, ''))
              oppdater('materialer', [])
              oppdater('arbeidere', [{id:Date.now(), timer:'', timepris: (() => { try { return localStorage.getItem('timepris')||'' } catch { return '' } })()}])
            }}>Nullstill kunde/jobb</button>
          </div>
          <div className="felt-gruppe">
            <label>Kundenavn <span className="paakrevd">*</span></label>
            <input type="text" placeholder="Kari Nordmann" value={skjema.kundenavn} onChange={e => oppdater('kundenavn', e.target.value)} />
          </div>
          <div className="felt-gruppe">
            <label>Adresse</label>
            <input type="text" placeholder="Hjemveien 5, 0002 Oslo" value={skjema.kundeAdresse} onChange={e => oppdater('kundeAdresse', e.target.value)} />
          </div>
          <div className="felt-gruppe">
            <label>E-post</label>
            <input type="email" placeholder="kari@epost.no" value={skjema.kundeEpost} onChange={e => oppdater('kundeEpost', e.target.value)} />
          </div>
        </section>

        {/* JOBB */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Jobben</h2>
          <div className="felt-gruppe">
            <label>Beskrivelse av jobben <span className="paakrevd">*</span></label>
            <textarea rows={5} placeholder="Eks: male stue, bytte vinduer på bad, legge terrassebord..." value={skjema.beskrivelse} onChange={e => oppdater('beskrivelse', e.target.value)} />
            <p className="felt-hint">AI skriver profesjonelt tilbudsspråk basert på dette. Adresse hentes fra kundeinformasjon. Teksten kan redigeres etter generering.</p>
          </div>
        </section>

      </div>

      <div className="skjema-kolonne">

        {/* ARBEID */}
        <section className="skjema-seksjon">
          <div className="seksjon-tittel-rad">
            <h2 className="seksjon-tittel">Arbeid</h2>
            <button className="btn-lenke" onClick={leggTilArbeider}>+ Legg til rad</button>
          </div>
          <div className="arbeider-header">
            <span>Timer</span><span>Kr/time</span><span></span><span></span>
          </div>
          {skjema.arbeidere.map((a, i) => (
            <div key={a.id} className="arbeider-rad-enkel">
              <input type="number" min="0" step="0.5" placeholder="eks. 8" value={a.timer} onChange={e => oppdaterArbeider(i, 'timer', e.target.value)} />
              <input type="number" min="0" step="50" placeholder="eks. 650" value={a.timepris} onChange={e => oppdaterArbeider(i, 'timepris', e.target.value)} />
              <span className="arbeider-sum">{a.timer && a.timepris ? formaterKr((parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0)) : ''}</span>
              {skjema.arbeidere.length > 1 && <button className="btn-fjern" onClick={() => oppdater('arbeidere', skjema.arbeidere.filter(x => x.id !== a.id))}>×</button>}
            </div>
          ))}
          {totalArbeid > 0 && <p className="kalkyle-linje">Totalt: <strong>{formaterKr(totalArbeid)}</strong></p>}
        </section>

        {/* MATERIALER */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Materialer & utgifter</h2>

          {/* KOLONNEOVERSKRIFTER */}
          <div className="mat-header">
            <span>Beskrivelse</span>
            <span>Ant.</span>
            <span>Kr</span>
            <span>Sum</span>
            <span title="Påslag">Påslag</span>
            <span></span>
          </div>

          {/* EKSISTERENDE LINJER */}
          {skjema.materialer.some(m => !m.antall || m.antall == 0) && (
            <p className="mat-mal-hint">Linjer uten antall er lagrede maler — fylles ikke inn i tilbudet før du setter antall.</p>
          )}
          {skjema.materialer.map(m => (
            <div key={m.id} className={`mat-rad${(!m.antall || m.antall == 0) ? ' mat-rad-mal' : ''}`}>
              <span className="mat-fast-navn">{m.navn}</span>
              <input type="number" min="0" step="1"
                className={`mat-ant${(!m.antall || m.antall == 0) ? ' mat-ant-tom' : ''}`}
                value={(!m.antall || m.antall == 0) ? '' : m.antall}
                placeholder="1"
                onFocus={e => e.target.select()}
                onChange={e => oppdaterMaterial(m.id, 'antall', e.target.value)} />
              <input type="number" min="0" className="mat-pris" value={m.pris}
                onChange={e => oppdaterMaterial(m.id, 'pris', e.target.value)} />
              <span className="mat-sum">{formaterKr(m.sum||m.pris||0)}</span>
              <input type="checkbox" className="mat-paaslag-cb" checked={m.hasPaaslag}
                onChange={e => oppdater('materialer', skjema.materialer.map(x => x.id===m.id ? {...x, hasPaaslag:e.target.checked} : x))} />
              <button className="btn-fjern" onClick={() => fjernMaterial(m.id)}>×</button>
            </div>
          ))}

          {/* NY LINJE */}
          <p className="mat-info-tekst">Nye linjer huskes til neste tilbud — pris lagres, antall nullstilles.</p>
          <div className="mat-rad mat-ny-rad">
            <input type="text" placeholder="Beskrivelse" value={nyNavn} onChange={e => setNyNavn(e.target.value)}
              className="mat-ny-navn" onKeyDown={e => e.key==='Enter' && leggTilMaterial()} />
            <input type="number" min="1" step="1" placeholder="1" value={nyAnt}
              className={`mat-ant${!nyAnt ? ' mat-ant-tom' : ''}`}
              onFocus={e => e.target.select()}
              onChange={e => setNyAnt(e.target.value)} />
            <input type="number" min="0" placeholder="kr" value={nyPris} onChange={e => setNyPris(e.target.value)}
              className="mat-pris" onKeyDown={e => e.key==='Enter' && leggTilMaterial()} />
            <span className="mat-sum">{nyPris && nyAnt ? formaterKr((parseFloat(nyPris)||0)*(parseFloat(nyAnt)||1)) : ''}</span>
            <input type="checkbox" className="mat-paaslag-cb" checked={nyHasPaaslag} onChange={e => setNyHasPaaslag(e.target.checked)} />
            <button onClick={leggTilMaterial} style={{padding:"0 12px",height:"34px",border:"1.5px solid var(--blaa)",borderRadius:"6px",background:"var(--hvit)",color:"var(--blaa)",fontWeight:600,fontSize:"13px",cursor:"pointer",whiteSpace:"nowrap"}}>Legg til</button>
          </div>
        </section>

        {/* PDF-TEMA */}
        <section className="skjema-seksjon">
          <PdfTemavelger valgtTema={skjema.pdfTema || 'standard'} onVelg={v => oppdater('pdfTema', v)} />
        </section>

        {/* PÅSLAG */}
        <section className="skjema-seksjon">
          <div className="seksjon-tittel-rad">
            <h2 className="seksjon-tittel">Påslag materialer</h2>
            <span className="paaslaginfo">Kun avhukede linjer</span>
          </div>
          <div className="paaslag-rad">
            <input type="number" min="0" max="200" step="5" placeholder="0" value={skjema.paaslagProsent}
              onChange={e => oppdater('paaslagProsent', e.target.value)} className="paaslag-input" />
            <span className="paaslag-symbol">%</span>
            {parseFloat(skjema.paaslagProsent) > 0 && materialerMedPaaslag > 0 && (
              <span className="paaslag-resultat">= +{formaterKr(paaslag)}</span>
            )}
          </div>
        </section>

        {/* SUM */}
        {totalSum > 0 && (
          <section className="skjema-seksjon sum-seksjon">
            <h2 className="seksjon-tittel">Estimert total</h2>
            <div className="sum-tabell">
              {totalArbeid > 0 && <div className="sum-linje"><span>Arbeid</span><span>{formaterKr(totalArbeid)}</span></div>}
              {totalMaterialer > 0 && <div className="sum-linje"><span>Materialer</span><span>{formaterKr(totalMaterialer)}</span></div>}
              {paaslag > 0 && <div className="sum-linje"><span>Påslag {skjema.paaslagProsent}%</span><span>{formaterKr(paaslag)}</span></div>}
              <div className="sum-linje sum-total"><span>Total eks. mva</span><span>{formaterKr(totalSum)}</span></div>
              <div className="sum-linje sum-mva"><span>Inkl. 25% mva</span><span>{formaterKr(totalSum * 1.25)}</span></div>
            </div>
          </section>
        )}

        {feil && <p className="feilmelding">{feil}</p>}
        <button className="btn btn-primary btn-stor" onClick={onGenerer} disabled={laster}>
          {laster ? 'Genererer tilbud...' : 'Generer profesjonelt tilbud'}
        </button>

      </div>
    </div>
  )
}

function formaterKr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall)
}
