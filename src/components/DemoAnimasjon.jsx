import { useState, useEffect } from 'react'

const FASER = [
  { id: 'kunde',       slutt: 3200  },
  { id: 'jobb',        slutt: 7000  },
  { id: 'timer',       slutt: 9000  },
  { id: 'mat1',        slutt: 12000 },
  { id: 'mat2',        slutt: 15500 },
  { id: 'mat3',        slutt: 19000 },
  { id: 'huk_lekt',    slutt: 20500 },
  { id: 'huk_skruer',  slutt: 22000 },
  { id: 'paaslag_pst', slutt: 24000 },
  { id: 'generer',     slutt: 25200 },
  { id: 'laster',      slutt: 27500 },
  { id: 'preview',     slutt: 32500 },
  { id: 'pdf',         slutt: 41500 },
  { id: 'pause',       slutt: 43500 },
]
const TOTAL = 43500

function fase(ms) {
  for (const f of FASER) if (ms < f.slutt) return f.id
  return 'pause'
}
function typeText(full, ms, s, e) {
  const p = Math.min(1, Math.max(0, (ms - s) / (e - s)))
  return full.slice(0, Math.round(p * full.length))
}
function prog(ms, fraId, tilId) {
  const fra = FASER.find(f => f.id === fraId)?.slutt || 0
  const til = FASER.find(f => f.id === tilId)?.slutt || fra + 1000
  return Math.min(1, Math.max(0, (ms - fra) / (til - fra)))
}
function faseSluttt(id) { return FASER.find(f => f.id === id)?.slutt || 0 }

const KUNDE_NAVN = 'Kari Nordmann'
const KUNDE_ADR  = 'Furuvegen 12, 5700 Voss'
const JOBB_TEKST = 'Nødvendig forarbeid og oppsett av terrasse på 20 kvm'
const AI_TEKST   = `Hei Kari,\n\nVi sender herved tilbud på nødvendig forarbeid og oppsett av terrasse på 20 kvm ved Furuvegen 12. Vi stiller med fagfolk og maskiner, og sørger for solid utførelse med kvalitetsmaterialer.\n\nDersom uforutsette forhold oppstår underveis varsler vi deg umiddelbart. Ta kontakt om du har spørsmål.`

// Materialer: navn, ant, pris, sum
const MAT = [
  { navn: 'Maskinleie',             ant: 1,  pris: 1500, sum: '1 500 kr', paaslag: false },
  { navn: 'Impregnert lekt',        ant: 12, pris: 214,  sum: '2 568 kr', paaslag: true  },
  { navn: 'Terrasseskruer (pakke)', ant: 2,  pris: 99,   sum: '198 kr',   paaslag: true  },
]
const MAT_FASER = ['mat1','mat2','mat3']

