/* ── Landingsside v5 — lys, moderne, demo-karusell ── */
import { useState, useEffect } from 'react'
import DemoSlideshow from './DemoSlideshow'

function IkonLyn() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill="url(#lynBg)"/>
      <path d="M14.5 4.5L6 14h7.5l-1.5 7.5L20 12h-7.5l2-7.5z" fill="white"/>
      <defs>
        <linearGradient id="lynBg" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6"/>
          <stop offset="100%" stopColor="#1d4ed8"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function IkonSparkle() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill="url(#sparkBg)"/>
      <path d="M13 5l1.8 5.5H20l-4.6 3.3 1.7 5.5L13 16l-4.1 3.3 1.7-5.5L6 10.5h5.2L13 5z" fill="white"/>
      <defs>
        <linearGradient id="sparkBg" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a855f7"/>
          <stop offset="100%" stopColor="#7c3aed"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function IkonSky() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill="url(#skyBg)"/>
      <path d="M19 15.5a3 3 0 00-2.5-2.95A4.5 4.5 0 008 14a2.5 2.5 0 000 5h10.5A2.5 2.5 0 0019 15.5z" fill="white" opacity="0.95"/>
      <defs>
        <linearGradient id="skyBg" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function IkonDokument() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="7" fill="url(#docBg)"/>
      <path d="M8 5h7l5 5v11H8V5z" fill="white" opacity="0.95"/>
      <path d="M15 5v5h5" fill="none" stroke="url(#docBg)" strokeWidth="1.2" strokeLinejoin="round"/>
      <path d="M11 14h6M11 17h4" stroke="url(#docBg)" strokeWidth="1.3" strokeLinecap="round"/>
      <defs>
        <linearGradient id="docBg" x1="0" y1="0" x2="26" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
    </svg>
  )
}



export default function Landingsside({ onStart, onRegistrer }) {
  const [lightbox, setLightbox] = useState(false)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  return (
    <div className="l2-wrapper">

      {/* ── HERO ── */}
      <section className="l2-hero">
        <div className="l2-hero-glow l2-glow-1" />
        <div className="l2-hero-glow l2-glow-2" />
        <div className="l2-hero-glow l2-glow-3" />
        <div className="l2-hero-inner">

          {/* Badge — sentrert øverst */}
          <div className="l2-hero-topp">
            <div className="l2-badge">For fagfolk som sender tilbud</div>
          </div>

          {/* Midtseksjon — tekst + PDF side om side */}
          <div className="l2-hero-split">
            <div className="l2-hero-tekst">
              <h1 className="l2-tittel">
                Profesjonelle tilbud.<br />
                <span className="l2-tittel-grad">På minutter.</span>
              </h1>
              <ul className="l2-punkter">
                <li>Firmainfo og logo hentes automatisk — samme oversikt uansett om du jobber fra kontoret, bilen eller mobilen</li>
                <li>Søk opp lagrede kunder på navn eller mobilnummer — nye kunder legges til på sekunder</li>
                <li>Skriv oppdraget med egne ord — rettskriving er ikke viktig. AI omformer det til en komplett, profesjonell tilbudstekst</li>
                <li>Send tilbudet direkte til kunden med deg på kopi — ingen nedlasting nødvendig. Lage-og-send fra bilen</li>
                <li>Nettbasert — logg inn og du er klar. Ingen programvare å installere</li>
                <li>Optimalisert for PC, mobil og nettbrett</li>
              </ul>
            </div>

            <div className="l2-hero-bilde-wrapper">
              <div className="l2-hero-bilde-clip" onClick={() => setLightbox(true)} title="Trykk for å forstørre">
                <img
                  src="/demo/pdf_forside.png"
                  alt="Eksempel på Prismal-tilbud"
                  className="l2-hero-bilde l2-hero-bilde-klikkbar"
                />
              </div>
            </div>
          </div>

          {/* CTA — sentrert under */}
          <div className="l2-hero-cta">
            <button className="l2-cta" onClick={onRegistrer}>
              Registrer deg gratis
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{marginLeft:6}}>
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <p className="l2-cta-hint l2-cta-hint-prim">
              3 fulle tilbud med alle funksjoner<br/>
              <span>Ingen kredittkort · Ingen bindingstid</span>
            </p>
          </div>

        </div>
      </section>

      {/* ── DEMO KARUSELL ── */}
      <DemoSlideshow />


      {/* ── PRIS ── */}
      <section className="l2-pris">
        <p className="l2-pris-overst">Enkel prising</p>
        <h2 className="l2-pris-tittel">Prøv gratis. Fortsett når du er klar.</h2>
        <div className="l2-pro-solo">
          <div className="l2-pro-solo-topp">
            <div>
              <div className="l2-plan-navn">Prismal Pro</div>
              <div className="l2-plan-pris l2-plan-pris-gull">99 <span>kr / mnd eks. mva</span></div>
            </div>
            <div className="l2-trial-boks">
              <div className="l2-trial-tall">3</div>
              <div className="l2-trial-tekst">gratis tilbud<br/>ved registrering</div>
            </div>
          </div>
          <p className="l2-plan-sub">
            Registrer deg gratis — ingen kredittkort. Du får 3 fulle tilbud med alle funksjoner: 
            firmalogo, kundedatabase og materialbibliotek. Deretter 99 kr/mnd eks. mva (124 kr inkl. mva). 
            Ingen bindingstid — avslutt når du vil.
          </p>
          <div className="l2-pro-kolonner">
            <ul className="l2-plan-liste">
              <li className="ok">Ubegrenset antall tilbud</li>
              <li className="ok">AI-generert tilbudstekst</li>
              <li className="ok">PDF med din firmalogo</li>
              <li className="ok">Kundedatabase med søk</li>
              <li className="ok">Materialbibliotek med priser</li>
            </ul>
            <ul className="l2-plan-liste">
              <li className="ok">Påslagskalkulator</li>
              <li className="ok">Last ned eller send PDF — ett klikk</li>
              <li className="ok">Send tilbud direkte på e-post</li>
              <li className="ok">Skybasert — logg inn fra mobil, nettbrett og PC</li>
              <li className="ok">All info på din konto — alltid tilgjengelig</li>
            </ul>
          </div>
          <button className="l2-btn-pro" onClick={onRegistrer}>
            Registrer deg og start gratis
          </button>
          <div className="l2-garantier">
            <span>✓ Ingen bindingstid</span>
            <span>✓ Avslutt når du vil</span>
            <span>✓ Ingen skjulte kostnader</span>
          </div>
          <p className="l2-pris-sammenligning">
            Alle priser eks. mva. Tilsvarende løsninger koster 299–499 kr/mnd. Prismal: 99 kr.
          </p>
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="l2-lightbox" onClick={() => setLightbox(false)}>
          <button className="l2-lightbox-lukk" onClick={() => setLightbox(false)} aria-label="Lukk">✕</button>
          <img
            src="/demo/pdf_forside.png"
            alt="Prismal tilbud forhåndsvisning"
            className="l2-lightbox-bilde"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  )
}
