function IkonRakett() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3C16 3 22 8 22 16H10C10 8 16 3 16 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <rect x="10" y="16" width="12" height="6" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M13 22L11 27M19 22L21 27" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="16" cy="12" r="2" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  )
}
function IkonAI() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="24" height="16" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M9 18L12 13L15 17L18 14L23 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9" cy="18" r="1" fill="currentColor"/>
    </svg>
  )
}
function IkonHusk() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="4" width="20" height="24" rx="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M11 11H21M11 16H21M11 21H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}
function IkonPDF() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 4H20L26 10V28H8V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M20 4V10H26" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M12 16H20M12 20H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

export default function Landingsside({ onStart }) {
  return (
    <div className="landing-wrapper">

      {/* HERO */}
      <section className="landing-hero">
        <h1 className="landing-tittel">Profesjonelle tilbud på minutter</h1>
        <p className="landing-undertittel">
          Fyll inn jobb og priser — AI skriver tilbudsteksten. Last ned ferdig PDF.
        </p>
        <button className="btn btn-primary landing-cta" onClick={onStart}>
          Lag ditt første tilbud gratis →
        </button>
        <p className="landing-cta-hint">Ingen registrering. Ingen kredittkort.</p>
      </section>

      {/* FEATURES — Office 365-stil */}
      <section className="landing-features">
        <div className="feature-kort feature-blaa">
          <div className="feature-ikon-boks feature-ikon-boks-blaa"><IkonRakett /></div>
          <h3>Raskt</h3>
          <p>Fra blankt skjema til ferdig PDF på under 2 minutter.</p>
        </div>
        <div className="feature-kort feature-lilla">
          <div className="feature-ikon-boks feature-ikon-boks-lilla"><IkonAI /></div>
          <h3>AI-tekst</h3>
          <p>Beskriv jobben kort — AI skriver profesjonelt tilbudsspråk.</p>
        </div>
        <div className="feature-kort feature-gronn">
          <div className="feature-ikon-boks feature-ikon-boks-gronn"><IkonHusk /></div>
          <h3>Husker prisene</h3>
          <p>Materialer og timepriser lagres. Neste tilbud går raskere.</p>
        </div>
        <div className="feature-kort feature-oransje">
          <div className="feature-ikon-boks feature-ikon-boks-oransje"><IkonPDF /></div>
          <h3>Klar PDF</h3>
          <p>Med logo, prisoversikt og akseptklausul — klar til å sende.</p>
        </div>
      </section>

      {/* PRIS */}
      <section className="landing-pris">
        <h2 className="landing-seksjon-tittel">To enkle valg</h2>
        <div className="pris-grid pris-grid-to">

          <div className="pris-kort pris-kort-gratis">
            <h3>Gratis</h3>
            <p className="pris-beloep">0 kr</p>
            <p style={{fontSize:'12px',color:'var(--tekst-sekundaer)',marginBottom:'12px',lineHeight:'1.5'}}>
              Prøv Prismal uten registrering. Passer om du vil se hvordan det fungerer før du bestemmer deg.
            </p>
            <ul className="pris-liste">
              <li>✓ 3 tilbud totalt</li>
              <li>✓ AI-generert tilbudstekst</li>
              <li>✓ Last ned PDF</li>
              <li className="pris-nei">✗ Ingen firmalogo i PDF</li>
              <li className="pris-nei">✗ "Laget med Prismal" i footer</li>
              <li className="pris-nei">✗ Ingen lagrede prislinjer</li>
              <li className="pris-nei">✗ Ingen tilbudshistorikk</li>
            </ul>
            <button className="btn btn-secondary btn-full" onClick={onStart}>Prøv gratis</button>
          </div>

          <div className="pris-kort pris-kort-pro">
            <div className="pro-badge pro-badge-gull">Anbefalt</div>
            <h3>Pro</h3>
            <p className="pris-beloep">99 kr<span>/mnd</span></p>
            <p style={{fontSize:'12px',color:'var(--tekst-sekundaer)',marginBottom:'12px',lineHeight:'1.5'}}>
              Alt du trenger for å sende profesjonelle tilbud raskt — uten kompromisser.
            </p>
            <ul className="pris-liste">
              <li>✓ Ubegrenset antall tilbud</li>
              <li>✓ AI-generert tilbudstekst</li>
              <li>✓ PDF med din firmalogo</li>
              <li>✓ Lagrede prislinjer — raskere neste gang</li>
              <li>✓ Påslagskalkulator</li>
              <li>✓ Ingen Prismal-branding i PDF</li>
              <li>✓ Tilbudshistorikk</li>
              <li>✓ Send tilbud direkte på e-post</li>
              <li>✓ Tidlig tilgang til nye funksjoner</li>
            </ul>
            <button className="btn btn-primary btn-full btn-gull" onClick={onStart}>Kom i gang med Pro</button>
          </div>

        </div>
        <p className="pris-sammenligning">Tilsvarende løsninger koster opptil 499 kr/mnd. Prismal Pro: 99 kr.</p>
      </section>

    </div>
  )
}
