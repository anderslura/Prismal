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
    <div className="mock-skjema">
      <div className="mock-seksjon-header">Din bedrift</div>
      <div className="mock-felt-rad">
        <div className="mock-felt"><span className="mock-label">Firmanavn</span><div className="mock-input">Hjelpeportalen AS</div></div>
      </div>
      <div className="mock-felt-rad to-kol">
        <div className="mock-felt"><span className="mock-label">Telefon</span><div className="mock-input">900 00 000</div></div>
        <div className="mock-felt"><span className="mock-label">E-post</span><div className="mock-input">post@firma.no</div></div>
      </div>

      <div className="mock-seksjon-header" style={{marginTop:12}}>Arbeid</div>
      <div className="mock-felt-rad to-kol">
        <div className="mock-felt"><span className="mock-label">Timer</span><div className="mock-input">12</div></div>
        <div className="mock-felt"><span className="mock-label">Kr/time</span><div className="mock-input">650</div></div>
      </div>

      <div className="mock-seksjon-header" style={{marginTop:12}}>Materialer &amp; utgifter</div>
      <div className="mock-mat-header"><span>Beskrivelse</span><span>Ant.</span><span>Kr</span><span>Sum</span></div>
      <div className="mock-mat-rad"><span>impregnert trevirke</span><span>8</span><span>99</span><span className="mock-sum">792 kr</span></div>
      <div className="mock-mat-rad"><span>skrue pakke</span><span>2</span><span>100</span><span className="mock-sum">200 kr</span></div>

      <div className="mock-seksjon-header" style={{marginTop:12}}>Påslag materialer</div>
      <div className="mock-paslag-rad">
        <div className="mock-paslag-felt">20 %</div>
        <div className="mock-paslag-chip">10%</div>
        <div className="mock-paslag-chip aktiv">20%</div>
        <div className="mock-paslag-chip">30%</div>
        <span className="mock-paslag-res">= +158 kr</span>
      </div>

      <div className="mock-total-bar">
        <span>Estimert total</span>
        <span>9 556 kr</span>
      </div>
    </div>
  )
}

function PdfMock() {
  return (
    <div className="mock-pdf">
      <div className="mock-pdf-header">
        <div className="mock-pdf-venstre">
          <div className="mock-pdf-logo-sirkel">H</div>
          <div>
            <div className="mock-pdf-firma">Hjelpeportalen AS</div>
            <div className="mock-pdf-info">Os · 900 00 000</div>
            <div className="mock-pdf-info">post@firma.no · Org.nr: 937 141 319</div>
          </div>
        </div>
        <div className="mock-pdf-hoyre">
          <div className="mock-pdf-tilbud-label">TILBUD</div>
          <div className="mock-pdf-meta">Nr: T2606-908</div>
          <div className="mock-pdf-meta">Dato: 13.6.2026</div>
          <div className="mock-pdf-meta">Gyldig til: 13.7.2026</div>
        </div>
      </div>

      <div className="mock-pdf-til">
        <div className="mock-pdf-til-label">TILBUD TIL</div>
        <div className="mock-pdf-til-navn">Kari Nordmann</div>
        <div className="mock-pdf-til-info">Hjemveien 5, 0002 Oslo</div>
        <div className="mock-pdf-til-info">kari@post.no</div>
      </div>

      <div className="mock-pdf-innledning">
        Vi er glade for forespørselen din om terrasse på Hjemveien 5. Vi skal bygge en solid og vakker terrasse på 20 kvadratmeter med impregnert trevirke av god kvalitet.
      </div>

      <table className="mock-pdf-tabell">
        <thead>
          <tr><th>Beskrivelse</th><th>Antall</th><th>Enhetspris</th><th>Sum</th></tr>
        </thead>
        <tbody>
          <tr><td>Arbeid</td><td>12 t</td><td>650 kr</td><td>7 800 kr</td></tr>
          <tr><td>impregnert trevirke</td><td>8</td><td>119 kr</td><td>950 kr</td></tr>
          <tr><td>Kjøring</td><td>20 km</td><td>7 kr/km</td><td>140 kr</td></tr>
          <tr><td>Bom</td><td>2</td><td>12 kr</td><td>24 kr</td></tr>
        </tbody>
      </table>

      <div className="mock-pdf-summer">
        <div><span>Sum eks. mva</span><span>8 914 kr</span></div>
        <div><span>MVA 25%</span><span>2 229 kr</span></div>
        <div className="mock-pdf-total"><span>Totalt inkl. mva</span><span>11 143 kr</span></div>
      </div>

      <div className="mock-pdf-aksept">
        <strong>Aksept av tilbud:</strong> For å godta dette tilbudet må skriftlig aksept sendes til post@firma.no innen tilbudets gyldighetsperiode.
      </div>
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
      { threshold: 0.35 }
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

      <div className="flip-scene">
        <div className={`flip-kort ${flipped ? 'er-flipped' : ''}`}>
          <div className="flip-side flip-front"><SkjemaMock /></div>
          <div className="flip-side flip-back"><PdfMock /></div>
        </div>
      </div>

      <div className="flip-toggle">
        <button className={!flipped ? 'aktiv' : ''} onClick={() => setFlipped(false)}>📋 Skjema</button>
        <button className={flipped ? 'aktiv' : ''} onClick={() => setFlipped(true)}>📄 Ferdig tilbud</button>
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
          <p className="l2-undertittel">
            Spar timer hver uke på tilbudsskriving. Kunder, materialer og priser huskes — du fyller inn, AI formulerer, tilbudet sendes. Fungerer for én mann og små team.
          </p>
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
              <li className="ok">Tilbudshistorikk</li>
              <li className="ok">Send tilbud på e-post</li>
              <li className="ok">Ingen Prismal-branding</li>
              <li className="ok">Synkronisert på alle enheter</li>
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
