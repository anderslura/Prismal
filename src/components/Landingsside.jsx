export default function Landingsside({ onStart }) {
  return (
    <div className="landing-wrapper">

      {/* HERO */}
      <section className="landing-hero">
        <h1 className="landing-tittel">Profesjonelle tilbud på minutter</h1>
        <p className="landing-undertittel">
          Fyll inn jobb og priser — AI skriver tilbudsteksten. Last ned ferdig PDF. Ingen abonnement for å komme i gang.
        </p>
        <button className="btn btn-primary landing-cta" onClick={onStart}>
          Lag ditt første tilbud gratis →
        </button>
        <p className="landing-cta-hint">Ingen registrering. Ingen kredittkort.</p>
      </section>

      {/* FEATURES */}
      <section className="landing-features">
        <div className="feature-kort">
          <span className="feature-ikon">⚡</span>
          <h3>Raskt</h3>
          <p>Fra blankt skjema til ferdig PDF på under 2 minutter.</p>
        </div>
        <div className="feature-kort">
          <span className="feature-ikon">🤖</span>
          <h3>AI-tekst</h3>
          <p>Beskriv jobben kort — AI formulerer profesjonelt tilbudsspråk automatisk.</p>
        </div>
        <div className="feature-kort">
          <span className="feature-ikon">📋</span>
          <h3>Husker prisene dine</h3>
          <p>Materialer og timepriser lagres lokalt. Neste tilbud går enda raskere.</p>
        </div>
        <div className="feature-kort">
          <span className="feature-ikon">📄</span>
          <h3>Klar PDF</h3>
          <p>Med logo, firmainfo, prisoversikt og akseptklausul — klar til å sende.</p>
        </div>
      </section>

      {/* PRIS */}
      <section className="landing-pris">
        <h2 className="landing-seksjon-tittel">Enkel prising</h2>
        <div className="pris-grid">
          <div className="pris-kort">
            <h3>Gratis</h3>
            <p className="pris-beloep">0 kr</p>
            <ul className="pris-liste">
              <li>✓ 3 tilbud totalt</li>
              <li>✓ AI-generert tekst</li>
              <li>✓ PDF-nedlasting</li>
              <li>✓ Lagrede prislinjer</li>
            </ul>
            <button className="btn btn-secondary" onClick={onStart}>Prøv gratis</button>
          </div>
          <div className="pris-kort pris-kort-pro">
            <div className="pro-badge">Populær</div>
            <h3>Pro</h3>
            <p className="pris-beloep">99 kr<span>/mnd</span></p>
            <ul className="pris-liste">
              <li>✓ Ubegrenset antall tilbud</li>
              <li>✓ AI-generert tekst</li>
              <li>✓ PDF med firmalogo</li>
              <li>✓ Lagrede prislinjer</li>
              <li>✓ Påslagskalkulator</li>
            </ul>
            <button className="btn btn-primary" onClick={onStart}>Start med Pro</button>
          </div>
        </div>
        <p className="pris-sammenligning">ProTilbud.no koster 499 kr/mnd for tilsvarende funksjoner.</p>
      </section>

    </div>
  )
}
