import { useState, useEffect } from 'react'

const STEG = [
  { id: 'kunde', label: 'Fyll inn kunde', duration: 2200 },
  { id: 'jobb',  label: 'Beskriv jobben', duration: 2000 },
  { id: 'pris',  label: 'Legg til priser', duration: 2200 },
  { id: 'pdf',   label: 'Last ned PDF',    duration: 2800 },
]
const TOTAL = STEG.reduce((s, x) => s + x.duration, 0) + 1800

export default function DemoAnimasjon() {
  const [ms, setMs] = useState(0)

  useEffect(() => {
    let start = null
    let raf
    function tick(ts) {
      if (!start) start = ts
      setMs((ts - start) % (TOTAL))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  // Beregn aktivt steg
  let acc = 0
  let aktivt = 0
  let progress = 0
  for (let i = 0; i < STEG.length; i++) {
    if (ms >= acc && ms < acc + STEG[i].duration) {
      aktivt = i
      progress = (ms - acc) / STEG[i].duration
      break
    }
    acc += STEG[i].duration
  }
  const visPDF = aktivt === 3 && progress > 0.3

  // Skriveanimasjon
  const kundeNavn = 'Kari Nordmann'
  const jobTekst = 'Legge terrassebord i trykkimpregnert furu'
  const typedKunde = aktivt >= 0 ? kundeNavn.slice(0, aktivt === 0 ? Math.round(progress * kundeNavn.length) : kundeNavn.length) : ''
  const typedJobb = aktivt >= 1 ? jobTekst.slice(0, aktivt === 1 ? Math.round(progress * jobTekst.length) : jobTekst.length) : ''

  return (
    <div className="demo-wrapper">
      <div className="demo-skjerm">

        {/* STEG-INDIKATORER */}
        <div className="demo-steg-rad">
          {STEG.map((s, i) => (
            <div key={s.id} className={`demo-steg ${i === aktivt ? 'aktiv' : ''} ${i < aktivt ? 'ferdig' : ''}`}>
              <span className="demo-steg-dot">{i < aktivt ? '✓' : i + 1}</span>
              <span className="demo-steg-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* SKJEMA-MOCKUP */}
        {!visPDF && (
          <div className="demo-skjema">
            <div className="demo-felt-gruppe">
              <div className="demo-label">Kundenavn</div>
              <div className="demo-input">
                {typedKunde}
                {aktivt === 0 && <span className="demo-cursor">|</span>}
              </div>
            </div>
            <div className="demo-felt-gruppe">
              <div className="demo-label">Beskriv jobben</div>
              <div className="demo-input demo-textarea">
                {typedJobb}
                {aktivt === 1 && <span className="demo-cursor">|</span>}
              </div>
            </div>
            <div className="demo-felt-gruppe">
              <div className="demo-label">Materialer & utgifter</div>
              <div className="demo-material-rad" style={{opacity: aktivt >= 2 ? 1 : 0.2}}>
                <span>Terrassebord</span>
                <span>×{aktivt >= 2 ? Math.round(progress * 18 + 1) : 0}</span>
                <span style={{color:'var(--blaa)', fontWeight:600}}>
                  {aktivt >= 2 ? `${Math.round((progress * 17 + 1) * 85)} kr` : '—'}
                </span>
              </div>
            </div>
            <div className={`demo-knapp ${aktivt === 2 && progress > 0.8 ? 'demo-knapp-aktiv' : ''}`}>
              Generer profesjonelt tilbud
            </div>
          </div>
        )}

        {/* PDF-PREVIEW */}
        {visPDF && (
          <div className="demo-pdf" style={{opacity: Math.min(1, (progress - 0.3) / 0.3)}}>
            <div className="demo-pdf-header">
              <div>
                <div className="demo-pdf-firma">Hjelpeportalen AS</div>
                <div className="demo-pdf-sub">kontakt@hjelpeportalen.no</div>
              </div>
              <div className="demo-pdf-tittel">TILBUD</div>
            </div>
            <div className="demo-pdf-til">Til: Kari Nordmann</div>
            <div className="demo-pdf-tekst">
              Takk for henvendelsen, Kari. Vi sender herved tilbud på levering og legging av trykkimpregnert terrassebord...
            </div>
            <div className="demo-pdf-tabell">
              <div className="demo-pdf-rad demo-pdf-header-rad">
                <span>Beskrivelse</span><span>Ant.</span><span>Sum</span>
              </div>
              <div className="demo-pdf-rad">
                <span>Arbeid</span><span>8 t</span><span>5 200 kr</span>
              </div>
              <div className="demo-pdf-rad">
                <span>Terrassebord</span><span>18 stk</span><span>1 530 kr</span>
              </div>
              <div className="demo-pdf-rad demo-pdf-total">
                <span>Totalt inkl. mva</span><span></span><span>8 413 kr</span>
              </div>
            </div>
            <div className="demo-pdf-nedlast">⬇ Last ned PDF</div>
          </div>
        )}
      </div>
    </div>
  )
}
