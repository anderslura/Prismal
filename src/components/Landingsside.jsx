/* ── Landingsside v5 — lys, moderne, demo-karusell ── */
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
const DemoSlideshow = lazy(() => import('./DemoSlideshow'))

const FAQ_LISTE = [
  {
    sp: 'Hva koster Prismal?',
    sv: 'Du starter gratis og får 3 fulle tilbud med alle funksjoner — ingen kredittkort nødvendig. Etter det koster Prismal Pro 59 kr/mnd. Ingen bindingstid, avslutt når du vil.'
  },
  {
    sp: 'Kan jeg bruke min egen logo og firmainformasjon?',
    sv: 'Ja. Du laster opp logo og fyller inn firmainfo én gang — det hentes automatisk på alle fremtidige tilbud, uavhengig av hvilken enhet du bruker.'
  },
  {
    sp: 'Hvor finner jeg lenken til Facebook-siden min?',
    sv: 'Gå til Facebook-siden til bedriften din (ikke din private profil). På mobil: trykk de tre prikkene (•••) under profilbildet og velg «Kopier lenke». På PC: åpne siden og kopier adressen i nettleserens adressefelt (f.eks. facebook.com/firmanavn). Lim lenken inn under «Facebook – lenke» i Din bedrift, og den vises som en klikkbar knapp på tilbudene dine.'
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


function TestimonialSeksjon({ onRegistrer }) {
  return (
    <section className="l2-testimonial">
      <div className="l2-testimonial-inner">
        <div className="l2-testimonial-kort">
          <div className="l2-testimonial-foto-wrapper">
            <img src="/magnus_lura.jpg" alt="Magnus Lura — Bygg og Graving AS" className="l2-testimonial-foto"/>
          </div>
          <div className="l2-testimonial-innhold">
            <div className="l2-testimonial-sitattegn">"</div>
            <blockquote className="l2-testimonial-sitat">
              Med Prismal er tilbudet klart rett etter befaringen. Ryddigere, mer profesjonelt og raskere enn noe jeg har brukt før — og kundene merker det.
            </blockquote>
            <div className="l2-testimonial-person">
              <span className="l2-testimonial-navn">Magnus Lura</span>
              <span className="l2-testimonial-firma">Bygg og Graving AS</span>
            </div>
          </div>
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
  const pdfContainerRef = useRef(null)
  const [visStickyMobilCta, setVisStickyMobilCta] = useState(false)

  const scrollTilDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const onScroll = () => setVisStickyMobilCta(window.scrollY > 420)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox])

  // Rendrer PDF-sidene til <canvas> med pdf.js i stedet for <iframe src="...pdf">.
  // VIKTIG: iOS Safari viser ofte bare side 1 av en inline PDF-iframe, uten skrolling
  // og uten å fylle bredden (kjent WebKit-begrensning) — samme problem som ble løst i
  // TilbudPreview.jsx ("se som kunde"). pdf.js rendrer hver side til et canvas, som er
  // vanlig DOM-innhold og dermed skrolling/fyller skjermen normalt på alle enheter.
  useEffect(() => {
    if (!lightbox) return
    const container = pdfContainerRef.current
    if (!container) return
    let avbrutt = false

    ;(async () => {
      container.innerHTML = '<p style="color:#fff;font-family:sans-serif;font-size:14px;margin:40px 0;">Laster PDF …</p>'
      try {
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
            script.onload = resolve
            script.onerror = () => reject(new Error('Kunne ikke laste PDF-visningsbibliotek'))
            document.head.appendChild(script)
          })
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
        }
        if (avbrutt) return

        const pdf = await window.pdfjsLib.getDocument('/demo/pdf_forside_v2.pdf').promise
        if (avbrutt) return
        container.innerHTML = ''
        const dpr = window.devicePixelRatio || 1
        const breddeCss = Math.min(container.clientWidth - 20, 900)

        for (let i = 1; i <= pdf.numPages; i++) {
          const side = await pdf.getPage(i)
          const grunnViewport = side.getViewport({ scale: 1 })
          const skala = (breddeCss / grunnViewport.width) * dpr
          const renderViewport = side.getViewport({ scale: skala })

          const canvas = document.createElement('canvas')
          canvas.width = renderViewport.width
          canvas.height = renderViewport.height
          canvas.style.width = breddeCss + 'px'
          canvas.style.height = (renderViewport.height / dpr) + 'px'
          container.appendChild(canvas)
          if (avbrutt) return

          await side.render({ canvasContext: canvas.getContext('2d'), viewport: renderViewport }).promise
        }
      } catch {
        if (!avbrutt) {
          container.innerHTML = '<a href="/demo/pdf_forside_v2.pdf" target="_blank" style="color:#fff;font-family:sans-serif;font-size:14px;">Åpne PDF i ny fane</a>'
        }
      }
    })()

    return () => { avbrutt = true }
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
            <div className="l2-badge">Den som svarer først vinner jobben</div>
          </div>

          {/* Midtseksjon — tekst + PDF side om side */}
          <div className="l2-hero-split">
            <div className="l2-hero-tekst">
              <h1 className="l2-tittel">
                Profesjonelle tilbud.<br />
                <span className="l2-tittel-grad">På minutter.</span>
              </h1>
              <ul className="l2-punkter l2-punkter-hero">
                <li>Firmainfo og prislister huskes — nytt tilbud på 2 min</li>
                <li>Tilbudet sendes til kunden — du får alltid en kopi</li>
                <li>Ingen nedlasting — fungerer på mobil og PC</li>
                <li>3 gratis tilbud — deretter 59 kr/mnd, ingen binding</li>
              </ul>
              <div className="l2-hero-cta">
                <button className="l2-cta" onClick={onRegistrer}>Start gratis — 3 tilbud inkludert →</button>
                <p className="l2-cta-hint">Ingen kredittkort nødvendig</p>
                <p className="l2-stripe-trygg">
                  🔒 Sikker betaling via <strong>Stripe</strong> — vi ser aldri kortopplysningene dine
                </p>
              </div>
            </div>

            <div className="l2-hero-bilde-wrapper">
              <div
                className="l2-hero-bilde-stack"
                onClick={() => setLightbox(true)}
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

        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <TestimonialSeksjon onRegistrer={onRegistrer} />

      {/* ── PRIS ── */}
      <section className="l2-pris">
        <p className="l2-pris-overst">Enkel prising</p>
        <h2 className="l2-pris-tittel">Prøv gratis. Fortsett når du er klar.</h2>
        <div className="l2-pro-solo">
          <div className="l2-pro-solo-topp">
            <div>
              <div className="l2-plan-navn">Prismal Pro</div>
              <div className="l2-plan-pris l2-plan-pris-gull">59 <span>kr / mnd</span></div>
            </div>
            <div className="l2-trial-boks">
              <div className="l2-trial-tall">3</div>
              <div className="l2-trial-tekst">gratis tilbud<br/>ved registrering</div>
            </div>
          </div>
          <p className="l2-plan-roi">Glemmer du transport eller påslag på ett tilbud? Det kan koste mer enn måneder med Prismal.<br/>Én vunnet jobb betaler abonnementet — mange ganger over.</p>
          <div className="l2-pro-kolonner">
            <ul className="l2-plan-liste">
              <li className="ok">Tilbud klart på minutter — fra bilen etter befaringen</li>
              <li className="ok">AI skriver profesjonell tilbudstekst for deg</li>
              <li className="ok">PDF med logo, pristabell og klikkbare lenker</li>
            </ul>
            <ul className="l2-plan-liste">
              <li className="ok">Send direkte til kunden — ett klikk</li>
              <li className="ok">Kundedatabase og materialbibliotek</li>
              <li className="ok">Fungerer på mobil, nettbrett og PC</li>
            </ul>
          </div>
          <p className="l2-pris-sammenligning-topp">
            Tilsvarende løsninger koster 299–499 kr/mnd. <strong>Prismal: 59 kr.</strong>
          </p>
          <button className="l2-btn-pro" onClick={onRegistrer}>
            Registrer deg og start gratis
          </button>
          <div className="l2-garantier">
            <span>✓ Ingen bindingstid</span>
            <span>✓ Avslutt når du vil</span>
            <span>✓ Ingen skjulte kostnader</span>
          </div>
        </div>
      </section>

      {/* ── SE DEMO-KNAPP ── */}
      <div className="l2-se-demo-wrapper">
        <button className="l2-cta-sekundaer" onClick={scrollTilDemo}>
          Se hvordan det fungerer
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{marginLeft:6}}>
            <path d="M8 3v9M4 8l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <p className="l2-cta-hint">Ingen registrering nødvendig</p>
      </div>

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
              <p>Et gjennomarbeidet tilbud med logo, pristabell, akseptklausul og klikkbare lenker til nettside og Facebook signaliserer seriøsitet. Kunden velger den som ser mest profesjonell ut.</p>
            </div>
            <div className="l2-pitch-kort">
              <h3>Spar tid — send flere — få flere jobber</h3>
              <p>Når et tilbud tar minutter i stedet for timer, sender du mer. Mer tilbud gir mer jobb. Prismal er investering i din egen kapasitet.</p>
            </div>
            <div className="l2-pitch-kort l2-pitch-kort-norsk">
              <h3>Bygget i Norge — for håndverkere i hele landet</h3>
              <p>Prismal er bygget i Norge, for håndverkere i hele landet. Norsk kundeservice, og alle oppdateringer og forbedringer er alltid inkludert i abonnementet — uten ekstra kostnad. Kom med innspill, følg oss på Facebook, og bli med på å forme Norges beste verktøy for tilbud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FØR / ETTER ── */}
      <section className="l2-fe">
        <div className="l2-fe-inner">
          <p className="l2-fe-overst">Tidsbruk</p>
          <h2 className="l2-fe-tittel">Slik endrer Prismal arbeidsdagen din</h2>
          <div className="l2-fe-grid">
            <div className="l2-fe-kort l2-fe-kort-for">
              <h3>Uten Prismal</h3>
              <ul className="l2-fe-liste l2-fe-liste-for">
                <li>Bruker kvelden på å sette opp tilbud — aldri fra bilen</li>
                <li>Kopierer fra forrige jobb og risikerer å sende feil info til kunden</li>
                <li>Glemmer transport, miljøgebyr eller påslag — og taper penger på oppdraget</li>
                <li>Kunden får en Word-fil uten logo eller lenker — ser ikke profesjonelt ut</li>
              </ul>
            </div>
            <div className="l2-fe-kort l2-fe-kort-etter">
              <h3>Med Prismal</h3>
              <ul className="l2-fe-liste l2-fe-liste-etter">
                <li>Tilbud klart på under 10 minutter — gjerne fra bilen</li>
                <li>AI skriver en komplett, profesjonell tilbudstekst</li>
                <li>Priser, påslag, miljøgebyr og transport beregnes automatisk</li>
                <li>Sendes som polert PDF med klikkbare lenker til nettside og Facebook</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEMO KARUSELL ── */}
      <div id="demo">
        <Suspense fallback={<div style={{minHeight:'200px'}}/>}>
          <DemoSlideshow />
        </Suspense>
      </div>


      {/* ── FAQ ── */}
      <FaqSeksjon />


      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="l2-lightbox" onClick={() => setLightbox(false)}>
          <button className="l2-lightbox-lukk" onClick={() => setLightbox(false)} aria-label="Lukk">✕</button>
          <div
            ref={pdfContainerRef}
            className="l2-lightbox-pdf"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── STICKY CTA (mobil) ── */}
      <div className={`l2-sticky-cta ${visStickyMobilCta ? 'vis' : ''}`}>
        <button className="l2-cta l2-sticky-cta-knapp" onClick={onRegistrer}>
          Registrer deg gratis
        </button>
      </div>

    </div>
  )
}
