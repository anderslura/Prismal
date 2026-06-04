import { useState, useEffect } from 'react'

const FASER = [
  { id: 'kunde',       slutt: 3000  },
  { id: 'jobb',        slutt: 6500  },
  { id: 'timer',       slutt: 8500  },
  { id: 'material',    slutt: 12000 },
  { id: 'paaslag_huk', slutt: 14000 },
  { id: 'paaslag_pst', slutt: 16000 },
  { id: 'generer',     slutt: 17200 },
  { id: 'laster',      slutt: 19200 },
  { id: 'preview',     slutt: 24000 },
  { id: 'pdf',         slutt: 29000 },
  { id: 'pause',       slutt: 31000 },
]
const TOTAL = 31000

function fase(ms) {
  for (const f of FASER) if (ms < f.slutt) return f.id
  return 'pause'
}
function prog(ms, fraId, tilId) {
  const fra = fraId === 'start' ? 0 : (FASER.find(f => f.id === fraId)?.slutt || 0)
  const til = FASER.find(f => f.id === tilId)?.slutt || fra + 1000
  return Math.min(1, Math.max(0, (ms - fra) / (til - fra)))
}
function typeText(full, ms, startMs, endMs) {
  const p = Math.min(1, Math.max(0, (ms - startMs) / (endMs - startMs)))
  return full.slice(0, Math.round(p * full.length))
}

const KUNDE_NAVN = 'Kari Nordmann'
const JOBB_TEKST = 'terrassebord 20kvm, trykkimpregnert furu'
const AI_TEKST   = `Hei Kari,\n\nVi sender herved tilbud på levering og legging av trykkimpregnert terrassebord på 20 kvm. Arbeidet utføres fagmessig og grundig.\n\nVi varsler deg umiddelbart dersom uforutsette forhold oppstår underveis. Ta kontakt om du har spørsmål.`

