import { useState, useEffect } from 'react'
import TilbudSkjema from './components/TilbudSkjema.jsx'
import TilbudPreview from './components/TilbudPreview.jsx'
import { genererTilbudstekst } from './api/claude.js'
import { lastNedPDF } from './api/pdf.js'
import Landingsside from './components/Landingsside.jsx'
import SendteHistorikk from './components/SendteHistorikk.jsx'
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
  kjoringKm: '', kjoringSats: '', bom: [], parkering: [], ferge: [],
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
function hentLagretKjoringSats() {
  try { return localStorage.getItem('transport_kjoring_sats') || '' } catch { return '' }
}
function hentLagretTransportMal(key) {
  try {
    const priser = JSON.parse(localStorage.getItem(key) || '[""]')
    return priser.map((pris, i) => ({ id: i + 1, antall: '', pris: String(pris || '') }))
  } catch { return [{ id: 1, antall: '', pris: '' }] }
}

function AppInnhold() {
  const {
    bruker, laster: authLaster, loggUt, isPro, stripeKundeId,
    kanBrukeForsok, forsokGjenstaende, registrerForsok, MAKS_GRATIS_FORSOK,
    trengerRegistrering, trengerOppgradering
  } = useAuth()

  const [skjema, setSkjema] = useState(() => ({
    ...TOM_SKJEMA,
    ...(isPro ? hentLagretFirma() : {}),
    logoUrl: isPro ? hentLagretLogo() : '',
    arbeidere: [{ id: 1, navn: 'Fagarbeider', timer: '', timepris: hentLagretTimepris() }],
    materialer: hentLagretMaterialMal(),
    kjoringSats: hentLagretKjoringSats(),
    bom: hentLagretTransportMal('transport_bom_priser'),
    parkering: hentLagretTransportMal('transport_parkering_priser'),
    ferge: hentLagretTransportMal('transport_ferge_priser'),
    tilbudsnummer: genererTilbudsnummer(),
  }))
  const [prisliste, setPrisliste]       = useState(hentLagretPrisliste)
  const [laster, setLaster]             = useState(false)
  const [feil, setFeil]                 = useState('')
  const [steg, setSteg]                 = useState('landing')
  const [visLogin, setVisLogin]         = useState(false)
  const [visOppgrader, setVisOppgrader] = useState(false)
  const [checkoutLaster, setCheckoutLaster] = useState(false)
  const [portalLaster, setPortalLaster]     = useState(false)
  const [proMelding, setProMelding]         = useState(null)

  // ── Håndter Stripe redirect-parametere ──────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const proParam = params.get('pro')
    if (proParam === 'suksess') {
      setProMelding('suksess')
      // Fjern param fra URL uten reload
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => setProMelding(null), 6000)
    } else if (proParam === 'avbrutt') {
      setProMelding('avbrutt')
      window.history.replaceState({}, '', window.location.pathname)
      setTimeout(() => setProMelding(null), 4000)
    }
  }, [])

  useEffect(() => {
    if (bruker && visLogin) {
      setVisLogin(false)
      setSteg('skjema')
    }
  }, [bruker])

  // ── Last firmaprofil fra Supabase ved innlogging ─────────────────────
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

  // ── Last materialbibliotek fra Supabase ved innlogging ───────────────
  useEffect(() => {
    if (!bruker) return
    hentMaterialer().then(liste => {
      if (!liste.length) return
      const malLinjer = liste.map(m => ({
        id: Date.now() + Math.random(),
        navn: m.navn,
        antall: 0,
        pris: Number(m.pris) || 0,
        sum: 0,
        hasPaaslag: m.has_paaslag,
      }))
      setSkjema(prev => {
        const aktive    = prev.materialer.filter(m => m.antall > 0)
        const aktivNavn = new Set(aktive.map(m => m.navn.toLowerCase()))
        const nye       = malLinjer.filter(m => !aktivNavn.has(m.navn.toLowerCase()))
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

  useEffect(() => {
    localStorage.setItem('transport_kjoring_sats', skjema.kjoringSats || '')
    if (skjema.bom?.length)      localStorage.setItem('transport_bom_priser',      JSON.stringify(skjema.bom.map(b => b.pris)))
    if (skjema.parkering?.length) localStorage.setItem('transport_parkering_priser', JSON.stringify(skjema.parkering.map(p => p.pris)))
    if (skjema.ferge?.length)    localStorage.setItem('transport_ferge_priser',     JSON.stringify(skjema.ferge.map(f => f.pris)))
  }, [skjema.kjoringSats, skjema.bom, skjema.parkering, skjema.ferge])

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
      kjoringKm: '',
      kjoringSats: hentLagretKjoringSats(),
      bom: hentLagretTransportMal('transport_bom_priser'),
      parkering: hentLagretTransportMal('transport_parkering_priser'),
      ferge: hentLagretTransportMal('transport_ferge_priser'),
      tilbudsnummer: genererTilbudsnummer(),
    })
    setSteg('skjema')
    setFeil('')
  }

  // ── Stripe: start checkout ───────────────────────────────────────────
  async function startCheckout() {
    if (!bruker) { setVisOppgrader(false); setVisLogin(true); return }
    setCheckoutLaster(true)
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          epost:             bruker.email,
          bruker_id:         bruker.id,
          stripe_customer_id: stripeKundeId || undefined,
        }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        alert('Noe gikk galt. Prøv igjen eller kontakt support.')
      }
    } catch (e) {
      console.error('Checkout-feil:', e)
      alert('Noe gikk galt. Prøv igjen.')
    } finally {
      setCheckoutLaster(false)
    }
  }

  // ── Stripe: åpne Customer Portal ─────────────────────────────────────
  async function aapnePortal() {
    if (!stripeKundeId) return
    setPortalLaster(true)
    try {
      const res = await fetch('/.netlify/functions/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripe_customer_id: stripeKundeId }),
      })
      const json = await res.json()
      if (json.url) {
        window.location.href = json.url
      } else {
        alert('Kunne ikke åpne abonnementsportal. Prøv igjen.')
      }
    } catch (e) {
      console.error('Portal-feil:', e)
      alert('Noe gikk galt. Prøv igjen.')
    } finally {
      setPortalLaster(false)
    }
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
            {steg === 'historikk' && (
              <button className="btn btn-secondary" onClick={() => setSteg('skjema')}>← Tilbake</button>
            )}
            {bruker && isPro && steg !== 'landing' && steg !== 'historikk' && (
              <button className="btn btn-secondary" style={{ fontSize: '0.85rem' }} onClick={() => setSteg('historikk')}>
                Historikk
              </button>
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
            {/* Pro-bruker: administrer abonnement */}
            {bruker && isPro && stripeKundeId && (
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', opacity: 0.8 }}
                onClick={aapnePortal}
                disabled={portalLaster}
                title="Administrer abonnement"
              >
                {portalLaster ? 'Laster...' : '⚡ Pro'}
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

      {/* Toast — Stripe redirect-tilbakemelding */}
      {proMelding === 'suksess' && (
        <div className="pro-toast pro-toast--suksess">
          🎉 Betaling mottatt! Prismal Pro er nå aktivert på kontoen din.
        </div>
      )}
      {proMelding === 'avbrutt' && (
        <div className="pro-toast pro-toast--avbrutt">
          Betalingen ble avbrutt. Du kan prøve igjen når du vil.
        </div>
      )}

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
        ) : steg === 'historikk' ? (
          <SendteHistorikk onTilbake={() => setSteg('skjema')} />
        ) : (
          <TilbudPreview
            skjema={skjema}
            oppdaterTekst={(tekst) => oppdater('tilbudstekst', tekst)}
            onLastNed={async () => await lastNedPDF(skjema, isPro)}
            onTilbake={() => setSteg('skjema')}
            onNyttTilbud={nullstill}
            isPro={isPro}
            bruker={bruker}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Hjelpeportalen AS · prismal.no</p>
      </footer>

      {visLogin && <LoginModal onLukk={() => setVisLogin(false)} />}

      {/* Oppgrader til Pro — modal */}
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
            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
              onClick={startCheckout}
              disabled={checkoutLaster}
            >
              {checkoutLaster ? 'Sender til betaling...' : 'Kom i gang med Pro →'}
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
  const aar  = dato.getFullYear().toString().slice(-2)
  const mnd  = String(dato.getMonth() + 1).padStart(2, '0')
  const tilfeldig = Math.floor(Math.random() * 900 + 100)
  return `T${aar}${mnd}-${tilfeldig}`
}