// Regnestykke med 25% påslag på lekt+skruer
// Arbeid: 12×650=7800, Maskinleie:1500, Lekt:2568, Skruer:198, Påslag:(2568+198)×0.25=691.5
// Sum eks mva: 12757, MVA: 3189, Total: 15946

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

  const kundeTyped = typeText(KUNDE_NAVN, ms, 300, 2500)
  const kundeAdr   = typeText(KUNDE_ADR,  ms, 2200, 3200)
  const jobbTyped  = typeText(JOBB_TEKST, ms, 3200, 7000)
  const timerTyped = ms > 7500 ? typeText('12', ms, 7500, 9000) : ''

  // Lagt-til linjer
  const lagte = MAT.filter((_, i) => ms > faseSluttt(MAT_FASER[i]) - 200)

  // Linje som skrives nå
  const skriveIdx = MAT_FASER.findIndex(id => aktivFase === id)
  const sStart = skriveIdx === 0 ? 9000 : faseSluttt(MAT_FASER[skriveIdx - 1] || 'timer')
  const sSlut  = faseSluttt(MAT_FASER[skriveIdx] || 'mat1') - 400
  const sNavn  = skriveIdx >= 0 ? typeText(MAT[skriveIdx].navn, ms, sStart, sStart + (sSlut - sStart) * 0.5) : ''
  const sAnt   = skriveIdx >= 0 && ms > sStart + (sSlut - sStart) * 0.55 ? String(MAT[skriveIdx].ant) : ''
  const sPris  = skriveIdx >= 0 && ms > sStart + (sSlut - sStart) * 0.7 ? String(MAT[skriveIdx].pris) : ''

  // Avhukinger
  const huketLekt   = ms > faseSluttt('huk_lekt') - 200
  const huketSkruer = ms > faseSluttt('huk_skruer') - 200
  const paasPst     = ms > faseSluttt('paaslag_pst') - 200 ? '25'
                    : aktivFase === 'paaslag_pst' ? typeText('25', ms, faseSluttt('huk_skruer'), faseSluttt('paaslag_pst')) : ''
  const visKnapp    = aktivFase === 'generer'
  const visLaster   = aktivFase === 'laster'
  const aiTyped     = ['preview','pdf','pause'].includes(aktivFase)
    ? typeText(AI_TEKST, ms, faseSluttt('laster'), faseSluttt('preview')) : ''
  const visPdf      = aktivFase === 'pdf' || aktivFase === 'pause'
  const pdfOpacity  = prog(ms, 'preview', 'pdf')
  const nedlastet   = ms > faseSluttt('pdf') - 2500

  function cbStatus(i) {
    if (i === 1) return huketLekt
    if (i === 2) return huketSkruer
    return false
  }

  return (
    <div className="demo-wrapper">
      <div className="demo-skjerm">

        {/* HEADER */}
        <div className="demo-header">
          <span className="demo-logo">Prismal</span>
          <span className="demo-tagline">Din mal. Din pris. Din tid.</span>
          <span className="demo-btn-sm demo-btn-gronn">+ Nytt tilbud</span>
        </div>

        {/* ── SKJEMA ── */}
        {visSide === 'skjema' && (
          <div className="demo-to-kol">

            {/* VENSTRE */}
            <div className="demo-kol-venstre">

              {/* DIN BEDRIFT */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel" style={{color:'var(--blaa)'}}>Din bedrift</div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Firmanavn</div>
                  <div className="demo-input-boks demo-graa demo-prefilled">Ditt firma AS</div>
                </div>
                <div className="demo-to-felt" style={{marginTop:3}}>
                  <div>
                    <div className="demo-label">Telefon</div>
                    <div className="demo-input-boks demo-graa demo-prefilled">000 00 000</div>
                  </div>
                  <div>
                    <div className="demo-label">E-post</div>
                    <div className="demo-input-boks demo-graa demo-prefilled">din@firma.no</div>
                  </div>
                </div>
                <div className="demo-felt-liten" style={{marginTop:3}}>
                  <div className="demo-label">Adresse</div>
                  <div className="demo-input-boks demo-graa demo-prefilled">Bedriftsvegen 1, 0000 Byen</div>
                </div>
                <div className="demo-to-felt" style={{marginTop:3}}>
                  <div>
                    <div className="demo-label">Org.nr</div>
                    <div className="demo-input-boks demo-graa demo-prefilled">000 000 000</div>
                  </div>
                  <div>
                    <div className="demo-label">Nettside</div>
                    <div className="demo-input-boks demo-graa demo-prefilled">www.dittfirma.no</div>
                  </div>
                </div>
                <div style={{marginTop:4,display:'flex',alignItems:'center',gap:6}}>
                  <div className="demo-label" style={{marginBottom:0}}>Logo på PDF</div>
                  <div className="demo-logo-runding" style={{width:26,height:26,fontSize:6}}>Din<br/>logo</div>
                  <span style={{fontSize:9,color:'#dc2626',cursor:'pointer'}}>×</span>
                  <span style={{fontSize:9,color:'var(--groen)',marginLeft:'auto'}}>✓ Lagres automatisk</span>
                </div>
              </div>

              {/* KUNDE */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel" style={{color:'var(--blaa)'}}>Kunde</div>
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
                    {kundeAdr || (ms < 2200 ? <span className="demo-placeholder">Hjemveien 5</span> : '')}
                    {aktivFase === 'kunde' && ms >= 2200 && <span className="demo-cursor">|</span>}
                  </div>
                </div>
              </div>

              {/* JOBBEN */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel" style={{color:'var(--blaa)'}}>Jobben</div>
                <div className="demo-label">Beskrivelse av jobben *</div>
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
                <div className="demo-seksjon-tittel" style={{color:'var(--blaa)'}}>Arbeid</div>
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
                    <div className="demo-input-boks demo-graa demo-prefilled">650</div>
                  </div>
                </div>
              </div>

              {/* MATERIALER */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel" style={{color:'var(--blaa)'}}>Materialer & utgifter</div>
                <div className="demo-mat-header">
                  <span>Beskrivelse</span><span>Ant.</span><span>Kr</span><span>Sum</span><span>Påslag</span><span></span>
                </div>

                {lagte.map((m, i) => (
                  <div key={i} className="demo-mat-rad demo-mat-rad-aktiv">
                    <span style={{fontSize:9,overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{m.navn}</span>
                    <span style={{textAlign:'center'}}>{m.ant}</span>
                    <span style={{textAlign:'right'}}>{m.pris}</span>
                    <span style={{color:'var(--blaa)',fontWeight:600,fontSize:9,textAlign:'right'}}>{m.sum}</span>
                    <span className={`demo-cb ${cbStatus(i) ? 'demo-cb-aktiv' : ''}`}>{cbStatus(i) ? '✓' : ''}</span>
                    <span className="demo-x-btn">×</span>
                  </div>
                ))}

                {skriveIdx >= 0 && (
                  <div className="demo-mat-ny-rad">
                    <div className="demo-input-boks demo-mat-input">
                      {sNavn || <span className="demo-placeholder">Beskrivelse</span>}
                      {skriveIdx >= 0 && !sAnt && <span className="demo-cursor">|</span>}
                    </div>
                    <span className="demo-input-boks demo-mat-liten" style={{textAlign:'center'}}>{sAnt}</span>
                    <span className="demo-input-boks demo-mat-liten" style={{textAlign:'right'}}>{sPris}</span>
                    <button className={`demo-legg-til ${sPris ? 'demo-legg-til-aktiv' : ''}`}>Legg til</button>
                  </div>
                )}

                {ms > faseSluttt('mat3') - 500 && (
                  <div className="demo-hint-tekst" style={{marginTop:4}}>Nye linjer huskes til neste tilbud.</div>
                )}
              </div>

              {/* PÅSLAG MATERIALER — eget seksjon som i real app */}
              {ms > faseSluttt('huk_lekt') - 500 && (
                <div className="demo-seksjon demo-paaslag-seksjon">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                    <div className="demo-seksjon-tittel" style={{color:'var(--blaa)',marginBottom:0}}>Påslag materialer</div>
                    <div className="demo-label" style={{marginBottom:0,color:'var(--tekst-sekundaer)'}}>Kun avhukede linjer</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <div className="demo-input-boks demo-paaslag-input">
                      {paasPst || <span className="demo-placeholder">0</span>}
                      {aktivFase === 'paaslag_pst' && <span className="demo-cursor">|</span>}
                    </div>
                    <span style={{fontSize:14,fontWeight:700,color:'var(--blaa)'}}>%</span>
                  </div>
                </div>
              )}

              <button className={`demo-generer-knapp ${visKnapp ? 'demo-generer-aktiv' : ''} ${visLaster ? 'demo-generer-laster' : ''}`}>
                {visLaster ? '⏳ AI genererer tekst...' : 'Generer profesjonelt tilbud'}
              </button>
            </div>
          </div>
        )}

        {/* ── FORHÅNDSVISNING ── */}
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
                    <div className="demo-doc-sub">Bedriftsvegen 1, 0000 Byen</div>
                    <div className="demo-doc-sub">din@firma.no · 000 00 000 · Org.nr: 000 000 000</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="demo-doc-tilbud-label">TILBUD</div>
                  <div className="demo-doc-sub">Nr: T2606-412 · Dato: 4.6.2026</div>
                </div>
              </div>
              <div className="demo-doc-til">
                <div style={{fontSize:8,color:'#6b7280',textTransform:'uppercase'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:12}}>Kari Nordmann · Furuvegen 12, 5700 Voss</div>
              </div>
              <div className="demo-doc-ai-tekst">
                <div style={{fontWeight:700,fontSize:10,color:'var(--blaa)',marginBottom:3}}>Tilbud</div>
                <div style={{fontSize:9,lineHeight:1.5,whiteSpace:'pre-line',color:'#374151'}}>
                  {aiTyped}<span className="demo-cursor">|</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PDF ── */}
        {visPdf && (
          <div className="demo-pdf-full" style={{opacity: Math.min(1, pdfOpacity * 4)}}>
            <div className="demo-pdf-hdr">
              <div className="demo-pdf-hdr-venstre">
                <div className="demo-pdf-logo-boks">Din<br/>logo</div>
                <div>
                  <div style={{fontWeight:800,fontSize:12,color:'white'}}>Ditt firma AS</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.85)'}}>Bedriftsvegen 1, 0000 Byen</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.85)'}}>din@firma.no · 000 00 000</div>
                  <div style={{fontSize:8,color:'rgba(255,255,255,0.85)'}}>Org.nr: 000 000 000 · www.dittfirma.no</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13,fontWeight:700,color:'white',letterSpacing:2}}>TILBUD</div>
                <div style={{fontSize:8,color:'rgba(255,255,255,0.9)'}}>Nr: T2606-412</div>
                <div style={{fontSize:8,color:'rgba(255,255,255,0.9)'}}>Dato: 4.6.2026 · Gyldig til: 4.7.2026</div>
              </div>
            </div>
            <div className="demo-pdf-body">
              <div className="demo-pdf-til-blokk">
                <div style={{fontSize:8,color:'#6b7280',textTransform:'uppercase'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:11}}>Kari Nordmann</div>
                <div style={{fontSize:8,color:'#6b7280'}}>Furuvegen 12, 5700 Voss</div>
              </div>
              <div style={{borderBottom:'1px solid #e5e7eb',margin:'6px 0'}}/>
              <div style={{fontWeight:700,fontSize:10,color:'var(--blaa)',marginBottom:3}}>Tilbud</div>
              <div style={{fontSize:8.5,lineHeight:1.45,color:'#374151',marginBottom:8}}>
                Hei Kari, vi sender herved tilbud på nødvendig forarbeid og oppsett av terrasse på 20 kvm ved Furuvegen 12. Vi stiller med fagfolk og nødvendig maskiner, og sørger for solid utførelse med kvalitetsmaterialer. Vi varsler deg umiddelbart om uforutsette forhold oppstår.
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
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>Sum eks. mva</td><td>12 757 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>MVA 25%</td><td>3 189 kr</td></tr>
                  <tr className="demo-pdf-total-rad"><td colSpan={3}><strong>Totalt inkl. mva</strong></td><td><strong>15 946 kr</strong></td></tr>
                </tbody>
              </table>
              <div className="demo-pdf-aksept">
                <strong>Aksept av tilbud:</strong> Skriftlig aksept sendes til din@firma.no innen tilbudets gyldighetsperiode. Muntlig aksept er ikke bindende.
              </div>
              <div className={`demo-pdf-footer-linje ${nedlastet ? 'demo-nedlastet' : ''}`}>
                {nedlastet ? '✓ PDF lastet ned — klar til å sende kunden' : '⬇ Last ned PDF'}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
