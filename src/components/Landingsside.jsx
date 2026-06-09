/* ── Landingsside v2 — premium redesign ── */

function IkonLyn() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M15.5 3L5 16h9l-1.5 9L23 13h-9l1.5-10z" fill="url(#lynGrad)"/>
      <defs>
        <linearGradient id="lynGrad" x1="5" y1="3" x2="23" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60a5fa"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function IkonSparkle() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3l2.2 6.8H23l-5.6 4.1 2.1 6.8L14 16.6l-5.5 4.1 2.1-6.8L5 9.8h6.8L14 3z" fill="url(#sparkGrad)"/>
      <circle cx="22" cy="6" r="2" fill="#a78bfa" opacity="0.7"/>
      <circle cx="6" cy="21" r="1.5" fill="#60a5fa" opacity="0.6"/>
      <defs>
        <linearGradient id="sparkGrad" x1="5" y1="3" x2="23" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#a78bfa"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function IkonDatabase() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="8" rx="9" ry="4" fill="url(#dbGrad1)"/>
      <path d="M5 8v5c0 2.2 4 4 9 4s9-1.8 9-4V8" fill="url(#dbGrad2)" opacity="0.85"/>
      <path d="M5 13v5c0 2.2 4 4 9 4s9-1.8 9-4v-5" fill="url(#dbGrad3)" opacity="0.7"/>
      <defs>
        <linearGradient id="dbGrad1" x1="5" y1="5" x2="23" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="dbGrad2" x1="5" y1="8" x2="23" y2="17" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        <linearGradient id="dbGrad3" x1="5" y1="13" x2="23" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#34d399"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

function IkonDokument() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M7 3h10l6 6v16H7V3z" fill="url(#docGrad1)"/>
      <path d="M17 3v6h6" fill="none" stroke="#fb923c" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M11 13h8M11 17h6M11 21h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9"/>
      <defs>
        <linearGradient id="docGrad1" x1="7" y1="3" x2="23" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fb923c"/>
          <stop offset="100%" stopColor="#ea580c"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

const FEATURES = [
  {
    ikon: <IkonLyn />,
    farge: 'blaa',
    tittel: 'Raskt',
    tekst: 'Fra blankt skjema til ferdig PDF på under 2 minutter.',
  },
  {
    ikon: <IkonSparkle />,
    farge: 'lilla',
    tittel: 'AI-tekst',
    tekst: 'Beskriv jobben kort — AI skriver profesjonelt tilbudsspråk.',
  },
  {
    ikon: <IkonDatabase />,
    farge: 'gronn',
    tittel: 'Husker alt',
    tekst: 'Kunder, materialer og priser lagres. Neste tilbud går dobbelt så raskt.',
  },
  {
    ikon: <IkonDokument />,
    farge: 'oransje',
    tittel: 'Klar PDF',
    tekst: 'Med logo, prisoversikt og akseptklausul — klar til å sende.',
  },
]

export default function Landingsside({ onStart }) {
  return (
    <div className="l2-wrapper">

      {/* ── HERO ── */}
      <section className="l2-hero">
        <div className="l2-hero-glow l2-glow-1" />
        <div className="l2-hero-glow l2-glow-2" />
        <div className="l2-hero-inner">
          <div className="l2-badge">Verktøyet selvstendige håndverkere mangler</div>
          <h1 className="l2-tittel">
            Profesjonelle tilbud.<br />
            <span className="l2-tittel-grad">På minutter.</span>
          </h1>
          <p className="l2-undertittel">
            Fyll inn jobb og priser — AI skriver tilbudsteksten.<br />Last ned ferdig PDF.
          </p>
          <button className="l2-cta" onClick={onStart}>
            Prøv gratis — ingen registrering
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{marginLeft:6}}>
              <path d="M4 9h10M10 5l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <p className="l2-cta-hint">3 gratis tilbud &nbsp;·&nbsp; Ingen kredittkort &nbsp;·&nbsp; Fortsett for 99 kr/mnd</p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="l2-features">
        {FEATURES.map(f => (
          <div key={f.tittel} className={`l2-kort l2-kort-${f.farge}`}>
            <div className={`l2-ikon-boks l2-ikon-${f.farge}`}>{f.ikon}</div>
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
              <div className="l2-plan-pris l2-plan-pris-gull">99 <span>kr / mnd</span></div>
            </div>
            <div className="l2-trial-boks">
              <div className="l2-trial-tall">3</div>
              <div className="l2-trial-tekst">gratis tilbud<br/>uten å registrere deg</div>
            </div>
          </div>

          <p className="l2-plan-sub">
            Start helt gratis. Etter 3 tilbud registrerer du deg og fortsetter for 99 kr/mnd — 
            det samme som en kaffe på kafé, men noe du faktisk tjener penger på.
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
              <li className="ok">Tidlig tilgang til nye funksjoner</li>
            </ul>
          </div>

          <button className="l2-btn-pro" onClick={onStart}>
            Start gratis nå
          </button>
          <p className="l2-pris-sammenligning">
            Tilsvarende løsninger koster 299–499 kr/mnd. Prismal: 99 kr.
          </p>
        </div>
      </section>

    </div>
  )
}
