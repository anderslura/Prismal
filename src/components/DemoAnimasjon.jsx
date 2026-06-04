import { useState, useEffect } from 'react'

const FASER = [
  { id: 'kunde',       slutt: 3200  },
  { id: 'jobb',        slutt: 7000  },
  { id: 'timer',       slutt: 9000  },
  { id: 'mat1',        slutt: 12000 },
  { id: 'mat2',        slutt: 15500 },
  { id: 'mat3',        slutt: 19000 },
  { id: 'paaslag_huk', slutt: 21000 },
  { id: 'paaslag_pst', slutt: 23000 },
  { id: 'generer',     slutt: 24200 },
  { id: 'laster',      slutt: 26500 },
  { id: 'preview',     slutt: 31500 },
  { id: 'pdf',         slutt: 40000 },
  { id: 'pause',       slutt: 42000 },
]
const TOTAL = 42000

function fase(ms) {
  for (const f of FASER) if (ms < f.slutt) return f.id
  return 'pause'
}
function typeText(full, ms, startMs, endMs) {
  const p = Math.min(1, Math.max(0, (ms - startMs) / (endMs - startMs)))
  return full.slice(0, Math.round(p * full.length))
}
function prog(ms, fraId, tilId) {
  const fra = fraId === 'start' ? 0 : (FASER.find(f => f.id === fraId)?.slutt || 0)
  const til = FASER.find(f => f.id === tilId)?.slutt || fra + 1000
  return Math.min(1, Math.max(0, (ms - fra) / (til - fra)))
}

const KUNDE_NAVN = 'Kari Nordmann'
const KUNDE_ADR  = 'Furuvegen 12, 5700 Voss'
const JOBB_TEKST = 'Nødvendig forarbeid og oppsett av terrasse på 20 kvm'
const AI_TEKST   = `Hei Kari,\n\nVi sender herved tilbud på nødvendig forarbeid og oppsett av terrasse på 20 kvm ved Furuvegen 12. Vi stiller med fagfolk og nødvendig maskiner, og sørger for solid og ryddig utførelse med kvalitetsmaterialer.\n\nDersom det oppstår uforutsette forhold underveis, varsler vi deg umiddelbart. Ta gjerne kontakt om du har spørsmål.`

const MATERIALER = [
  { navn: 'Maskinleie',              ant: 1,  pris: 1500, sum: '1 500 kr' },
  { navn: 'Impregnert lekt',         ant: 12, pris: 214,  sum: '2 568 kr' },
  { navn: 'Terrasseskruer (pakke)',  ant: 2,  pris: 99,   sum: '198 kr'   },
]

const MAT_FASER = ['mat1','mat2','mat3']

