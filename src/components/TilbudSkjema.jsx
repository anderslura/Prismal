import KundeInfo from './KundeInfo.jsx'
import PdfTemavelger from './PdfTemavelger.jsx'
import { useState, useRef } from 'react'
import { hentFirma, lagreFirma, slettFirma, uploadLogo, slettLogo } from '../api/firmaService.js'
import { sokMaterialer, lagreMaterial, slettMaterial } from '../api/materialService.js'

export default function TilbudSkjema({ skjema, oppdater, onGenerer, laster, feil, prisliste, setPrisliste, isPro }) {

  const [nyNavn, setNyNavn] = useState('')
  const [nyAnt, setNyAnt] = useState('')
  const [nyPris, setNyPris] = useState('')
  const [nyHasPaaslag, setNyHasPaaslag] = useState(true)
  const [matForslag, setMatForslag] = useState([])
  const matTimer = useRef(null)
  const [firmaStatus, setFirmaStatus] = useState('') // '' | 'laster' | 'ok' | 'feil'
  const [firmaSlett, setFirmaSlett] = useState('')    // '' | 'bekreft' | 'laster'
  const [logoLaster, setLogoLaster] = useState(false)

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

  async function leggTilMaterial() {
    if (!nyNavn) return
    const ant = parseFloat(nyAnt) || 1
    const pris = parseFloat(nyPris) || 0
    oppdater('materialer', [...skjema.materialer, { id: Date.now(), navn: nyNavn, antall: ant, pris: pris, sum: pris * ant, hasPaaslag: nyHasPaaslag }])
    // Lagre til Supabase-bibliotek (og localStorage som fallback)
    lagreMaterial({ navn: nyNavn, pris, hasPaaslag: nyHasPaaslag }).catch(() => {})
    try {
      const eksisterende = JSON.parse(localStorage.getItem('materialLinjer') || '[]')
      const finnes = eksisterende.some(l => l.navn.toLowerCase() === nyNavn.toLowerCase())
      if (!finnes) localStorage.setItem('materialLinjer', JSON.stringify([...eksisterende, { navn: nyNavn, pris, hasPaaslag: nyHasPaaslag }]))
    } catch {}
    setNyNavn(''); setNyPris(''); setNyAnt(''); setMatForslag([])
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
    // Fjern kun fra dette tilbudet — biblioteket beholdes
    oppdater('materialer', skjema.materialer.filter(m => m.id !== id))
  }

  async function slettFraLibraryOgTilbud(id) {
    const m = skjema.materialer.find(x => x.id === id)
    oppdater('materialer', skjema.materialer.filter(x => x.id !== id))
    if (m) {
      slettMaterial(m.navn).catch(() => {})
      try {
        const oppdatert = JSON.parse(localStorage.getItem('materialLinjer') || '[]').filter(l => l.navn !== m.navn)
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
            <label>Firmanavn {!isPro && <span className="pro-badge">PRO</span>}</label>
            {isPro ? (
              <input type="text" placeholder="Ola Nordmann AS" value={skjema.firmanavn} onChange={e => oppdater('firmanavn', e.target.value)} />
            ) : (
              <div className="pro-locked">🔒 Tilgjengelig på Pro — <a href="#" className="pro-lenke" onClick={e => { e.preventDefault(); alert('Stripe-betaling kommer snart!') }}>Oppgrader (99 kr/mnd)</a></div>
            )}
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
                    <button className="btn-fjern" onClick={async () => { oppdater('logoUrl', ''); try { await slettLogo() } catch {} }}>×</button>
                  </div>
                ) : (
                  <label className={`logo-velg-knapp${logoLaster ? ' laster' : ''}`}>
                    {logoLaster ? 'Laster opp…' : 'Velg logofil (PNG/JPG/SVG)'}
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" style={{display:'none'}} disabled={logoLaster} onChange={async e => {
                      const fil = e.target.files[0]; if (!fil) return
                      setLogoLaster(true)
                      try {
                        const url = await uploadLogo(fil)
                        oppdater('logoUrl', url)
                      } catch (err) {
                        console.error('Logo opplasting feilet:', err)
                        alert('Logo-opplasting feilet. Prøv en mindre fil.')
                      } finally {
                        setLogoLaster(false)
                      }
                    }} />
                  </label>
                )}
              </div>
            ) : (
              <div className="pro-locked">🔒 Tilgjengelig på Pro-plan (99 kr/mnd)</div>
            )}
          </div>
          {isPro && (
            <div className="firma-knapp-rad">
              <div className="firma-knapp-primær">
                <button
                  className={`btn-firma-lagre${firmaStatus === 'ok' ? ' lagret' : firmaStatus === 'feil' ? ' feil' : ''}`}
                  disabled={firmaStatus === 'laster'}
                  onClick={async () => {
                    setFirmaStatus('laster')
                    try {
                      await lagreFirma({
                        firmanavn: skjema.firmanavn, telefon: skjema.firmaTelefon,
                        epost: skjema.firmaEpost, adresse: skjema.firmaAdresse,
                        orgnr: skjema.firmaOrgnr, nettside: skjema.firmaNettside,
                        logoUrl: skjema.logoUrl,
                      })
                      setFirmaStatus('ok')
                      setTimeout(() => setFirmaStatus(''), 2500)
                    } catch (e) {
                      console.error('Firma lagring feilet:', e)
                      setFirmaStatus('feil')
                      setTimeout(() => setFirmaStatus(''), 3000)
                    }
                  }}
                >
                  {firmaStatus === 'laster' ? 'Lagrer…' : firmaStatus === 'ok' ? '✓ Lagret' : firmaStatus === 'feil' ? 'Feil – prøv igjen' : 'Lagre bedriftsprofil'}
                </button>
                <button
                  className="btn-firma-hent"
                  onClick={async () => {
                    try {
                      const f = await hentFirma()
                      if (!f) return alert('Ingen lagret profil funnet.')
                      if (f.firmanavn)  oppdater('firmanavn',    f.firmanavn)
                      if (f.telefon)    oppdater('firmaTelefon', f.telefon)
                      if (f.epost)      oppdater('firmaEpost',   f.epost)
                      if (f.adresse)    oppdater('firmaAdresse', f.adresse)
                      if (f.orgnr)      oppdater('firmaOrgnr',   f.orgnr)
                      if (f.nettside)   oppdater('firmaNettside',f.nettside)
                      if (f.logo_url)   oppdater('logoUrl',      f.logo_url)
                    } catch (e) { console.error('Hent firma feilet:', e) }
                  }}
                >↩ Hent lagret profil</button>
              </div>
              <div className="firma-knapp-sekundær">
                <button
                  className="firma-lenke"
                  onClick={() => {
                    ;['firmanavn','firmaTelefon','firmaEpost','firmaAdresse','firmaOrgnr','firmaNettside','logoUrl'].forEach(f => oppdater(f, ''))
                    localStorage.removeItem('firma'); localStorage.removeItem('logoUrl')
                  }}
                >Nullstill felt</button>
                <span className="firma-skillelinje">|</span>
                <button
                  className={`firma-lenke roed${firmaSlett === 'bekreft' ? ' bekreft' : ''}`}
                  disabled={firmaSlett === 'laster'}
                  onClick={async () => {
                    if (firmaSlett !== 'bekreft') {
                      setFirmaSlett('bekreft')
                      setTimeout(() => setFirmaSlett(p => p === 'bekreft' ? '' : p), 4000)
                      return
                    }
                    setFirmaSlett('laster')
                    try {
                      await slettFirma()
                      ;['firmanavn','firmaTelefon','firmaEpost','firmaAdresse','firmaOrgnr','firmaNettside','logoUrl'].forEach(f => oppdater(f, ''))
                      localStorage.removeItem('firma'); localStorage.removeItem('logoUrl')
                    } catch (e) { console.error(e) }
                    setFirmaSlett('')
                  }}
                >
                  {firmaSlett === 'bekreft' ? 'Bekreft sletting?' : firmaSlett === 'laster' ? 'Sletter…' : 'Slett fra sky'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* KUNDE */}
        <KundeInfo
          kunde={{
            kundenavn: skjema.kundenavn,
            kundeAdresse: skjema.kundeAdresse,
            kundeEpost: skjema.kundeEpost,
            kundeMobil: skjema.kundeMobil || '',
          }}
          onChange={oppdater}
          onNullstill={() => {
            ;['kundenavn','kundeAdresse','kundeEpost','kundeMobil','beskrivelse'].forEach(f => oppdater(f, ''))
            oppdater('materialer', [])
            oppdater('arbeidere', [{id:Date.now(), timer:'', timepris: (() => { try { return localStorage.getItem('timepris')||'' } catch { return '' } })()}])
          }}
        />

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
            <p className="mat-mal-hint">Lagrede linjer — fyll inn antall for å ta dem med i tilbudet. × fjerner fra tilbudet · 🗑 sletter fra biblioteket.</p>
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
              <div className="mat-knapp-gruppe">
                <button className="btn-fjern" title="Fjern fra tilbudet" onClick={() => fjernMaterial(m.id)}>×</button>
                <button className="btn-slett-lib" title="Slett fra bibliotek" onClick={() => slettFraLibraryOgTilbud(m.id)}>🗑</button>
              </div>
            </div>
          ))}

          {/* NY LINJE */}
          <p className="mat-info-tekst">Skriv beskrivelse for forslag fra biblioteket. Ny linje lagres automatisk.</p>
          <div className="mat-ny-wrapper">
            <div className="mat-rad mat-ny-rad">
              <div className="mat-ny-navn-wrapper">
                <input type="text" placeholder="Beskrivelse" value={nyNavn}
                  className="mat-ny-navn"
                  autoComplete="off"
                  onChange={e => {
                    const v = e.target.value; setNyNavn(v)
                    clearTimeout(matTimer.current)
                    if (v.length < 1) { setMatForslag([]); return }
                    matTimer.current = setTimeout(async () => {
                      try { setMatForslag(await sokMaterialer(v)) } catch {}
                    }, 200)
                  }}
                  onBlur={() => setTimeout(() => setMatForslag([]), 150)}
                  onKeyDown={e => e.key==='Enter' && leggTilMaterial()} />
                {matForslag.length > 0 && (
                  <ul className="mat-dropdown">
                    {matForslag.map(m => (
                      <li key={m.id} onMouseDown={() => {
                        setNyNavn(m.navn); setNyPris(String(m.pris)); setNyHasPaaslag(m.has_paaslag); setMatForslag([])
                      }}>
                        <span className="mat-dropdown-navn">{m.navn}</span>
                        <span className="mat-dropdown-pris">{m.pris ? `${m.pris} kr` : ''}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
          </div>
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
            {[10, 15, 20].map(p => (
              <button
                key={p}
                className={`paaslag-hurtig${parseFloat(skjema.paaslagProsent) === p ? ' aktiv' : ''}`}
                onClick={() => oppdater('paaslagProsent', String(p))}
              >{p}%</button>
            ))}
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

        {/* PDF-TEMA */}
        <section className="skjema-seksjon">
          <PdfTemavelger valgtTema={skjema.pdfTema || 'standard'} onVelg={v => oppdater('pdfTema', v)} />
        </section>

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
