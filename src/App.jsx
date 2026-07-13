import { useState, useEffect, lazy, Suspense } from 'react'
import { genererTilbudstekst } from './api/claude.js'
import Landingsside from './components/Landingsside.jsx'
import PrismalLogo from './components/PrismalLogo.jsx'
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { hentFirma } from './api/firmaService.js'
import { hentMaterialer } from './api/materialService.js'

// Lazy-loaded: vises aldri på landingssiden — holdes ute av initial bundle
const TilbudSkjema    = lazy(() => import('./components/TilbudSkjema.jsx'))
const TilbudPreview   = lazy(() => import('./components/TilbudPreview.jsx'))
const SendteHistorikk = lazy(() => import('./components/SendteHistorikk.jsx'))
const LoginModal      = lazy(() => import('./components/LoginModal.jsx'))
const PersonvernModal = lazy(() => import('./components/PersonvernModal.jsx'))

const TOM_SKJEMA = {
  firmanavn: '', firmaTelefon: '', firmaEpost: '', firmaAdresse: '',
  firmaOrgnr: '', firmaNettside: '', firmaMvaPliktig: true,
  firmaFacebookNavn: '', firmaFacebookUrl: '',
  kundenavn: '', kundeAdresse: '',
  kundeEpost: '', kundeMobil: '', beskrivelse: '', arbeidere: [], materialer: [],
  logoUrl: '', tilbudstekst: '', pdfTema: 'standard',
  kjoring: [], utstyrsleie: [],
  bom: [], parkering: [], ferge: [],
  miljoavgifter: [], miljoPaaslagProsent: '',
  utstyrsleiePaaslagAktiv: false, utstyrsleiePaaslagProsent: '',
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
function hentLagretSats(key) {
  try { return localStorage.getItem(key) || '' } catch { return '' }
}
function hentLagretKjoringRad() {
  return [{
    id: 'rad-1', km: '', harHenger: false,
    sats: hentLagretSats('transport_kjoring_sats'),
    hengerSats: hentLagretSats('transport_kjoring_henger_sats'),
  }]
}
// Faste, navngitte utstyrsleie-rader. id er en stabil slug (IKKE Date.now())
// slik at vi kan slå opp riktig localStorage-nøkkel ved lagring av siste sats.
const UTSTYRSLEIE_NOKLER = {
  maskin: 'transport_maskinleie_sats',
  henger: 'transport_hengerleie_sats',
  aggregat: 'transport_aggregatleie_sats',
}
function hentLagretUtstyrsleie() {
  return [
    { id: 'maskin',   navn: 'Maskinleie',       dager: '', fast: true, sats: hentLagretSats(UTSTYRSLEIE_NOKLER.maskin) },
    { id: 'henger',   navn: 'Leie av henger',   dager: '', fast: true, sats: hentLagretSats(UTSTYRSLEIE_NOKLER.henger) },
    { id: 'aggregat', navn: 'Leie av aggregat', dager: '', fast: true, sats: hentLagretSats(UTSTYRSLEIE_NOKLER.aggregat) },
  ]
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
    kjoring: hentLagretKjoringRad(),
    utstyrsleie: hentLagretUtstyrsleie(),
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
  const [visPersonvern, setVisPersonvern] = useState(null) // 'personvern' | 'vilkaar' | null
  const [checkoutLaster, setCheckoutLaster] = useState(false)
  const [portalLaster, setPortalLaster]     = useState(false)
  const [visProfilMeny, setVisProfilMeny]   = useState(false)
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

  // ── Mobil: sørg for at tallfelt (Antall/Kr/time osv.) ikke blir liggende
  // bak det mobile tastaturet når de får fokus. Global handler — fanger
  // alle number-input uten at hvert enkelt felt må kobles til manuelt.
  useEffect(() => {
    function handleFocusIn(e) {
      const el = e.target
      if (el?.tagName === 'INPUT' && el.type === 'number') {
        setTimeout(() => {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }, 300) // venter til tastaturet har åpnet seg på mobil
      }
    }
    document.addEventListener('focusin', handleFocusIn)
    return () => document.removeEventListener('focusin', handleFocusIn)
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
      if (typeof f.mva_pliktig === 'boolean') oppdater('firmaMvaPliktig', f.mva_pliktig)
      if (f.facebook_navn) oppdater('firmaFacebookNavn', f.facebook_navn)
      if (f.facebook_url)  oppdater('firmaFacebookUrl',  f.facebook_url)
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
      firmaMvaPliktig: skjema.firmaMvaPliktig,
      firmaFacebookNavn: skjema.firmaFacebookNavn, firmaFacebookUrl: skjema.firmaFacebookUrl,
    }
    localStorage.setItem('firma', JSON.stringify(firma))
  }, [skjema.firmanavn, skjema.firmaTelefon, skjema.firmaEpost, skjema.firmaAdresse, skjema.firmaOrgnr, skjema.firmaNettside, skjema.firmaMvaPliktig, skjema.firmaFacebookNavn, skjema.firmaFacebookUrl, isPro])

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
    const kjoringRad = (skjema.kjoring || [])[0]
    if (kjoringRad) {
      localStorage.setItem('transport_kjoring_sats', kjoringRad.sats || '')
      localStorage.setItem('transport_kjoring_henger_sats', kjoringRad.hengerSats || '')
    }
    ;(skjema.utstyrsleie || []).forEach(r => {
      const key = UTSTYRSLEIE_NOKLER[r.id]
      if (key) localStorage.setItem(key, r.sats || '')
    })
    if (skjema.bom?.length)      localStorage.setItem('transport_bom_priser',      JSON.stringify(skjema.bom.map(b => b.pris)))
    if (skjema.parkering?.length) localStorage.setItem('transport_parkering_priser', JSON.stringify(skjema.parkering.map(p => p.pris)))
    if (skjema.ferge?.length)    localStorage.setItem('transport_ferge_priser',     JSON.stringify(skjema.ferge.map(f => f.pris)))
  }, [skjema.kjoring, skjema.utstyrsleie, skjema.bom, skjema.parkering, skjema.ferge])

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
      kjoring: hentLagretKjoringRad(),
      utstyrsleie: hentLagretUtstyrsleie(),
      bom: hentLagretTransportMal('transport_bom_priser'),
      parkering: hentLagretTransportMal('transport_parkering_priser'),
      ferge: hentLagretTransportMal('transport_ferge_priser'),
      miljoavgifter: [],
      miljoPaaslagProsent: '',
      tilbudsnummer: genererTilbudsnummer(),
    })
    setSteg('skjema')
    setFeil('')
  }

  // ── Stripe: start checkout ───────────────────────────────────────────
  async function startCheckout() {
    if (!bruker) { setVisOppgrader(false); setVisLogin('registrer'); return }
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
    if (!stripeKundeId) { alert('Ingen Stripe-konto funnet. Kontakt support på kontakt@prismal.no.'); return }
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
        <div className="header-inner" data-steg={steg}>
          <div className="logo" onClick={() => { setSteg('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{cursor:'pointer'}} title="Til forsiden"><PrismalLogo /></div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {steg === 'preview' && (
              <button className="btn btn-secondary" onClick={() => setSteg('skjema')}>← Tilbake</button>
            )}
            {steg === 'historikk' && (
              <button className="btn btn-secondary" onClick={() => setSteg('skjema')}>← Tilbake</button>
            )}
            {bruker && isPro && steg !== 'landing' && steg !== 'historikk' && (
              <button className="btn btn-secondary historikk-btn" style={{ fontSize: '0.85rem' }} onClick={() => setSteg('historikk')}>
                Historikk
              </button>
            )}
            {steg !== 'landing' && (
              <button className="btn btn-secondary" style={{ borderColor: '#16a34a', color: '#16a34a' }} onClick={nullstill}>
                + Nytt tilbud
              </button>
            )}
            {!bruker && (
              <button className="btn btn-secondary" onClick={() => setVisLogin('logginn')}>Logg inn</button>
            )}
            {steg === 'landing' && (
              <button className="btn btn-primary" onClick={() => bruker ? setSteg('skjema') : setVisLogin('registrer')}>
                {bruker ? 'Lag tilbud →' : 'Kom i gang →'}
              </button>
            )}
            {/* Profilmeny */}
            {bruker && (
              <div className="profil-meny-wrapper">
                <button
                  className="profil-meny-knapp"
                  onClick={() => setVisProfilMeny(v => !v)}
                  aria-expanded={visProfilMeny}
                >
                  <span className="profil-avatar">{(bruker.email?.[0] || '?').toUpperCase()}</span>
                  {isPro && <span className="profil-pro-badge">Pro</span>}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{marginLeft:2}}>
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {visProfilMeny && (
                  <>
                    <div className="profil-backdrop" onClick={() => setVisProfilMeny(false)} />
                    <div className="profil-dropdown">
                      <div className="profil-dropdown-epost">{bruker.email}</div>
                      <div className="profil-dropdown-divider" />
                      {isPro && (
                        <button
                          className="profil-dropdown-item"
                          onClick={() => { setVisProfilMeny(false); aapnePortal() }}
                          disabled={portalLaster}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                          {portalLaster ? 'Laster...' : 'Abonnement og fakturaer'}
                        </button>
                      )}
                      {isPro && (
                        <button
                          className="profil-dropdown-item"
                          onClick={() => { setVisProfilMeny(false); setSteg('historikk') }}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                          Sendte tilbud
                        </button>
                      )}
                      <div className="profil-dropdown-divider" />
                      <button
                        className="profil-dropdown-item profil-dropdown-item--loggut"
                        onClick={() => { setVisProfilMeny(false); loggUt() }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        Logg ut
                      </button>
                      <div className="profil-dropdown-divider" />
                      <button
                        className="profil-dropdown-item profil-dropdown-item--lukk"
                        onClick={() => { setVisProfilMeny(false); setSteg('landing'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                        Til forsiden
                      </button>
                    </div>
                  </>
                )}
              </div>
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
              <><strong>{forsokGjenstaende} av {MAKS_GRATIS_FORSOK} gratis tilbud</strong> gjenstår · Firmainfo og logo krever Pro</>
            </span>
          )}
          <button className="btn-pro-oppgrader" onClick={() => setVisOppgrader(true)}>
            Oppgrader til Pro — 59 kr/mnd
          </button>
        </div>
      )}

      <main className={`app-main${steg === 'landing' ? ' app-main--landing' : ''}`}>
        <Suspense fallback={<div className="auth-laster">Laster...</div>}>
        {steg === 'landing' ? (
          <Landingsside onStart={() => bruker ? setSteg('skjema') : setVisLogin('registrer')} onRegistrer={() => bruker ? setSteg('skjema') : setVisLogin('registrer')} />
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
            onOppgrader={() => setVisOppgrader(true)}
          />
        ) : steg === 'historikk' ? (
          <SendteHistorikk onTilbake={() => setSteg('skjema')} />
        ) : (
          <TilbudPreview
            skjema={skjema}
            oppdaterTekst={(tekst) => oppdater('tilbudstekst', tekst)}
            onLastNed={async () => {
            const { lastNedPDF } = await import('./api/pdf.js')
            await lastNedPDF(skjema, isPro)
          }}
            onTilbake={() => setSteg('skjema')}
            onNyttTilbud={nullstill}
            isPro={isPro}
            bruker={bruker}
          />
        )}
        </Suspense>
      </main>

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Hjelpeportalen AS · Org.nr 937141319 · prismal.no</p>
        <p style={{ marginTop: '4px', fontSize: '0.78rem', opacity: 0.6 }}>
          <button className="footer-lenke" onClick={() => setVisPersonvern('personvern')}>Personvernerklæring</button>
          {' · '}
          <button className="footer-lenke" onClick={() => setVisPersonvern('vilkaar')}>Vilkår for bruk</button>
          {' · '}
          <a href="mailto:kontakt@prismal.no" style={{ color: 'inherit' }}>kontakt@prismal.no</a>
          {' · '}
          <a
            href="https://www.facebook.com/profile.php?id=61591085692523"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94z" />
            </svg>
            Facebook
          </a>
        </p>
      </footer>

      {visLogin && (
        <Suspense fallback={null}>
          <LoginModal onLukk={() => setVisLogin(false)} initialModus={visLogin} />
        </Suspense>
      )}

      {visPersonvern && (
        <Suspense fallback={null}>
          <PersonvernModal side={visPersonvern} onLukk={() => setVisPersonvern(null)} />
        </Suspense>
      )}

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
            <div className="oppgrader-pris">59 kr <span>/mnd</span></div>
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
                Allerede Pro? <button onClick={() => { setVisOppgrader(false); setVisLogin('logginn') }}>Logg inn</button>
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
    <ErrorBoundary>
      <AuthProvider>
        <AppInnhold />
      </AuthProvider>
    </ErrorBoundary>
  )
}

function genererTilbudsnummer() {
  const dato = new Date()
  const aar  = dato.getFullYear().toString().slice(-2)
  const mnd  = String(dato.getMonth() + 1).padStart(2, '0')
  const tilfeldig = Math.floor(Math.random() * 900 + 100)
  return `T${aar}${mnd}-${tilfeldig}`
}
