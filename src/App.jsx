import { useState, useEffect } from 'react'
import TilbudSkjema from './components/TilbudSkjema.jsx'
import TilbudPreview from './components/TilbudPreview.jsx'
import { genererTilbudstekst } from './api/claude.js'
import { lastNedPDF } from './api/pdf.js'
import Landingsside from './components/Landingsside.jsx'
import PrismalLogo from './components/PrismalLogo.jsx'
import LoginModal from './components/LoginModal.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import { hentFirma } from './api/firmaService.js'
import { hentMaterialer } from './api/materialService.js'

const TOM_SKJEMA = {
  firmanavn: '', firmaTelefon: '', firmaEpost: '', firmaAdresse: '',
  firmaOrgnr: '', firmaNettside: '', kundenavn: '', kundeAdresse: '',
  kundeEpost: '', kundeMobil: '', beskrivelse: '', arbeidere: [], materialer: [],
  logoUrl: '', tilbudstekst: '', pdfTema: 'standard',
  tilbudsnummer: '', dato: new Date().toLocaleDateString('no-NO'),
}

function hentLagretFirma() {
  try { return JSON.parse(localStorage.getItem('firma') || '{}') } catch { return {} }
}
function hentLagretMaterialMal() {
  try {
    const lagret = localStorage.getItem('materialMal')
    if (!lagret) return []
    return JSON.parse(lagret).map(m => ({ ...m, id: Date.now() + Math.random(), antall: 0, sum: 0 }))
  } catch { return [] }
}
function hentLagretTimepris() {
  try { return localStorage.getItem('timepris') || '' } catch { return '' }
}
function hentLagretLogo() {
  try { return localStorage.getItem('logoUrl') || '' } catch { return '' }
}
function hentLagretPrisliste() {
  try { return JSON.parse(localStorage.getItem('prisliste') || '[]') } catch { return [] }
}

