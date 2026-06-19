import KundeInfo from './KundeInfo.jsx'
import PdfTemavelger from './PdfTemavelger.jsx'
import { useState, useRef, useEffect } from 'react'
import { hentFirma, lagreFirma, slettFirma, uploadLogo, slettLogo } from '../api/firmaService.js'
import { sokMaterialer, lagreMaterial, slettMaterial } from '../api/materialService.js'

function MaterialKategoriInput({ value, onCommit }) {
  const [tekst, setTekst] = useState(value || '')
  const harFokus = useRef(false)

  useEffect(() => {
    if (!harFokus.current) setTekst(value || '')
  }, [value])

  function commit() {
    if (tekst !== (value || '')) onCommit(tekst)
  }

  return (
    <input type="text" list="mat-kategori-forslag" value={tekst}
      placeholder="Kategori (valgfritt) – f.eks. Kjøkken, Bad …"
      onFocus={() => { harFokus.current = true }}
      onChange={e => setTekst(e.target.value)}
      onBlur={() => { harFokus.current = false; commit() }}
      onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} />
  )
}

export default function TilbudSkjema({ skjema, oppdater, onGenerer, laster, feil, prisliste, setPrisliste, isPro }) {

  const [nyNavn, setNyNavn] = useState('')
  const [nyAnt, setNyAnt] = useState('')
  const [nyPris, setNyPris] = useState('')
  const [nyHasPaaslag, setNyHasPaaslag] = useState(true)
  const [nyKategori, setNyKategori] = useState('')
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
    // Kategori er kun en per-tilbud organiseringsetikett — lagres IKKE til det delte materialbiblioteket
    oppdater('materialer', [...skjema.materialer, { id: Date.now(), navn: nyNavn, antall: ant, pris: pris, sum: pris * ant, hasPaaslag: nyHasPaaslag, kategori: nyKategori || '' }])
    // Lagre til Supabase-bibliotek (og localStorage som fallback)
    lagreMaterial({ navn: nyNavn, pris, hasPaaslag: nyHasPaaslag }).catch(() => {})
    try {
      const eksisterende = JSON.parse(localStorage.getItem('materialLinjer') || '[]')
      const finnes = eksisterende.some(l => l.navn.toLowerCase() === nyNavn.toLowerCase())
      if (!finnes) localStorage.setItem('materialLinjer', JSON.stringify([...eksisterende, { navn: nyNavn, pris, hasPaaslag: nyHasPaaslag }]))
    } catch {}
    setNyNavn(''); setNyPris(''); setNyAnt(''); setMatForslag([]); setNyKategori('')
  }


  function oppdaterBomRad(id, felt, val) { oppdater('bom', skjema.bom.map(b => b.id === id ? {...b, [felt]: val} : b)) }
  function oppdaterParkeringRad(id, felt, val) { oppdater('parkering', skjema.parkering.map(p => p.id === id ? {...p, [felt]: val} : p)) }
  function oppdaterFergeRad(id, felt, val) { oppdater('ferge', skjema.ferge.map(f => f.id === id ? {...f, [felt]: val} : f)) }
  function oppdaterMiljoRad(id, felt, val) { oppdater('miljoavgifter', skjema.miljoavgifter.map(m => m.id === id ? {...m, [felt]: val} : m)) }
  function leggTilMiljoRad(navn = '', antall = '') { oppdater('miljoavgifter', [...(skjema.miljoavgifter||[]), { id: Date.now(), navn, antall, pris: '' }]) }
  function fjernMiljoRad(id) { oppdater('miljoavgifter', skjema.miljoavgifter.filter(m => m.id !== id)) }
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
  const kjoringSum        = (parseFloat(skjema.kjoringKm)||0) * (parseFloat(skjema.kjoringSats)||0)
  const kjoringHengerSum  = (parseFloat(skjema.kjoringHengerKm)||0) * (parseFloat(skjema.kjoringHengerSats)||0)
  const hengerleieSum     = (parseFloat(skjema.hengerleieDager)||0) * (parseFloat(skjema.hengerleieSats)||0)
  const maskinleieSum     = (parseFloat(skjema.maskinleieDager)||0) * (parseFloat(skjema.maskinleieSats)||0)
  const bomSum        = (skjema.bom       || []).reduce((s, b) => s + (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0), 0)
  const parkeringSum  = (skjema.parkering  || []).reduce((s, p) => s + (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0), 0)
  const fergeSum      = (skjema.ferge      || []).reduce((s, f) => s + (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0), 0)
  const miljoAvgifterSum = (skjema.miljoavgifter || []).reduce((s, m) => s + (parseFloat(m.antall)||0)*(parseFloat(m.pris)||0), 0)
  const miljoPaaslag = miljoAvgifterSum * (parseFloat(skjema.miljoPaaslagProsent)||0) / 100
  const totalTransport = kjoringSum + kjoringHengerSum + hengerleieSum + maskinleieSum + bomSum + parkeringSum + fergeSum
  const totalSum = totalArbeid + totalMaterialer + paaslag + miljoAvgifterSum + miljoPaaslag + totalTransport
  const kategoriListe = [...new Set((skjema.materialer || []).map(m => m.kategori).filter(Boolean))]

  // Materialer gruppert etter kategori for redigeringsvisningen (drag-and-drop mellom grupper).
  // Uten kategori i bruk: én gruppe uten overskrift — visuelt identisk med den gamle flate listen.
  // Navngitte kategorier vises først; "Ikke kategorisert" vises sist (samme rekkefølge som
  // i forhåndsvisningen og PDF-en — se TilbudPreview.jsx og pdf.js).
  const materialKategoriGrupper = (() => {
    const nokler = []
    const map = {}
    skjema.materialer.forEach(m => {
      const key = m.kategori || ''
      if (!(key in map)) { map[key] = []; nokler.push(key) }
      map[key].push(m)
    })
    const grupper = []
    nokler.filter(Boolean).forEach(k => grupper.push({ kategori: k, rader: map[k] }))
    if (map['']) grupper.push({ kategori: null, rader: map[''] })
    return grupper
  })()
  const visKategoriOverskrift = materialKategoriGrupper.some(g => g.kategori)

  function flyttMaterialTilKategori(e, kategoriNavn) {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) oppdaterMaterial(Number(id), 'kategori', kategoriNavn)
  }

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
              <div className="pro-locked">🔒 Tilgjengelig på Pro — <a href="#" className="pro-lenke" onClick={e => { e.preventDefault(); alert('Stripe-betaling kommer snart!') }}>Oppgrader (99 kr/mnd eks. mva)</a></div>
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
              <span className="felt-hint">Mottar kopi av alle sendte tilbud</span>
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
          <div className="felt-rad">
            <div className="felt-gruppe">
              <label>Facebook – navn</label>
              <input type="text" placeholder="Firmanavn AS" value={skjema.firmaFacebookNavn||''} onChange={e => oppdater('firmaFacebookNavn', e.target.value)} />
              <span className="felt-hint">Uten lenke vises dette bare som vanlig tekst i tilbudet.</span>
            </div>
            <div className="felt-gruppe">
              <label>Facebook – lenke</label>
              <input type="text" placeholder="https://facebook.com/firmanavn" value={skjema.firmaFacebookUrl||''} onChange={e => oppdater('firmaFacebookUrl', e.target.value)} />
              <span className="felt-hint">Med lenke blir det en klikkbar knapp som leder rett til Facebook-siden din.</span>
            </div>
          </div>
          <div className="felt-gruppe">
            <label className="checkbox-label">
              <input type="checkbox" checked={skjema.firmaMvaPliktig !== false} onChange={e => oppdater('firmaMvaPliktig', e.target.checked)} />
              Momsregistrert (MVA-pliktig)
            </label>
            <span className="felt-hint">Du blir mva-pliktig når omsetningen passerer 50 000 kr i en 12-måneders periode. Før det — la denne stå uhuket, da vises tilbud uten mva-tillegg.</span>
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
              <div className="pro-locked">🔒 Tilgjengelig på Pro-plan (99 kr/mnd eks. mva)</div>
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
                        logoUrl: skjema.logoUrl, mvaPliktig: skjema.firmaMvaPliktig,
                        facebookNavn: skjema.firmaFacebookNavn, facebookUrl: skjema.firmaFacebookUrl,
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
                      if (typeof f.mva_pliktig === 'boolean') oppdater('firmaMvaPliktig', f.mva_pliktig)
                      if (f.facebook_navn) oppdater('firmaFacebookNavn', f.facebook_navn)
                      if (f.facebook_url)  oppdater('firmaFacebookUrl',  f.facebook_url)
                    } catch (e) { console.error('Hent firma feilet:', e) }
                  }}
                >↩ Hent lagret profil</button>
              </div>
              <div className="firma-knapp-sekundær">
                <button
                  className="firma-lenke"
                  onClick={() => {
                    ;['firmanavn','firmaTelefon','firmaEpost','firmaAdresse','firmaOrgnr','firmaNettside','firmaFacebookNavn','firmaFacebookUrl','logoUrl'].forEach(f => oppdater(f, ''))
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
                      ;['firmanavn','firmaTelefon','firmaEpost','firmaAdresse','firmaOrgnr','firmaNettside','firmaFacebookNavn','firmaFacebookUrl','logoUrl'].forEach(f => oppdater(f, ''))
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
            <p className="felt-hint">Skriv gjerne i stikkord, ufullstendige setninger eller med skrivefeil — AI omformer dette til profesjonell tilbudstekst. Du kan alltid redigere resultatet etterpå.</p>
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
            <span title="Påslag">%</span>
            <span></span>
          </div>
          <p className="mat-info-tekst mat-info-antall">Kun linjer med antall kommer med i tilbudet.</p>

          {/* EKSISTERENDE LINJER — gruppert etter kategori (overskrift vises kun når kategori er i bruk) */}

          {materialKategoriGrupper.map((gruppe, gi) => (
            <div key={gruppe.kategori || `_ukat_${gi}`} className="mat-kategori-gruppe"
              onDragOver={e => e.preventDefault()}
              onDrop={e => flyttMaterialTilKategori(e, gruppe.kategori || '')}
            >
              {gruppe.kategori && <div className="mat-kategori-header">{gruppe.kategori}</div>}
              {!gruppe.kategori && visKategoriOverskrift && (
                <div className="mat-kategori-header mat-kategori-header-ukat">Ikke kategorisert</div>
              )}
              {gruppe.rader.map(m => (
                <div key={m.id} className={`mat-rad${(!m.antall || m.antall == 0) ? ' mat-rad-mal' : ''}`}>
                  <span className="mat-fast-navn" draggable
                    onDragStart={e => e.dataTransfer.setData('text/plain', String(m.id))}
                    title="Dra for å flytte til en annen kategori">{m.navn}</span>
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
                  <button className="btn-slett-lib" title="Slett fra bibliotek" onClick={() => slettFraLibraryOgTilbud(m.id)}>🗑</button>
                  <div className="mat-kategori-felt">
                    <MaterialKategoriInput value={m.kategori} onCommit={v => oppdaterMaterial(m.id, 'kategori', v)} />
                  </div>
                </div>
              ))}
            </div>
          ))}
          <datalist id="mat-kategori-forslag">
            {kategoriListe.map(k => <option key={k} value={k} />)}
          </datalist>

          {/* NY LINJE */}
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
              <button onClick={leggTilMaterial} className="btn-legg-til-mat">Legg til</button>
              <div className="mat-kategori-felt">
                <input type="text" list="mat-kategori-forslag" value={nyKategori} placeholder="Kategori (valgfritt) – f.eks. Kjøkken, Bad …"
                  onChange={e => setNyKategori(e.target.value)}
                  onKeyDown={e => e.key==='Enter' && leggTilMaterial()} />
              </div>
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
            <div className="paaslag-hurtig-gruppe">
              {[10, 20, 30].map(p => (
                <button
                  key={p}
                  className={`paaslag-hurtig${parseFloat(skjema.paaslagProsent) === p ? ' aktiv' : ''}`}
                  onClick={() => oppdater('paaslagProsent', String(p))}
                >{p}%</button>
              ))}
            </div>
            {parseFloat(skjema.paaslagProsent) > 0 && materialerMedPaaslag > 0 && (
              <span className="paaslag-resultat">= +{formaterKr(paaslag)}</span>
            )}
          </div>
        </section>

        {/* MILJØAVGIFTER */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Miljøavgifter</h2>

          <div className="trans-header">
            <span>Beskrivelse</span>
            <span>Antall</span>
            <span>Kr</span>
            <span>Sum</span>
            <span></span>
          </div>

          {(skjema.miljoavgifter || []).map((m) => {
            const sum = (parseFloat(m.antall)||0)*(parseFloat(m.pris)||0)
            return (
              <div key={m.id} className="trans-rad">
                <input type="text" placeholder="Beskrivelse" maxLength={40}
                  className="trans-input trans-input-navn" value={m.navn}
                  onChange={e => oppdaterMiljoRad(m.id, 'navn', e.target.value)} />
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={m.antall}
                  onChange={e => oppdaterMiljoRad(m.id, 'antall', e.target.value)} />
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={m.pris}
                  onChange={e => oppdaterMiljoRad(m.id, 'pris', e.target.value)} />
                <span className="trans-sum">{sum > 0 ? formaterKr(sum) : ''}</span>
                <button className="btn-fjern" onClick={() => fjernMiljoRad(m.id)}>×</button>
              </div>
            )
          })}

          <div className="tema-rad">
            <button className="paaslag-hurtig" onClick={() => leggTilMiljoRad('Kildesortering (kubikk / henger)')}>+ Kildesortering</button>
            <button className="paaslag-hurtig" onClick={() => leggTilMiljoRad('Spesialavfall')}>+ Spesialavfall</button>
            <button className="paaslag-hurtig" onClick={() => leggTilMiljoRad('Miljøgebyr')}>+ Miljøgebyr</button>
            <button className="trans-legg-til" onClick={() => leggTilMiljoRad()}>+ Legg til egendefinert</button>
          </div>

          <div className="paaslag-rad">
            <span>Påslag miljøavgifter</span>
            <input type="number" min="0" max="100" placeholder="0"
              className="paaslag-input" value={skjema.miljoPaaslagProsent}
              onChange={e => oppdater('miljoPaaslagProsent', e.target.value)} />
            <span className="paaslag-symbol">%</span>
            <div className="paaslag-hurtig-gruppe">
              {[10, 20, 30].map(pr => (
                <button key={pr}
                  className={`paaslag-hurtig${parseFloat(skjema.miljoPaaslagProsent) === pr ? ' aktiv' : ''}`}
                  onClick={() => oppdater('miljoPaaslagProsent', pr)}
                >{pr}%</button>
              ))}
            </div>
            {parseFloat(skjema.miljoPaaslagProsent) > 0 && miljoAvgifterSum > 0 && (
              <span className="paaslag-resultat">= +{formaterKr(miljoPaaslag)}</span>
            )}
          </div>
        </section>

        {/* TRANSPORT */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Transport</h2>

          {/* KOLONNEOVERSKRIFTER */}
          <div className="trans-header">
            <span>Beskrivelse</span>
            <span>KM / Ant.</span>
            <span>Kr</span>
            <span>Sum</span>
            <span></span>
          </div>

          {/* Kjøring */}
          <div className="trans-rad">
            <span className="trans-navn">Kjøring</span>
            <input type="number" min="0" placeholder="0"
              className="trans-input" value={skjema.kjoringKm}
              onChange={e => oppdater('kjoringKm', e.target.value)} />
            <input type="number" min="0" step="0.1" placeholder="kr/km"
              className="trans-input" value={skjema.kjoringSats}
              onChange={e => oppdater('kjoringSats', e.target.value)} />
            <span className="trans-sum">{kjoringSum > 0 ? formaterKr(kjoringSum) : ''}</span>
            <span></span>
          </div>

          {/* Kjøring (bil + henger) */}
          <div className="trans-rad">
            <span className="trans-navn">Bil + henger</span>
            <input type="number" min="0" placeholder="0"
              className="trans-input" value={skjema.kjoringHengerKm}
              onChange={e => oppdater('kjoringHengerKm', e.target.value)} />
            <input type="number" min="0" step="0.1" placeholder="kr/km"
              className="trans-input" value={skjema.kjoringHengerSats}
              onChange={e => oppdater('kjoringHengerSats', e.target.value)} />
            <span className="trans-sum">{kjoringHengerSum > 0 ? formaterKr(kjoringHengerSum) : ''}</span>
            <span></span>
          </div>

          {/* Leie av henger */}
          <div className="trans-rad">
            <span className="trans-navn">Leie av henger</span>
            <input type="number" min="0" placeholder="dager"
              className="trans-input" value={skjema.hengerleieDager}
              onChange={e => oppdater('hengerleieDager', e.target.value)} />
            <input type="number" min="0" placeholder="kr/dag"
              className="trans-input" value={skjema.hengerleieSats}
              onChange={e => oppdater('hengerleieSats', e.target.value)} />
            <span className="trans-sum">{hengerleieSum > 0 ? formaterKr(hengerleieSum) : ''}</span>
            <span></span>
          </div>

          {/* Maskinleie */}
          <div className="trans-rad">
            <span className="trans-navn">Maskinleie</span>
            <input type="number" min="0" placeholder="dager"
              className="trans-input" value={skjema.maskinleieDager}
              onChange={e => oppdater('maskinleieDager', e.target.value)} />
            <input type="number" min="0" placeholder="kr/dag"
              className="trans-input" value={skjema.maskinleieSats}
              onChange={e => oppdater('maskinleieSats', e.target.value)} />
            <span className="trans-sum">{maskinleieSum > 0 ? formaterKr(maskinleieSum) : ''}</span>
            <span></span>
          </div>

          {/* Bom */}
          {(skjema.bom || []).map((b, i, arr) => {
            const s = (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0)
            const erSiste = i === arr.length - 1
            return (
              <div key={b.id} className="trans-rad">
                <span className="trans-navn">Bom</span>
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={b.antall}
                  onChange={e => oppdaterBomRad(b.id, 'antall', e.target.value)} />
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={b.pris}
                  onChange={e => oppdaterBomRad(b.id, 'pris', e.target.value)} />
                <span className="trans-sum">{s > 0 ? formaterKr(s) : ''}</span>
                <div className="trans-rad-knapper">
                  <button className="btn-fjern" onClick={() => oppdater('bom', skjema.bom.filter(x => x.id !== b.id))}>×</button>
                  {erSiste && (
                    <button type="button" className="trans-legg-til-inline" title="Legg til bom"
                      onClick={() => oppdater('bom', [...skjema.bom, { id: Date.now(), antall: '', pris: '' }])}>+</button>
                  )}
                </div>
              </div>
            )
          })}
          {(skjema.bom || []).length === 0 && (
            <button className="trans-legg-til" onClick={() => oppdater('bom', [...(skjema.bom||[]), { id: Date.now(), antall: '', pris: '' }])}>+ Legg til bom</button>
          )}

          {/* Parkering */}
          {(skjema.parkering || []).map((p, i, arr) => {
            const s = (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0)
            const erSiste = i === arr.length - 1
            return (
              <div key={p.id} className="trans-rad">
                <span className="trans-navn">Parkering</span>
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={p.antall}
                  onChange={e => oppdaterParkeringRad(p.id, 'antall', e.target.value)} />
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={p.pris}
                  onChange={e => oppdaterParkeringRad(p.id, 'pris', e.target.value)} />
                <span className="trans-sum">{s > 0 ? formaterKr(s) : ''}</span>
                <div className="trans-rad-knapper">
                  <button className="btn-fjern" onClick={() => oppdater('parkering', skjema.parkering.filter(x => x.id !== p.id))}>×</button>
                  {erSiste && (
                    <button type="button" className="trans-legg-til-inline" title="Legg til parkering"
                      onClick={() => oppdater('parkering', [...skjema.parkering, { id: Date.now(), antall: '', pris: '' }])}>+</button>
                  )}
                </div>
              </div>
            )
          })}
          {(skjema.parkering || []).length === 0 && (
            <button className="trans-legg-til" onClick={() => oppdater('parkering', [...(skjema.parkering||[]), { id: Date.now(), antall: '', pris: '' }])}>+ Legg til parkering</button>
          )}

          {/* Ferge */}
          {(skjema.ferge || []).map((f, i, arr) => {
            const s = (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0)
            const erSiste = i === arr.length - 1
            return (
              <div key={f.id} className="trans-rad">
                <span className="trans-navn">Ferge</span>
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={f.antall}
                  onChange={e => oppdaterFergeRad(f.id, 'antall', e.target.value)} />
                <input type="number" min="0" placeholder="0"
                  className="trans-input" value={f.pris}
                  onChange={e => oppdaterFergeRad(f.id, 'pris', e.target.value)} />
                <span className="trans-sum">{s > 0 ? formaterKr(s) : ''}</span>
                <div className="trans-rad-knapper">
                  <button className="btn-fjern" onClick={() => oppdater('ferge', skjema.ferge.filter(x => x.id !== f.id))}>×</button>
                  {erSiste && (
                    <button type="button" className="trans-legg-til-inline" title="Legg til ferge"
                      onClick={() => oppdater('ferge', [...skjema.ferge, { id: Date.now(), antall: '', pris: '' }])}>+</button>
                  )}
                </div>
              </div>
            )
          })}
          {(skjema.ferge || []).length === 0 && (
            <button className="trans-legg-til" onClick={() => oppdater('ferge', [...(skjema.ferge||[]), { id: Date.now(), antall: '', pris: '' }])}>+ Legg til ferge</button>
          )}

        </section>

        {/* SUM */}
        {totalSum > 0 && (
          <section className="skjema-seksjon sum-seksjon">
            <h2 className="seksjon-tittel">Estimert total</h2>
            <div className="sum-tabell">
              {totalArbeid > 0 && <div className="sum-linje"><span>Arbeid</span><span>{formaterKr(totalArbeid)}</span></div>}
              {totalMaterialer > 0 && <div className="sum-linje"><span>Materialer</span><span>{formaterKr(totalMaterialer)}</span></div>}
              {paaslag > 0 && <div className="sum-linje"><span>Påslag {skjema.paaslagProsent}%</span><span>{formaterKr(paaslag)}</span></div>}
              {miljoAvgifterSum > 0 && <div className="sum-linje"><span>Miljøavgifter</span><span>{formaterKr(miljoAvgifterSum)}</span></div>}
              {miljoPaaslag > 0 && <div className="sum-linje"><span>Påslag miljøavgifter {skjema.miljoPaaslagProsent}%</span><span>{formaterKr(miljoPaaslag)}</span></div>}
              {kjoringSum > 0 && <div className="sum-linje"><span>Kjøring</span><span>{formaterKr(kjoringSum)}</span></div>}
              {kjoringHengerSum > 0 && <div className="sum-linje"><span>Bil + henger</span><span>{formaterKr(kjoringHengerSum)}</span></div>}
              {hengerleieSum > 0 && <div className="sum-linje"><span>Leie av henger</span><span>{formaterKr(hengerleieSum)}</span></div>}
              {maskinleieSum > 0 && <div className="sum-linje"><span>Maskinleie</span><span>{formaterKr(maskinleieSum)}</span></div>}
              {bomSum       > 0 && <div className="sum-linje"><span>Bom</span><span>{formaterKr(bomSum)}</span></div>}
              {parkeringSum > 0 && <div className="sum-linje"><span>Parkering</span><span>{formaterKr(parkeringSum)}</span></div>}
              {fergeSum     > 0 && <div className="sum-linje"><span>Ferge</span><span>{formaterKr(fergeSum)}</span></div>}
              {skjema.firmaMvaPliktig !== false ? (
                <>
                  <div className="sum-linje sum-total"><span>Total eks. mva</span><span>{formaterKr(totalSum)}</span></div>
                  <div className="sum-linje sum-mva"><span>Inkl. 25% mva</span><span>{formaterKr(totalSum * 1.25)}</span></div>
                </>
              ) : (
                <div className="sum-linje sum-total"><span>Totalt</span><span>{formaterKr(totalSum)}</span></div>
              )}
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