export default function DemoAnimasjon() {
  const [ms, setMs] = useState(0)
  useEffect(() => {
    let start = null, raf
    function tick(ts) {
      if (!start) start = ts
      setMs((ts - start) % TOTAL)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const aktivFase = fase(ms)
  const visSide   = ['preview','pdf','pause'].includes(aktivFase) ? 'preview' : 'skjema'

  const kundeTyped  = typeText(KUNDE_NAVN, ms, 300, 3000)
  const jobbTyped   = typeText(JOBB_TEKST, ms, 3000, 6500)
  const timerTyped  = ms > 7000 ? typeText('10', ms, 7000, 8500) : ''
  const matTyped    = ms > 9000 ? typeText('Terrassebord', ms, 9000, 11000) : ''
  const matLagt     = ms > 11500
  const huketAv     = ms > FASER.find(f=>f.id==='paaslag_huk').slutt - 200
  const paaslagPst  = ms > FASER.find(f=>f.id==='paaslag_pst').slutt - 200 ? '25' :
                      aktivFase === 'paaslag_pst' ? typeText('25', ms,
                        FASER.find(f=>f.id==='paaslag_huk').slutt,
                        FASER.find(f=>f.id==='paaslag_pst').slutt) : ''
  const visPaaslag  = ms > FASER.find(f=>f.id==='paaslag_huk').slutt - 500
  const visKnapp    = aktivFase === 'generer'
  const visLaster   = aktivFase === 'laster'
  const aiTyped     = ['preview','pdf','pause'].includes(aktivFase)
    ? typeText(AI_TEKST, ms, FASER.find(f=>f.id==='laster').slutt, FASER.find(f=>f.id==='preview').slutt)
    : ''
  const visPdf      = aktivFase === 'pdf' || aktivFase === 'pause'
  const pdfOpacity  = prog(ms, 'preview', 'pdf')

  return (
    <div className="demo-wrapper">
      <div className="demo-skjerm">

        {/* HEADER */}
        <div className="demo-header">
          <span className="demo-logo">Prismal</span>
          <span className="demo-tagline">Din mal. Din pris. Din tid.</span>
          {visSide === 'preview'
            ? <span className="demo-btn-sm demo-btn-gronn">+ Nytt tilbud</span>
            : <span style={{fontSize:10,color:'#6b7280'}}>Ditt firma AS</span>}
        </div>

        {/* SKJEMA */}
        {visSide === 'skjema' && (
          <div className="demo-to-kol">

            {/* VENSTRE */}
            <div className="demo-kol-venstre">
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Kunde</div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Kundenavn *</div>
                  <div className="demo-input-boks">
                    {kundeTyped || <span className="demo-placeholder">Kari Nordmann</span>}
                    {aktivFase === 'kunde' && <span className="demo-cursor">|</span>}
                  </div>
                </div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Adresse</div>
                  <div className="demo-input-boks demo-graa">Hjemveien 5, 0002 Oslo</div>
                </div>
              </div>

              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Jobben</div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Beskrivelse av jobben *</div>
                  <div className="demo-input-boks demo-textarea-boks">
                    {jobbTyped || <span className="demo-placeholder">Eks: male stue, bytte vinduer...</span>}
                    {aktivFase === 'jobb' && <span className="demo-cursor">|</span>}
                  </div>
                  {ms > 3000 && <div className="demo-hint-tekst">AI skriver profesjonelt tilbudsspråk basert på dette.</div>}
                </div>
              </div>
            </div>

            {/* HØYRE */}
            <div className="demo-kol-hoyre">
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Arbeid</div>
                <div className="demo-to-felt">
                  <div className="demo-felt-liten">
                    <div className="demo-label">Timer</div>
                    <div className="demo-input-boks">
                      {timerTyped || <span className="demo-placeholder">eks. 8</span>}
                      {aktivFase === 'timer' && <span className="demo-cursor">|</span>}
                    </div>
                  </div>
                  <div className="demo-felt-liten">
                    <div className="demo-label">Kr/time</div>
                    <div className="demo-input-boks demo-graa">650</div>
                  </div>
                </div>
              </div>

              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Materialer & utgifter</div>
                <div className="demo-mat-header">
                  <span>Beskrivelse</span><span>Ant.</span><span>Kr</span><span>Sum</span><span>Påslag</span>
                </div>

                {matLagt && (
                  <div className="demo-mat-rad demo-mat-rad-aktiv">
                    <span>Terrassebord</span><span>18</span><span>85</span>
                    <span style={{color:'var(--blaa)',fontWeight:600}}>1 530 kr</span>
                    <span className={`demo-cb ${huketAv ? 'demo-cb-aktiv' : ''}`}>
                      {huketAv ? '✓' : ''}
                    </span>
                  </div>
                )}

                <div className="demo-mat-ny-rad">
                  <div className="demo-input-boks demo-mat-input">
                    {matTyped && !matLagt ? matTyped : <span className="demo-placeholder">Beskrivelse</span>}
                    {aktivFase === 'material' && !matLagt && <span className="demo-cursor">|</span>}
                  </div>
                  <span className="demo-input-boks demo-mat-liten">{!matLagt && ms > 10500 ? '18' : ''}</span>
                  <span className="demo-input-boks demo-mat-liten">{!matLagt && ms > 11000 ? '85' : ''}</span>
                  <button className={`demo-legg-til ${ms > 11200 && !matLagt ? 'demo-legg-til-aktiv' : ''}`}>Legg til</button>
                </div>

                {/* PÅSLAG-rad */}
                {visPaaslag && (
                  <div className="demo-paaslag-rad demo-paaslag-inn">
                    <span className="demo-label" style={{marginBottom:0}}>Påslag materialer (kun avhukede)</span>
                    <div style={{display:'flex',alignItems:'center',gap:4}}>
                      <div className="demo-input-boks demo-paaslag-input">
                        {paaslagPst || <span className="demo-placeholder">0</span>}
                        {aktivFase === 'paaslag_pst' && <span className="demo-cursor">|</span>}
                      </div>
                      <span style={{fontSize:11,fontWeight:600}}>%</span>
                    </div>
                  </div>
                )}
              </div>

              <button className={`demo-generer-knapp ${visKnapp ? 'demo-generer-aktiv' : ''} ${visLaster ? 'demo-generer-laster' : ''}`}>
                {visLaster ? '⏳ AI genererer tekst...' : 'Generer profesjonelt tilbud'}
              </button>
            </div>
          </div>
        )}

        {/* FORHÅNDSVISNING */}
        {visSide === 'preview' && !visPdf && (
          <div className="demo-preview">
            <div className="demo-preview-tittel-rad">
              <span className="demo-preview-tittel">Forhåndsvisning av tilbud</span>
              <span className="demo-btn-sm">⬇ Last ned PDF</span>
            </div>
            <div className="demo-doc">
              <div className="demo-doc-header">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="demo-logo-sirkel">Din<br/>logo</div>
                  <div>
                    <div className="demo-doc-firma">Ditt firma AS</div>
                    <div className="demo-doc-sub">Din adresse · Tlf: 00000000</div>
                    <div className="demo-doc-sub">din@epost.no</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="demo-doc-tilbud-label">TILBUD</div>
                  <div className="demo-doc-sub">Nr: T2606-321</div>
                  <div className="demo-doc-sub">Dato: 4.6.2026</div>
                </div>
              </div>
              <div className="demo-doc-til">
                <div style={{fontSize:9,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:13}}>Kari Nordmann</div>
              </div>
              <div className="demo-doc-ai-tekst">
                <div style={{fontWeight:700,fontSize:11,color:'var(--blaa)',marginBottom:4}}>Tilbud</div>
                <div style={{fontSize:10,lineHeight:1.55,whiteSpace:'pre-line',color:'#374151'}}>
                  {aiTyped}
                  {aktivFase === 'preview' && <span className="demo-cursor">|</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF */}
        {visPdf && (
          <div className="demo-pdf-full" style={{opacity: Math.min(1, pdfOpacity * 3)}}>
            <div className="demo-pdf-hdr">
              <div className="demo-pdf-hdr-venstre">
                <div className="demo-pdf-logo-boks">Din<br/>logo</div>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:'white'}}>Ditt firma AS</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.8)'}}>Din adresse her</div>
                  <div style={{fontSize:9,color:'rgba(255,255,255,0.8)'}}>din@epost.no · 000 00 000</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13,fontWeight:700,color:'white',letterSpacing:2}}>TILBUD</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.9)'}}>Nr: T2606-321 · Dato: 4.6.2026</div>
                <div style={{fontSize:9,color:'rgba(255,255,255,0.9)'}}>Gyldig til: 4.7.2026</div>
              </div>
            </div>
            <div className="demo-pdf-body">
              <div className="demo-pdf-til-blokk">
                <div style={{fontSize:8,color:'#6b7280',textTransform:'uppercase'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:12}}>Kari Nordmann</div>
              </div>
              <div style={{borderBottom:'1px solid #e5e7eb',marginBottom:8}}/>
              <div style={{fontWeight:700,fontSize:10,color:'var(--blaa)',marginBottom:4}}>Tilbud</div>
              <div style={{fontSize:9,lineHeight:1.5,color:'#374151',marginBottom:10}}>
                Hei Kari, vi sender herved tilbud på levering og legging av trykkimpregnert terrassebord på 20 kvm. Arbeidet utføres fagmessig med kvalitetsmaterialer og grundig gjennomføring.
              </div>
              <table className="demo-pdf-tabell">
                <thead>
                  <tr><th>Beskrivelse</th><th>Antall</th><th>Enhetspris</th><th>Sum</th></tr>
                </thead>
                <tbody>
                  <tr><td>Arbeid</td><td>10 t</td><td>650 kr</td><td>6 500 kr</td></tr>
                  <tr><td>Terrassebord</td><td>18 stk</td><td>85 kr</td><td>1 530 kr</td></tr>
                  <tr><td>Påslag materialer (25%)</td><td></td><td></td><td>383 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>Sum eks. mva</td><td>8 413 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>MVA 25%</td><td>2 103 kr</td></tr>
                  <tr className="demo-pdf-total-rad"><td colSpan={3}><strong>Totalt inkl. mva</strong></td><td><strong>10 516 kr</strong></td></tr>
                </tbody>
              </table>
              <div className="demo-pdf-aksept">
                <strong>Aksept av tilbud:</strong> Skriftlig aksept sendes til din@epost.no innen tilbudets gyldighetsperiode.
              </div>
              <div className="demo-pdf-footer-linje">⬇ Klar for nedlasting</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