function AppInnhold() {
  const {
    bruker, laster: authLaster, loggUt, isPro,
    kanBrukeForsok, forsokGjenstaende, registrerForsok, MAKS_GRATIS_FORSOK,
    trengerRegistrering, trengerOppgradering
  } = useAuth()

  const [skjema, setSkjema] = useState(() => ({
    ...TOM_SKJEMA,
    ...(isPro ? hentLagretFirma() : {}),
    logoUrl: isPro ? hentLagretLogo() : '',
    arbeidere: [{ id: 1, navn: 'Fagarbeider', timer: '', timepris: hentLagretTimepris() }],
    materialer: hentLagretMaterialMal(),
    tilbudsnummer: genererTilbudsnummer(),
  }))
  const [prisliste, setPrisliste] = useState(hentLagretPrisliste)
  const [laster, setLaster] = useState(false)
  const [feil, setFeil] = useState('')
  const [steg, setSteg] = useState('landing')
  const [visLogin, setVisLogin] = useState(false)
  const [visOppgrader, setVisOppgrader] = useState(false)

  useEffect(() => {
    if (bruker && visLogin) {
      setVisLogin(false)
      setSteg('skjema')
    }
  }, [bruker])

  // Last firmaprofil fra Supabase ved innlogging
  useEffect(() => {
    if (!bruker || !isPro) return
    hentFirma().then(f => {
      if (!f) return
      if (f.firmanavn)  oppdater('firmanavn',    f.firmanavn)
      if (f.telefon)    oppdater('firmaTelefon', f.telefon)
      if (f.epost)      oppdater('firmaEpost',   f.epost)
      if (f.adresse)    oppdater('firmaAdresse', f.adresse)
      if (f.orgnr)      oppdater('firmaOrgnr',   f.orgnr)
      if (f.nettside)   oppdater('firmaNettside',f.nettside)
      if (f.logo_url)   oppdater('logoUrl',      f.logo_url)
    }).catch(e => console.error('Kunne ikke hente firma:', e))
  }, [bruker])

  // Last materialbibliotek fra Supabase ved innlogging
  useEffect(() => {
    if (!bruker) return
    hentMaterialer().then(liste => {
      if (!liste.length) return
      // Bygg mal-linjer (antall=0) fra Supabase – erstatter localStorage-biblioteket
      const malLinjer = liste.map(m => ({
        id: Date.now() + Math.random(),
        navn: m.navn,
        antall: 0,
        pris: Number(m.pris) || 0,
        sum: 0,
        hasPaaslag: m.has_paaslag,
      }))
      setSkjema(prev => {
        // Behold linjer med antall > 0 (bruker har allerede fylt inn noe)
        const aktive = prev.materialer.filter(m => m.antall > 0)
        // Legg til mal-linjer som ikke allerede er lagt til aktivt
        const aktivNavn = new Set(aktive.map(m => m.navn.toLowerCase()))
        const nye = malLinjer.filter(m => !aktivNavn.has(m.navn.toLowerCase()))
        return { ...prev, materialer: [...aktive, ...nye] }
      })
    }).catch(e => console.error('Kunne ikke hente materialer:', e))
  }, [bruker])

  useEffect(() => {
    if (!isPro) return
    const firma = {
      firmanavn: skjema.firmanavn, firmaTelefon: skjema.firmaTelefon,
      firmaEpost: skjema.firmaEpost, firmaAdresse: skjema.firmaAdresse,
      firmaOrgnr: skjema.firmaOrgnr, firmaNettside: skjema.firmaNettside,
    }
    localStorage.setItem('firma', JSON.stringify(firma))
  }, [skjema.firmanavn, skjema.firmaTelefon, skjema.firmaEpost, skjema.firmaAdresse, skjema.firmaOrgnr, skjema.firmaNettside, isPro])

  useEffect(() => {
    if (isPro) localStorage.setItem('logoUrl', skjema.logoUrl || '')
  }, [skjema.logoUrl, isPro])

  useEffect(() => {
    const mal = skjema.materialer.map(m => ({ navn: m.navn, pris: m.pris, hasPaaslag: m.hasPaaslag }))
    localStorage.setItem('materialMal', JSON.stringify(mal))
  }, [skjema.materialer])

  useEffect(() => {
    if (skjema.arbeidere.length > 0 && skjema.arbeidere[0].timepris)
      localStorage.setItem('timepris', skjema.arbeidere[0].timepris)
  }, [skjema.arbeidere])

  useEffect(() => {
    localStorage.setItem('prisliste', JSON.stringify(prisliste))
  }, [prisliste])

  function oppdater(felt, verdi) {
    setSkjema(prev => ({ ...prev, [felt]: verdi }))
  }

  async function generer() {
    if (!skjema.kundenavn || !skjema.beskrivelse) {
      setFeil('Fyll inn kundenavn og beskrivelse av jobben.')
      return
    }
    if (!kanBrukeForsok) {
      setVisOppgrader(true)
      return
    }
    setFeil('')
    setLaster(true)
    try {
      const tekst = await genererTilbudstekst(skjema)
      setSkjema(prev => ({ ...prev, tilbudstekst: tekst }))
      registrerForsok()
      setSteg('preview')
    } catch (e) {
      setFeil('Kunne ikke generere tilbudstekst. Prøv igjen.')
    } finally {
      setLaster(false)
    }
  }

  function nullstill() {
    const lagredeMat = (() => { try { return JSON.parse(localStorage.getItem('materialLinjer') || '[]') } catch { return [] } })()
    const forhandslagte = lagredeMat.map(l => ({ id: Date.now() + Math.random(), navn: l.navn, antall: 0, pris: Number(l.pris) || 0, sum: 0, hasPaaslag: l.hasPaaslag }))
    setSkjema({
      ...TOM_SKJEMA,
      ...(isPro ? hentLagretFirma() : {}),
      logoUrl: isPro ? hentLagretLogo() : '',
      arbeidere: [{ id: Date.now(), navn: 'Fagarbeider', timer: '', timepris: hentLagretTimepris() }],
      materialer: forhandslagte,
      tilbudsnummer: genererTilbudsnummer(),
    })
    setSteg('skjema')
    setFeil('')
  }

  if (authLaster) return <div className="auth-laster">Laster...</div>

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo" onClick={() => setSteg('landing')} style={{cursor:'pointer'}} title="Til forsiden"><PrismalLogo /></div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {steg === 'preview' && (
              <button className="btn btn-secondary" onClick={() => setSteg('skjema')}>← Tilbake</button>
            )}
            {steg !== 'landing' && (
              <button className="btn btn-secondary" style={{ borderColor: '#16a34a', color: '#16a34a' }} onClick={nullstill}>
                + Nytt tilbud
              </button>
            )}
            {!bruker && (
              <button className="btn btn-secondary" onClick={() => setVisLogin(true)}>Logg inn</button>
            )}
            {steg === 'landing' && (
              <button className="btn btn-primary" onClick={() => bruker ? setSteg('skjema') : setVisLogin(true)}>
                {bruker ? 'Lag tilbud →' : 'Kom i gang →'}
              </button>
            )}
            {bruker && (
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', opacity: 0.7 }} onClick={loggUt} title={bruker.email}>
                Logg ut
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Banner — gratis forsøk-teller */}
      {!isPro && steg === 'skjema' && (
        <div className="gratis-banner">
          {trengerRegistrering ? (
            <span>Registrer deg gratis for å fortsette — du får {MAKS_GRATIS_FORSOK} tilbud inkludert</span>
          ) : trengerOppgradering ? (
            <span>Du har brukt alle {MAKS_GRATIS_FORSOK} gratis tilbud — oppgrader til Pro for å fortsette</span>
          ) : (
            <span>
              {bruker
                ? <><strong>{forsokGjenstaende} av {MAKS_GRATIS_FORSOK} gratis tilbud</strong> gjenstår · Firmainfo og logo krever Pro</>
                : <><strong>1 gratis prøvetilbud</strong> — registrer deg for {MAKS_GRATIS_FORSOK} totalt</>
              }
            </span>
          )}
          <button className="btn-pro-oppgrader" onClick={() => setVisOppgrader(true)}>
            Oppgrader til Pro — 99 kr/mnd eks. mva
          </button>
        </div>
      )}

      <main className={`app-main${steg === 'landing' ? ' app-main--landing' : ''}`}>
        {steg === 'landing' ? (
          <Landingsside onStart={() => setSteg('skjema')} onRegistrer={() => bruker ? setSteg('skjema') : setVisLogin(true)} />
        ) : steg === 'skjema' ? (
          <TilbudSkjema
            skjema={skjema}
            oppdater={oppdater}
            onGenerer={generer}
            laster={laster}
            feil={feil}
            prisliste={prisliste}
            setPrisliste={setPrisliste}
            isPro={isPro}
          />
        ) : (
          <TilbudPreview
            skjema={skjema}
            oppdaterTekst={(tekst) => oppdater('tilbudstekst', tekst)}
            oppdaterTema={(tema) => oppdater('pdfTema', tema)}
            onLastNed={() => lastNedPDF(skjema, isPro)}
            onTilbake={() => setSteg('skjema')}
            onNyttTilbud={nullstill}
            isPro={isPro}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Hjelpeportalen AS · prismal.no</p>
      </footer>

      {visLogin && <LoginModal onLukk={() => setVisLogin(false)} />}

      {visOppgrader && (
        <div className="modal-bakgrunn" onClick={() => setVisOppgrader(false)}>
          <div className="modal-boks oppgrader-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-lukk" onClick={() => setVisOppgrader(false)}>✕</button>
            <div className="oppgrader-ikon">⚡</div>
            <h2>Oppgrader til Pro</h2>
            <p>Du har brukt alle {MAKS_GRATIS_FORSOK} gratis forsøk.</p>
            <ul className="oppgrader-liste">
              <li>✓ Ubegrenset antall tilbud</li>
              <li>✓ Eget firmanavn og logo i PDF</li>
              <li>✓ Ingen Prismal-branding</li>
              <li>✓ Lagrede prislinjer og historikk</li>
            </ul>
            <div className="oppgrader-pris">99 kr <span>/mnd eks. mva</span></div>
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              onClick={() => { alert('Stripe-betaling kommer snart!'); setVisOppgrader(false) }}>
              Kom i gang med Pro
            </button>
            {!bruker && (
              <p className="oppgrader-logginn">
                Allerede Pro? <button onClick={() => { setVisOppgrader(false); setVisLogin(true) }}>Logg inn</button>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInnhold />
    </AuthProvider>
  )
}

function genererTilbudsnummer() {
  const dato = new Date()
  const aar = dato.getFullYear().toString().slice(-2)
  const mnd = String(dato.getMonth() + 1).padStart(2, '0')
  const tilfeldig = Math.floor(Math.random() * 900 + 100)
  return `T${aar}${mnd}-${tilfeldig}`
}
