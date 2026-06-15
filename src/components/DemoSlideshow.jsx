/* ── DemoSlideshow — erstatning for FlipDemo på landingssiden ── */
import { useState, useCallback } from 'react'

const STEG = [
  {
    nr: '01', label: 'Bedriftsprofil',
    tittel: 'Legg inn info om din bedrift',
    tekst: 'Firmanavn, logo, e-post og org.nr lagres i skyen og hentes automatisk på alle enheter.',
    img: '/demo/bedrift.jpg',
  },
  {
    nr: '02', label: 'Kunden',
    tittel: 'Finn eller opprett en kunde',
    tekst: 'Søk på mobilnummer, navn eller adresse. Lagrede kunder hentes automatisk — ingen dobbeltregistrering.',
    img: '/demo/kunde.jpg',
  },
  {
    nr: '03', label: 'Jobben',
    tittel: 'Beskriv jobben med egne ord',
    tekst: 'Skriv stikkord eller setninger — AI omformer det til profesjonell tilbudstekst på sekunder.',
    img: '/demo/jobben.jpg',
  },
  {
    nr: '04', label: 'Timer',
    tittel: 'Timer og timepris',
    tekst: 'Legg inn estimert tid og din timepris. Malen husker timeprisen til neste tilbud.',
    img: '/demo/arbeid.jpg',
  },
  {
    nr: '05', label: 'Materialer',
    tittel: 'Komplett materialliste',
    tekst: 'Materiallisten lagres i ditt personlige bibliotek — neste oppdrag oppdaterer du kun antall. Kun linjer med antall utfylt vises på PDF-en som sendes kunden. Huk av en linje for å inkludere den i påslagskalkylen. Vil du fjerne en linje permanent? Trykk papirkurvikonet — linjen slettes fra biblioteket ditt i skyen.',
    img: '/demo/materialer.jpg',
  },
  {
    nr: '06', label: 'Påslag',
    tittel: 'Påslag og transport',
    tekst: 'Velg raskt mellom forhåndsinnstilte påslagsprosenter (10%, 20%, 30%), eller skriv inn et egendefinert tall. Legg til kjøring (kr/km), bom, parkering og ferge som egne linjer — transport spesifiseres separat og legges ikke inn i materialkalkylen.',
    img: '/demo/paaslag.jpg',
  },
  {
    nr: '07', label: 'Totaloversikt',
    tittel: 'Total og PDF-tema',
    tekst: 'Full oversikt eks. og inkl. mva. Velg tema — Standard, Mørk, Grå eller Hvit. Du kan også velge sesongbaserte temaer som Påske, Pride, Rosa sløyfe eller Julestil.',
    img: '/demo/total.jpg',
  },
  {
    nr: '08', label: 'Forhåndsvisning',
    tittel: 'Forhåndsvis og send tilbudet',
    tekst: 'Se det ferdige tilbudet før sending. Send direkte til kundens e-post — PDF legges ved automatisk. Kunden svarer til din bedrifts-e-post, og du mottar kopi i innboksen din. Tilbudet lagres i Prismal-historikken din.',
    img: '/demo/forhandsvisning.png',
  },
  {
    nr: '✓', label: 'Ferdig tilbud',
    tittel: 'Profesjonelt tilbud — klart til sending',
    tekst: 'Med logo, pristabell, betalingsbetingelser og akseptklausul. Leveres direkte i kundens innboks.',
    img: '/demo/pdf_combined.png',
  },
]

export default function DemoSlideshow() {
  const [aktivt, setAktivt] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const gåTil = useCallback((idx) => {
    setAktivt(idx)
    setAnimKey(k => k + 1)
  }, [])

  const neste = () => {
    setAktivt(a => { const n = (a + 1) % STEG.length; setAnimKey(k => k + 1); return n })
  }

  const forrige = () => {
    setAktivt(a => { const p = (a - 1 + STEG.length) % STEG.length; setAnimKey(k => k + 1); return p })
  }

  const s = STEG[aktivt]

  return (
    <section className="demo-seksjon">
      <div className="demo-intro">
        <p className="demo-overst">Slik fungerer det</p>
        <h2 className="demo-tittel">Fra skjema til profesjonelt tilbud — på sekunder</h2>
      </div>

      <div className="demo-grid">
        {/* Venstre: steg-navigasjon */}
        <nav className="demo-steg-nav" aria-label="Demo-steg">
          {STEG.map((st, i) => (
            <button
              key={i}
              className={`demo-steg-knapp${i === aktivt ? ' aktiv' : ''}`}
              onClick={() => gåTil(i)}
              aria-current={i === aktivt ? 'step' : undefined}
            >
              <span className="demo-steg-sirkel">{st.nr}</span>
              <span className="demo-steg-tekst">{st.label}</span>
            </button>
          ))}
        </nav>

        {/* Høyre: tekst + bilde */}
        <div className="demo-visning">
          <div className="demo-tekst" key={`t-${animKey}`}>
            <span className="demo-steg-badge">{s.nr} — {s.label}</span>
            <h3 className="demo-step-tittel">{s.tittel}</h3>
            <p className="demo-step-sub">{s.tekst}</p>
          </div>

          <div className="demo-bilde-ramme" key={`b-${animKey}`}>
            <img src={s.img} alt={s.label} className="demo-bilde" />
          </div>

          <div className="demo-kontroller">
            <button className="demo-pil" onClick={forrige} aria-label="Forrige">&#8592;</button>
            <div className="demo-dots" role="tablist">
              {STEG.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === aktivt}
                  className={`demo-dot${i === aktivt ? ' aktiv' : ''}`}
                  onClick={() => gåTil(i)}
                  aria-label={`Steg ${i + 1}`}
                />
              ))}
            </div>
            <button className="demo-pil" onClick={neste} aria-label="Neste">&#8594;</button>
          </div>
        </div>
      </div>
    </section>
  )
}