function faseIdx(id) { return FASER.findIndex(f => f.id === id) }

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

  const kundeTyped = typeText(KUNDE_NAVN, ms, 300, 3200)
  const kundeAdrTyped = ms > 2200 ? typeText(KUNDE_ADR, ms, 2200, 3200) : ''
  const jobbTyped  = typeText(JOBB_TEKST, ms, 3200, 7000)
  const timerTyped = ms > 7500 ? typeText('12', ms, 7500, 9000) : ''

  // Hvilke linjer er lagt til
  const lagteMat = MATERIALER.filter((_, i) => ms > FASER.find(f => f.id === MAT_FASER[i])?.slutt - 200)

  // Nåværende linje som skrives
  const skriveIdx = MAT_FASER.findIndex(f => aktivFase === f)
  const startSkrivMs = skriveIdx >= 0 ? (skriveIdx === 0 ? 9000 : FASER.find(f => f.id === MAT_FASER[skriveIdx-1])?.slutt) : 0
  const sluttSkrivMs = skriveIdx >= 0 ? FASER.find(f => f.id === MAT_FASER[skriveIdx])?.slutt - 500 : 0
  const skriveNavn  = skriveIdx >= 0 ? typeText(MATERIALER[skriveIdx].navn, ms, startSkrivMs, startSkrivMs + (sluttSkrivMs - startSkrivMs) * 0.5) : ''
  const skriveAnt   = skriveIdx >= 0 && ms > startSkrivMs + (sluttSkrivMs - startSkrivMs) * 0.5 ? String(MATERIALER[skriveIdx].ant) : ''
  const skrivePris  = skriveIdx >= 0 && ms > startSkrivMs + (sluttSkrivMs - startSkrivMs) * 0.65 ? String(MATERIALER[skriveIdx].pris) : ''

  const huketAv     = ms > FASER.find(f=>f.id==='paaslag_huk').slutt - 300
  const paaslagPst  = ms > FASER.find(f=>f.id==='paaslag_pst').slutt - 200 ? '25' :
                      aktivFase === 'paaslag_pst' ? typeText('25', ms,
                        FASER.find(f=>f.id==='paaslag_huk').slutt,
                        FASER.find(f=>f.id==='paaslag_pst').slutt) : ''
  const visPaaslag  = ms > FASER.find(f=>f.id==='paaslag_huk').slutt - 800
  const visLaster   = aktivFase === 'laster'
  const visKnapp    = aktivFase === 'generer'
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
            : <span className="demo-btn-sm demo-btn-gronn">+ Nytt tilbud</span>}
        </div>

        {/* SKJEMA */}
        {visSide === 'skjema' && (
          <div className="demo-to-kol">

            {/* VENSTRE */}
            <div className="demo-kol-venstre">

              {/* DIN BEDRIFT — forhåndsutfylt */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Din bedrift</div>
                <div className="demo-firma-grid">
                  <div>
                    <div className="demo-label">Firmanavn</div>
                    <div className="demo-input-boks demo-graa">Ditt firma AS</div>
                  </div>
                  <div className="demo-logo-felt">
                    <div className="demo-label">Logo</div>
                    <div className="demo-logo-runding">Din<br/>logo</div>
                  </div>
                </div>
                <div className="demo-to-felt" style={{marginTop:4}}>
                  <div>
                    <div className="demo-label">Telefon</div>
                    <div className="demo-input-boks demo-graa">000 00 000</div>
                  </div>
                  <div>
                    <div className="demo-label">E-post</div>
                    <div className="demo-input-boks demo-graa">din@firma.no</div>
                  </div>
                </div>
                <div style={{marginTop:4}}>
                  <div className="demo-label">Adresse</div>
                  <div className="demo-input-boks demo-graa">Bedriftsvegen 1, 0000 Byen</div>
                </div>
                <div className="demo-to-felt" style={{marginTop:4}}>
                  <div>
                    <div className="demo-label">Org.nr</div>
                    <div className="demo-input-boks demo-graa">000 000 000</div>
                  </div>
                  <div>
                    <div className="demo-label">Nettside</div>
                    <div className="demo-input-boks demo-graa">www.dittfirma.no</div>
                  </div>
                </div>
              </div>

              {/* KUNDE */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Kunde</div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Kundenavn *</div>
                  <div className="demo-input-boks">
                    {kundeTyped || <span className="demo-placeholder">Kari Nordmann</span>}
                    {aktivFase === 'kunde' && ms < 2200 && <span className="demo-cursor">|</span>}
                  </div>
                </div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Adresse</div>
                  <div className="demo-input-boks">
                    {kundeAdrTyped || (ms < 2200 ? <span className="demo-placeholder">Hjemveien 5, 0002 Oslo</span> : '')}
                    {aktivFase === 'kunde' && ms >= 2200 && <span className="demo-cursor">|</span>}
                  </div>
                </div>
              </div>

              {/* JOBBEN */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Jobben</div>
                <div className="demo-label">Beskrivelse *</div>
                <div className="demo-input-boks demo-textarea-boks">
                  {jobbTyped || <span className="demo-placeholder">Eks: male stue, bytte vinduer...</span>}
                  {aktivFase === 'jobb' && <span className="demo-cursor">|</span>}
                </div>
                {ms > 3200 && <div className="demo-hint-tekst">AI skriver profesjonelt tilbudsspråk basert på dette.</div>}
              </div>
            </div>

            {/* HØYRE */}
            <div className="demo-kol-hoyre">

              {/* ARBEID */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Arbeid</div>
                <div className="demo-to-felt">
                  <div>
                    <div className="demo-label">Timer</div>
                    <div className="demo-input-boks">
                      {timerTyped || <span className="demo-placeholder">eks. 8</span>}
                      {aktivFase === 'timer' && <span className="demo-cursor">|</span>}
                    </div>
                  </div>
                  <div>
                    <div className="demo-label">Kr/time</div>
                    <div className="demo-input-boks demo-graa">650</div>
                  </div>
                </div>
              </div>

              {/* MATERIALER */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Materialer & utgifter</div>
                <div className="demo-mat-header">
                  <span>Beskrivelse</span><span>Ant.</span><span>Kr</span><span>Sum</span><span>↑%</span><span></span>
                </div>

                {lagteMat.map((m, i) => (
                  <div key={i} className="demo-mat-rad demo-mat-rad-aktiv">
                    <span style={{fontSize:9}}>{m.navn}</span>
                    <span>{m.ant}</span>
                    <span>{m.pris}</span>
                    <span style={{color:'var(--blaa)',fontWeight:600,fontSize:9}}>{m.sum}</span>
                    <span className={`demo-cb ${i === 2 && huketAv ? 'demo-cb-aktiv' : ''}`}>
                      {i === 2 && huketAv ? '✓' : ''}
                    </span>
                    <span className="demo-x-btn">×</span>
                  </div>
                ))}

                {/* Ny linje */}
                {skriveIdx >= 0 && (
                  <div className="demo-mat-ny-rad">
                    <div className="demo-input-boks demo-mat-input">
                      {skriveNavn || <span className="demo-placeholder">Beskrivelse</span>}
                      {skriveIdx >= 0 && !skriveAnt && <span className="demo-cursor">|</span>}
                    </div>
                    <span className="demo-input-boks demo-mat-liten">{skriveAnt}</span>
                    <span className="demo-input-boks demo-mat-liten">{skrivePris}</span>
                    <button className={`demo-legg-til ${skrivePris ? 'demo-legg-til-aktiv' : ''}`}>Legg til</button>
                  </div>
                )}

                {/* Påslag */}
                {visPaaslag && (
                  <div className="demo-paaslag-rad demo-paaslag-inn">
                    <span className="demo-label" style={{marginBottom:0}}>Påslag (kun avhukede linjer)</span>
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
                    <div className="demo-doc-sub">Bedriftsvegen 1 · 000 00 000</div>
                    <div className="demo-doc-sub">din@firma.no · Org.nr: 000 000 000</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="demo-doc-tilbud-label">TILBUD</div>
                  <div className="demo-doc-sub">Nr: T2606-412</div>
                  <div className="demo-doc-sub">Dato: 4.6.2026 · Gyldig: 4.7.2026</div>
                </div>
              </div>
              <div className="demo-doc-til">
                <div style={{fontSize:9,color:'#6b7280',textTransform:'uppercase'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:12}}>Kari Nordmann · Furuvegen 12, 5700 Voss</div>
              </div>
              <div className="demo-doc-ai-tekst">
                <div style={{fontWeight:700,fontSize:11,color:'var(--blaa)',marginBottom:3}}>Tilbud</div>
                <div style={{fontSize:9.5,lineHeight:1.55,whiteSpace:'pre-line',color:'#374151'}}>
                  {aiTyped}
                  {aktivFase === 'preview' && <span className="demo-cursor">|</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PDF */}
        {visPdf && (
          <div className="demo-pdf-full" style={{opacity: Math.min(1, pdfOpacity * 4)}}>
            <div className="demo-pdf-hdr">
              <div className="demo-pdf-hdr-venstre">
                <div className="demo-pdf-logo-boks">Din<br/>logo</div>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:'white'}}>Ditt firma AS</div>
                  <div style={{fontSize:8.5,color:'rgba(255,255,255,0.85)'}}>Bedriftsvegen 1, 0000 Byen</div>
                  <div style={{fontSize:8.5,color:'rgba(255,255,255,0.85)'}}>din@firma.no · 000 00 000 · Org.nr: 000 000 000</div>
                  <div style={{fontSize:8.5,color:'rgba(255,255,255,0.85)'}}>www.dittfirma.no</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:14,fontWeight:700,color:'white',letterSpacing:2}}>TILBUD</div>
                <div style={{fontSize:8.5,color:'rgba(255,255,255,0.9)'}}>Nr: T2606-412</div>
                <div style={{fontSize:8.5,color:'rgba(255,255,255,0.9)'}}>Dato: 4.6.2026 · Gyldig til: 4.7.2026</div>
              </div>
            </div>
            <div className="demo-pdf-body">
              <div className="demo-pdf-til-blokk">
                <div style={{fontSize:8,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.4px'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:12}}>Kari Nordmann</div>
                <div style={{fontSize:9,color:'#6b7280'}}>Furuvegen 12, 5700 Voss</div>
              </div>
              <div style={{borderBottom:'1px solid #e5e7eb',margin:'8px 0'}}/>
              <div style={{fontWeight:700,fontSize:10,color:'var(--blaa)',marginBottom:4}}>Tilbud</div>
              <div style={{fontSize:8.5,lineHeight:1.5,color:'#374151',marginBottom:10}}>
                Hei Kari, vi sender herved tilbud på nødvendig forarbeid og oppsett av terrasse på 20 kvm ved Furuvegen 12. Vi stiller med fagfolk og nødvendig maskiner, og sørger for solid utførelse med kvalitetsmaterialer. Vi varsler deg umiddelbart dersom uforutsette forhold oppstår.
              </div>
              <table className="demo-pdf-tabell">
                <thead>
                  <tr><th>Beskrivelse</th><th>Antall</th><th>Enhetspris</th><th>Sum</th></tr>
                </thead>
                <tbody>
                  <tr><td>Arbeid</td><td>12 t</td><td>650 kr</td><td>7 800 kr</td></tr>
                  <tr><td>Maskinleie</td><td>1 stk</td><td>1 500 kr</td><td>1 500 kr</td></tr>
                  <tr><td>Impregnert lekt</td><td>12 stk</td><td>214 kr</td><td>2 568 kr</td></tr>
                  <tr><td>Terrasseskruer (pakke)</td><td>2 stk</td><td>99 kr</td><td>198 kr</td></tr>
                  <tr><td>Påslag materialer (25%)</td><td></td><td></td><td>50 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>Sum eks. mva</td><td>12 116 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>MVA 25%</td><td>3 029 kr</td></tr>
                  <tr className="demo-pdf-total-rad"><td colSpan={3}><strong>Totalt inkl. mva</strong></td><td><strong>15 145 kr</strong></td></tr>
                </tbody>
              </table>
              <div className="demo-pdf-aksept">
                <strong>Aksept av tilbud:</strong> Skriftlig aksept sendes til din@firma.no innen tilbudets gyldighetsperiode. Muntlig aksept er ikke bindende.
              </div>
              <div className="demo-pdf-footer-linje">⬇ Last ned PDF — klar til å sende</div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
