/* ── Landingsside v4 — lys, moderne, flip-demo ── */
import { useEffect, useRef, useState } from 'react'

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

const FEATURES = [
  { ikon: <IkonLyn />, tittel: 'Raskt', tekst: 'Fyll inn jobb og priser — ferdig PDF på under 2 minutter.' },
  { ikon: <IkonSparkle />, tittel: 'AI-tekst', tekst: 'Skriv hva jobben gjelder — AI formulerer profesjonell tilbudstekst.' },
  { ikon: <IkonSky />, tittel: 'Synkronisert', tekst: 'Kunder, materialer og firma lagres i skyen. Samme oversikt på alle enheter — bare logg inn.' },
  { ikon: <IkonDokument />, tittel: 'Klar PDF', tekst: 'Med din logo, prisoversikt og akseptklausul. Klar til å sende på sekunder.' },
]

/* ── FLIP-DEMO ── */
function SkjemaMock() {
  return (
    <div className="mock-bilde-wrapper">
      <img src="/skjema.png" alt="Prismal skjema" className="mock-bilde" />
    </div>
  )
}

function PdfMock() {
  return (
    <div className="mock-bilde-wrapper">
      <img src="/pdf.png" alt="Ferdig tilbud PDF" className="mock-bilde" />
    </div>
  )
}

function FlipDemo() {
  const [flipped, setFlipped] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTimeout(() => setFlipped(true), 600) },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <section className="flip-seksjon" ref={ref}>
      <div className="flip-intro">
        <p className="flip-overst">Slik fungerer det</p>
        <h2 className="flip-tittel">Fra skjema til profesjonelt tilbud — på sekunder</h2>
      </div>

      <div className="flip-toggle">
        <button className={!flipped ? 'aktiv' : ''} onClick={() => setFlipped(false)}>Skjema</button>
        <button className={flipped ? 'aktiv' : ''} onClick={() => setFlipped(true)}>Ferdig tilbud</button>
      </div>

      <div className="flip-scene">
        <div className={`flip-kort ${flipped ? 'er-flipped' : ''}`} style={{ aspectRatio: flipped ? '746 / 1052' : '744 / 974' }}>
          <div className="flip-side flip-front"><SkjemaMock /></div>
          <div className="flip-side flip-back"><PdfMock /></div>
        </div>
      </div>
    </section>
  )
}

export default function Landingsside({ onStart, onRegistrer }) {
  return (
    <div className="l2-wrapper">

      {/* ── HERO — lys ── */}
      <section className="l2-hero">
        <div className="l2-hero-glow l2-glow-1" />
        <div className="l2-hero-glow l2-glow-2" />
        <div className="l2-hero-glow l2-glow-3" />
        <div className="l2-hero-inner">
          <div className="l2-badge">For fagfolk som sender tilbud</div>
          <h1 className="l2-tittel">
            Profesjonelle tilbud.<br />
            <span className="l2-tittel-grad">På minutter.</span>
          </h1>
          <ul className="l2-punkter">
            <li>Befar jobben — send profesjonelt tilbud fra bilen</li>
            <li>PDF leveres direkte i kundens innboks — ingen nedlasting</li>
            <li>Kopi av hvert tilbud lagres automatisk i din innboks</li>
            <li>Full historikk over sendte tilbud i din Prismal-profil</li>
            <li>Fungerer på mobil, nettbrett og PC — ingen installasjon</li>
            <li>Logo, firmainformasjon og prisliste huskes for alltid</li>
          </ul>
          <div className="l2-cta-rad">
            <div className="l2-cta-alternativ">
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
            <div className="l2-cta-eller">eller</div>
            <div className="l2-cta-alternativ">
              <button className="l2-cta-sekundaer" onClick={onStart}>
                Prøv uten registrering
              </button>
              <p className="l2-cta-hint l2-cta-hint-sek">
                1 tilbud · Uten firma og logo
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLIP DEMO ── */}
      <FlipDemo />

      {/* ── FEATURES ── */}
      <section className="l2-features">
        {FEATURES.map(f => (
          <div key={f.tittel} className="l2-kort">
            <div className="l2-ikon-boks">{f.ikon}</div>
            <h3 className="l2-kort-tittel">{f.tittel}</h3>
            <p className="l2-kort-tekst">{f.tekst}</p>
          </div>
        ))}
      </section>

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

    </div>
  )
}
