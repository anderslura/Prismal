import { useState, useEffect } from 'react'
import TilbudSkjema from './components/TilbudSkjema.jsx'
import TilbudPreview from './components/TilbudPreview.jsx'
import { genererTilbudstekst } from './api/claude.js'
import { lastNedPDF } from './api/pdf.js'

const TOM_SKJEMA = {
  firmanavn: '',
  firmaTelefon: '',
  firmaEpost: '',
  firmaAdresse: '',
  firmaOrgnr: '',
  firmaNettside: '',
  kundenavn: '',
  kundeAdresse: '',
  kundeEpost: '',
  beskrivelse: '',
  arbeidere: [], // [{id, navn, timer, timepris}] — støtter flere rader
  materialer: [],
  logoUrl: '',
  tilbudstekst: '',
  tilbudsnummer: '',
  dato: new Date().toLocaleDateString('no-NO'),
}

// Henter lagret firmainformasjon fra localStorage
function hentLagretFirma() {
  try {
    const lagret = localStorage.getItem('firma')
    return lagret ? JSON.parse(lagret) : {}
  } catch { return {} }
}

function hentLagretMaterialMal() {
  try {
    const lagret = localStorage.getItem('materialMal')
    if (!lagret) return []
    return JSON.parse(lagret).map(m => ({ ...m, id: Date.now() + Math.random(), antall: 1, sum: parseFloat(m.pris) || 0 }))
  } catch { return [] }
}

function hentLagretTimepris() {
  try { return localStorage.getItem('timepris') || '' } catch { return '' }
}

function hentLagretLogo() {
  try { return localStorage.getItem('logoUrl') || '' } catch { return '' }
}

// Henter lagret prisliste fra localStorage
function hentLagretPrisliste() {
  try {
    const lagret = localStorage.getItem('prisliste')
    return lagret ? JSON.parse(lagret) : []
  } catch { return [] }
}

export default function App() {
  const [skjema, setSkjema] = useState(() => ({
    ...TOM_SKJEMA,
    ...hentLagretFirma(),
    logoUrl: hentLagretLogo(),
    arbeidere: [{ id: 1, navn: 'Fagarbeider', timer: '', timepris: hentLagretTimepris() }],
    materialer: hentLagretMaterialMal(),
    tilbudsnummer: genererTilbudsnummer(),
  }))
  const [prisliste, setPrisliste] = useState(hentLagretPrisliste)
  const [isPro, setIsPro] = useState(true) // TODO: koble til Stripe ved Fase 2
  const [laster, setLaster] = useState(false)
  const [feil, setFeil] = useState('')
  const [steg, setSteg] = useState('skjema')

  // Lagre firmainformasjon automatisk når den endres
  useEffect(() => {
    const firma = {
      firmanavn: skjema.firmanavn,
      firmaTelefon: skjema.firmaTelefon,
      firmaEpost: skjema.firmaEpost,
      firmaAdresse: skjema.firmaAdresse,
      firmaOrgnr: skjema.firmaOrgnr,
      firmaNettside: skjema.firmaNettside,
    }
    localStorage.setItem('firma', JSON.stringify(firma))
  }, [skjema.firmanavn, skjema.firmaTelefon, skjema.firmaEpost, skjema.firmaAdresse, skjema.firmaOrgnr, skjema.firmaNettside])

  useEffect(() => {
    localStorage.setItem('logoUrl', skjema.logoUrl || '')
  }, [skjema.logoUrl])

  useEffect(() => {
    // Lagre materiallinjer som mal (uten antall/sum)
    const mal = skjema.materialer.map(m => ({ navn: m.navn, pris: m.pris, hasPaaslag: m.hasPaaslag }))
    localStorage.setItem('materialMal', JSON.stringify(mal))
  }, [skjema.materialer])

  useEffect(() => {
    // Lagre timepris fra første arbeider som default
    if (skjema.arbeidere.length > 0 && skjema.arbeidere[0].timepris) {
      localStorage.setItem('timepris', skjema.arbeidere[0].timepris)
    }
  }, [skjema.arbeidere])

  // Lagre prisliste automatisk når den endres
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
    setFeil('')
    setLaster(true)
    try {
      const tekst = await genererTilbudstekst(skjema)
      setSkjema(prev => ({ ...prev, tilbudstekst: tekst }))
      setSteg('preview')
    } catch (e) {
      setFeil('Kunne ikke generere tilbudstekst. Sjekk API-nøkkel og prøv igjen.')
    } finally {
      setLaster(false)
    }
  }

  function nullstill() {
    const lagredeMat = (() => { try { return JSON.parse(localStorage.getItem('materialLinjer') || '[]') } catch { return [] } })()
    const forhandslagte = lagredeMat.map(l => ({ id: Date.now() + Math.random(), navn: l.navn, antall: 1, pris: Number(l.pris) || 0, sum: Number(l.pris) || 0, hasPaaslag: l.hasPaaslag }))
    setSkjema({
      ...TOM_SKJEMA,
      ...hentLagretFirma(),
      logoUrl: hentLagretLogo(),
      arbeidere: [{ id: Date.now(), navn: 'Fagarbeider', timer: '', timepris: hentLagretTimepris() }],
      materialer: forhandslagte,
      tilbudsnummer: genererTilbudsnummer(),
    })
    setSteg('skjema')
    setFeil('')
  }

  function lastNed() {
    lastNedPDF(skjema)
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-tekst">Prismal</span>
            <span className="logo-tagline">Din mal. Din pris. Din tid.</span>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            {steg === 'preview' && (
              <button className="btn btn-secondary" onClick={() => setSteg('skjema')}>
                ← Tilbake til skjema
              </button>
            )}
            <button className="btn btn-secondary" style={{borderColor:'#16a34a', color:'#16a34a'}} onClick={nullstill}>
              + Nytt tilbud
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {steg === 'skjema' ? (
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
            onLastNed={lastNed}
            onTilbake={() => setSteg('skjema')}
            onNyttTilbud={nullstill}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Hjelpeportalen AS · prismal.no</p>
      </footer>
    </div>
  )
}

function genererTilbudsnummer() {
  const dato = new Date()
  const aar = dato.getFullYear().toString().slice(-2)
  const mnd = String(dato.getMonth() + 1).padStart(2, '0')
  const tilfeldig = Math.floor(Math.random() * 900 + 100)
  return `T${aar}${mnd}-${tilfeldig}`
}
