/* ── Landingsside v5 — lys, moderne, demo-karusell ── */
import { useState, useEffect } from 'react'
import DemoSlideshow from './DemoSlideshow'

const FAQ_LISTE = [
  {
    sp: 'Hva koster Prismal?',
    sv: 'Du starter gratis og får 3 fulle tilbud med alle funksjoner — ingen kredittkort nødvendig. Etter det koster Prismal Pro 99 kr/mnd eks. mva (124 kr inkl. mva). Ingen bindingstid, avslutt når du vil.'
  },
  {
    sp: 'Kan jeg bruke min egen logo og firmainformasjon?',
    sv: 'Ja. Du laster opp logo og fyller inn firmainfo én gang — det hentes automatisk på alle fremtidige tilbud, uavhengig av hvilken enhet du bruker.'
  },
  {
    sp: 'Hva gjør AI-tekstfunksjonen?',
    sv: 'Du beskriver oppdraget med egne ord — rettskriving er ikke viktig. AI-en omformer det til en komplett, profesjonell tilbudstekst. Du kan lese gjennom og redigere teksten før du sender.'
  },
  {
    sp: 'Fungerer Prismal på mobil og nettbrett?',
    sv: 'Ja, Prismal er optimalisert for mobil, nettbrett og PC. Ingen app å installere — du logger bare inn i nettleseren og er klar.'
  },
  {
    sp: 'Hvordan sendes tilbudet til kunden?',
    sv: 'Du sender direkte fra Prismal til kundens e-post. PDF legges ved automatisk. Du får kopi i din innboks, og tilbudet lagres i Prismal-historikken din.'
  },
  {
    sp: 'Kan jeg lagre kunder og materialer?',
    sv: 'Ja. Kunder lagres ved å trykke «Lagre kunde» — deretter søkes de opp på navn eller mobilnummer i fremtidige tilbud. Materialer lagres automatisk i et personlig bibliotek med priser, og du oppdaterer kun antall fra gang til gang. Alt synkroniseres i skyen og er tilgjengelig på alle enheter.'
  },
  {
    sp: 'Hvordan avslutter jeg abonnementet?',
    sv: 'Du avslutter når du vil fra «Abonnement og fakturaer» i profilmenyen. Ingen bindingstid, ingen skjulte kostnader.'
  },
]

function FaqSeksjon() {
  const [aapen, setAapen] = useState(null)
  return (
    <section className="l2-faq">
      <div className="l2-faq-inner">
        <p className="l2-faq-overst">Ofte stilte spørsmål</p>
        <h2 className="l2-faq-tittel">Har du spørsmål? Vi har svar.</h2>
        <div className="l2-faq-liste">
          {FAQ_LISTE.map((f, i) => (
            <div key={i} className={`l2-faq-item${aapen === i ? ' aapen' : ''}`}>
              <button className="l2-faq-sporsmal" onClick={() => setAapen(aapen === i ? null : i)}>
                <span>{f.sp}</span>
                <svg className="l2-faq-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {aapen === i && (
                <div className="l2-faq-svar">{f.sv}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

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
              <div
                className="l2-hero-bilde-stack"
                onClick={() => {
                  // Mobil: åpne PDF-en direkte i egen fane — mer stabilt enn iframe i lightbox-overlay
                  // på mobile nettlesere. Desktop: vis i egendefinert lightbox med ekte PDF (vektor-skarp).
                  if (window.innerWidth <= 760) {
                    window.open('/demo/pdf_forside_v2.pdf', '_blank')
                  } else {
                    setLightbox(true)
                  }
                }}
                title="Trykk for å se tilbudet i full størrelse"
              >
                <img
                  src="/demo/pdf_forside_side2_v2.png"
                  alt="Side 2 av Prismal-tilbud"
                  className="l2-hero-bilde-kort l2-hero-bilde-bak"
                />
                <img
                  src="/demo/pdf_forside_v2.png"
                  alt="Eksempel på Prismal-tilbud, side 1"
                  className="l2-hero-bilde-kort l2-hero-bilde-frem l2-hero-bilde-klikkbar"
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

      {/* ── PITCH ── */}
      <section className="l2-pitch">
        <div className="l2-pitch-inner">
          <p className="l2-pitch-overst">Hvorfor Prismal?</p>
          <h2 className="l2-pitch-tittel">Tilbud som vinner jobber — ikke mister dem</h2>
          <div className="l2-pitch-kort-rad">
            <div className="l2-pitch-kort">
              <h3>Ikke mist kunden på veien</h3>
              <p>Kunder som venter lenge på tilbud velger noen andre. Med Prismal sender du profesjonelt tilbud samme dag — gjerne fra bilen etter befaringen.</p>
            </div>
            <div className="l2-pitch-kort">
              <h3>Imponer — og vinn mot konkurrentene</h3>
              <p>Et gjennomarbeidet tilbud med logo, pristabell og akseptklausul signaliserer seriøsitet. Kunden velger den som ser mest profesjonell ut.</p>
            </div>
            <div className="l2-pitch-kort">
              <h3>Spar tid — send flere — få flere jobber</h3>
              <p>Når et tilbud tar minutter i stedet for timer, sender du mer. Mer tilbud gir mer jobb. Prismal er investering i din egen kapasitet.</p>
            </div>
            <div className="l2-pitch-kort l2-pitch-kort-norsk">
              <h3>Laget i Norge — for norske fagfolk</h3>
              <p>Prismal er utviklet av en norsk fagmann, for fagmenn og -damer i Norge. Norsk kundeservice, og alle oppdateringer og forbedringer er alltid inkludert i abonnementet — uten ekstra kostnad. Kom med innspill, følg oss på Facebook, og bli med på å forme Norges beste verktøy for tilbud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO KARUSELL ── */}
      <DemoSlideshow />


      {/* ── ANMELDELSER ── */}
      <section className="l2-anm">
        <div className="l2-anm-inner">
          <p className="l2-anm-overst">Hva fagfolk sier</p>
          <h2 className="l2-anm-tittel">Brukt av håndverkere over hele Norge</h2>
          <div className="l2-anm-rad">
            <div className="l2-anm-kort">
              <div className="l2-anm-stjerner">★★★★★</div>
              <p className="l2-anm-tekst">«Sender nå tilbud samme dag som befaring. Kundene reagerer positivt på hvor profesjonelt det ser ut — og jeg vinner flere jobber.»</p>
              <div className="l2-anm-navn">Thomas H. — Maler, Stavanger</div>
            </div>
            <div className="l2-anm-kort">
              <div className="l2-anm-stjerner">★★★★★</div>
              <p className="l2-anm-tekst">«Brukte å bruke halv dag på tilbud i Word. Nå er det gjort på 10 minutter fra mobilen. Materialbiblioteket alene er verdt pengene.»</p>
              <div className="l2-anm-navn">Kristian B. — Rørlegger, Bergen</div>
            </div>
            <div className="l2-anm-kort">
              <div className="l2-anm-stjerner">★★★★★</div>
              <p className="l2-anm-tekst">«AI-teksten er overraskende god. Jeg skriver noen stikkord og får et komplett, profesjonelt tilbud tilbake. Enkelt og effektivt.»</p>
              <div className="l2-anm-navn">Silje M. — Elektriker, Oslo</div>
            </div>
          </div>
          <p className="l2-anm-kilde">Anmeldelser fra Google</p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FaqSeksjon />

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
          <iframe
            src="/demo/pdf_forside_v2.pdf"
            title="Prismal tilbud forhåndsvisning"
            className="l2-lightbox-pdf"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

    </div>
  )
}
