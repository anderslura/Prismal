import { useState, useEffect } from 'react'

const FASER = [
  { id: 'kunde_navn',  slutt: 2500  },
  { id: 'kunde_adr',   slutt: 3400  },
  { id: 'kunde_epost', slutt: 4400  },
  { id: 'jobb',        slutt: 8200  },
  { id: 'timer',       slutt: 10200 },
  { id: 'mat1',        slutt: 13200 },
  { id: 'mat2',        slutt: 16800 },
  { id: 'mat3',        slutt: 20300 },
  { id: 'huk_lekt',    slutt: 21800 },
  { id: 'huk_skruer',  slutt: 23300 },
  { id: 'paaslag_pst', slutt: 25300 },
  { id: 'generer',     slutt: 26500 },
  { id: 'laster',      slutt: 28800 },
  { id: 'preview',     slutt: 33800 },
  { id: 'klikk_pdf',   slutt: 35000 },
  { id: 'pdf',         slutt: 40000 },
  { id: 'pause',       slutt: 42000 },
]
const TOTAL = 42000

function faseSluttt(id) { return FASER.find(f => f.id === id)?.slutt || 0 }
function fase(ms) { for (const f of FASER) if (ms < f.slutt) return f.id; return 'pause' }
function typeText(full, ms, s, e) {
  const p = Math.min(1, Math.max(0, (ms - s) / (e - s)))
  return full.slice(0, Math.round(p * full.length))
}
function prog(ms, fraId, tilId) {
  const fra = faseSluttt(fraId), til = faseSluttt(tilId)
  return Math.min(1, Math.max(0, (ms - fra) / (til - fra)))
}

const KUNDE_NAVN  = 'Kari Nordmann'
const KUNDE_ADR   = 'Furuvegen 12, 5700 Voss'
const KUNDE_EPOST = 'kari@epost.no'
const JOBB_TEKST  = 'Nødvendig forarbeid og oppsett av terrasse på 20 kvm'
const AI_TEKST    = `Hei Kari,\n\nVi sender herved tilbud på nødvendig forarbeid og oppsett av terrasse på 20 kvm ved Furuvegen 12. Vi stiller med fagfolk og nødvendig maskiner, og sørger for solid utførelse med kvalitetsmaterialer.\n\nDersom uforutsette forhold oppstår underveis, varsler vi deg umiddelbart. Ta kontakt om du har spørsmål.`

const MAT = [
  { navn: 'Maskinleie',             ant: 1,  pris: 1500, sum: '1 500 kr', paaslag: false },
  { navn: 'Impregnert lekt',        ant: 12, pris: 214,  sum: '2 568 kr', paaslag: true  },
  { navn: 'Terrasseskruer (pakke)', ant: 2,  pris: 99,   sum: '198 kr',   paaslag: true  },
]
const MAT_FASER = ['mat1','mat2','mat3']

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
  const visSide   = ['preview','klikk_pdf','pdf','pause'].includes(aktivFase) ? 'preview' : 'skjema'

  const kundeNavnTyped  = typeText(KUNDE_NAVN,  ms, 300,  faseSluttt('kunde_navn'))
  const kundeAdrTyped   = typeText(KUNDE_ADR,   ms, faseSluttt('kunde_navn'), faseSluttt('kunde_adr'))
  const kundeEpostTyped = typeText(KUNDE_EPOST, ms, faseSluttt('kunde_adr'),  faseSluttt('kunde_epost'))
  const jobbTyped       = typeText(JOBB_TEKST,  ms, faseSluttt('kunde_epost'), faseSluttt('jobb'))
  const timerTyped      = ms > faseSluttt('jobb') + 400 ? typeText('12', ms, faseSluttt('jobb') + 400, faseSluttt('timer')) : ''

  const lagte = MAT.filter((_, i) => ms > faseSluttt(MAT_FASER[i]) - 200)
  const skriveIdx = MAT_FASER.findIndex(id => aktivFase === id)
  const sStart = skriveIdx === 0 ? faseSluttt('timer') : faseSluttt(MAT_FASER[skriveIdx - 1] || 'timer')
  const sSlut  = faseSluttt(MAT_FASER[skriveIdx] || 'mat1') - 400
  const sNavn  = skriveIdx >= 0 ? typeText(MAT[skriveIdx].navn, ms, sStart, sStart + (sSlut - sStart) * 0.5) : ''
  const sAnt   = skriveIdx >= 0 && ms > sStart + (sSlut - sStart) * 0.55 ? String(MAT[skriveIdx].ant) : ''
  const sPris  = skriveIdx >= 0 && ms > sStart + (sSlut - sStart) * 0.7  ? String(MAT[skriveIdx].pris) : ''

  const huketLekt   = ms > faseSluttt('huk_lekt') - 200
  const huketSkruer = ms > faseSluttt('huk_skruer') - 200
  const paasPst     = ms > faseSluttt('paaslag_pst') - 200 ? '25'
                    : aktivFase === 'paaslag_pst' ? typeText('25', ms, faseSluttt('huk_skruer'), faseSluttt('paaslag_pst')) : ''
  const visKnapp    = aktivFase === 'generer'
  const visLaster   = aktivFase === 'laster'
  const aiTyped     = ['preview','klikk_pdf','pdf','pause'].includes(aktivFase)
    ? typeText(AI_TEKST, ms, faseSluttt('laster'), faseSluttt('preview')) : ''
  const visPdf      = aktivFase === 'pdf' || aktivFase === 'pause'
  const klikkerPdf  = aktivFase === 'klikk_pdf'
  const pdfOpacity  = prog(ms, 'klikk_pdf', 'pdf')
  // 4 sek visning: nedlastet-state de siste 4 sek av pdf-fasen
  const nedlastet   = ms > faseSluttt('pdf') - 4000

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
            <div className="demo-kol-venstre">

              {/* DIN BEDRIFT */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Din bedrift</div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Firmanavn</div>
                  <div className="demo-input-boks demo-graa demo-prefilled">Ditt firma AS</div>
                </div>
                <div className="demo-to-felt" style={{marginTop:3}}>
                  <div><div className="demo-label">Telefon</div><div className="demo-input-boks demo-graa demo-prefilled">000 00 000</div></div>
                  <div><div className="demo-label">E-post</div><div className="demo-input-boks demo-graa demo-prefilled">din@firma.no</div></div>
                </div>
                <div style={{marginTop:3}}><div className="demo-label">Adresse</div><div className="demo-input-boks demo-graa demo-prefilled">Bedriftsvegen 1, 0000 Byen</div></div>
                <div className="demo-to-felt" style={{marginTop:3}}>
                  <div><div className="demo-label">Org.nr</div><div className="demo-input-boks demo-graa demo-prefilled">000 000 000</div></div>
                  <div><div className="demo-label">Nettside</div><div className="demo-input-boks demo-graa demo-prefilled">www.dittfirma.no</div></div>
                </div>
                <div style={{marginTop:4,display:'flex',alignItems:'center',gap:5}}>
                  <div className="demo-label" style={{marginBottom:0}}>Logo på PDF</div>
                  <div className="demo-logo-runding">Din<br/>logo</div>
                  <span style={{fontSize:9,color:'#dc2626'}}>×</span>
                  <span style={{fontSize:8,color:'var(--groen)',marginLeft:'auto'}}>✓ Lagres automatisk</span>
                </div>
              </div>

              {/* KUNDE */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Kunde</div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Kundenavn *</div>
                  <div className="demo-input-boks">
                    {kundeNavnTyped || <span className="demo-placeholder">Kari Nordmann</span>}
                    {aktivFase === 'kunde_navn' && <span className="demo-cursor">|</span>}
                  </div>
                </div>
                <div className="demo-felt-liten">
                  <div className="demo-label">Adresse</div>
                  <div className="demo-input-boks">
                    {kundeAdrTyped || (ms < faseSluttt('kunde_navn') ? <span className="demo-placeholder">Hjemveien 5</span> : '')}
                    {aktivFase === 'kunde_adr' && <span className="demo-cursor">|</span>}
                  </div>
                </div>
                <div className="demo-felt-liten">
                  <div className="demo-label">E-post</div>
                  <div className="demo-input-boks">
                    {kundeEpostTyped || (ms < faseSluttt('kunde_adr') ? <span className="demo-placeholder">kari@epost.no</span> : '')}
                    {aktivFase === 'kunde_epost' && <span className="demo-cursor">|</span>}
                  </div>
                </div>
              </div>

              {/* JOBBEN */}
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Jobben</div>
                <div className="demo-label">Beskrivelse av jobben *</div>
                <div className="demo-input-boks demo-textarea-boks">
                  {jobbTyped || <span className="demo-placeholder">Eks: male stue, bytte vinduer...</span>}
                  {aktivFase === 'jobb' && <span className="demo-cursor">|</span>}
                </div>
                {ms > faseSluttt('kunde_epost') && <div className="demo-hint-tekst">AI skriver profesjonelt tilbudsspråk basert på dette.</div>}
              </div>
            </div>

            {/* HØYRE */}
            <div className="demo-kol-hoyre">
              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Arbeid</div>
                <div className="demo-to-felt">
                  <div><div className="demo-label">Timer</div>
                    <div className="demo-input-boks">{timerTyped || <span className="demo-placeholder">eks. 8</span>}{aktivFase==='timer'&&<span className="demo-cursor">|</span>}</div>
                  </div>
                  <div><div className="demo-label">Kr/time</div><div className="demo-input-boks demo-graa demo-prefilled">650</div></div>
                </div>
              </div>

              <div className="demo-seksjon">
                <div className="demo-seksjon-tittel">Materialer & utgifter</div>
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
                    <div className="demo-input-boks demo-mat-input">{sNavn || <span className="demo-placeholder">Beskrivelse</span>}{skriveIdx>=0&&!sAnt&&<span className="demo-cursor">|</span>}</div>
                    <span className="demo-input-boks demo-mat-liten" style={{textAlign:'center'}}>{sAnt}</span>
                    <span className="demo-input-boks demo-mat-liten" style={{textAlign:'right'}}>{sPris}</span>
                    <button className={`demo-legg-til ${sPris ? 'demo-legg-til-aktiv' : ''}`}>Legg til</button>
                  </div>
                )}
                {ms > faseSluttt('mat3') - 500 && <div className="demo-hint-tekst" style={{marginTop:3}}>Nye linjer huskes til neste tilbud.</div>}
              </div>

              {ms > faseSluttt('huk_lekt') - 500 && (
                <div className="demo-seksjon demo-paaslag-seksjon">
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                    <div className="demo-seksjon-tittel" style={{marginBottom:0}}>Påslag materialer</div>
                    <div style={{fontSize:8,color:'var(--tekst-sekundaer)'}}>Kun avhukede linjer</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <div className="demo-input-boks demo-paaslag-input">{paasPst || <span className="demo-placeholder">0</span>}{aktivFase==='paaslag_pst'&&<span className="demo-cursor">|</span>}</div>
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

        {/* ── FORHÅNDSVISNING (med påslag) ── */}
        {visSide === 'preview' && !visPdf && (
          <div className="demo-preview">
            <div className="demo-preview-tittel-rad">
              <span className="demo-preview-tittel">Forhåndsvisning av tilbud</span>
              <button className={`demo-btn-lastned ${klikkerPdf ? 'demo-btn-lastned-aktiv' : ''}`}>
                ⬇ Last ned PDF
              </button>
            </div>
            <div className="demo-doc">
              <div className="demo-doc-header">
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div className="demo-logo-sirkel">Din<br/>logo</div>
                  <div>
                    <div className="demo-doc-firma">Ditt firma AS</div>
                    <div className="demo-doc-sub">Bedriftsvegen 1 · 000 00 000 · din@firma.no</div>
                    <div className="demo-doc-sub">Org.nr: 000 000 000 · www.dittfirma.no</div>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div className="demo-doc-tilbud-label">TILBUD</div>
                  <div className="demo-doc-sub">Nr: T2606-412 · Dato: 4.6.2026</div>
                </div>
              </div>
              <div className="demo-doc-til">
                <div style={{fontSize:8,color:'#6b7280',textTransform:'uppercase'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:11}}>Kari Nordmann · Furuvegen 12, 5700 Voss</div>
              </div>
              <div className="demo-doc-ai-tekst">
                <div style={{fontWeight:700,fontSize:10,color:'var(--blaa)',marginBottom:2}}>Tilbud</div>
                <div style={{fontSize:8.5,lineHeight:1.5,whiteSpace:'pre-line',color:'#374151'}}>
                  {aiTyped}{['preview'].includes(aktivFase) && <span className="demo-cursor">|</span>}
                </div>
                {ms > faseSluttt('preview') - 1500 && (
                  <div className="demo-preview-pris-mini">
                    <div className="demo-preview-pris-rad"><span>Arbeid (12t × 650)</span><span>7 800 kr</span></div>
                    <div className="demo-preview-pris-rad"><span>Materialer</span><span>4 266 kr</span></div>
                    <div className="demo-preview-pris-rad demo-preview-paaslag"><span>Påslag materialer (25%)</span><span>692 kr</span></div>
                    <div className="demo-preview-pris-rad demo-preview-total"><span>Totalt inkl. mva</span><span>15 946 kr</span></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── PDF (uten påslag, justerte priser) ── */}
        {visPdf && (
          <div className="demo-pdf-full" style={{opacity: Math.min(1, pdfOpacity * 5)}}>
            <div className="demo-pdf-hdr">
              <div className="demo-pdf-hdr-venstre">
                <div className="demo-pdf-logo-boks">Din<br/>logo</div>
                <div>
                  <div style={{fontWeight:800,fontSize:11,color:'white'}}>Ditt firma AS</div>
                  <div style={{fontSize:7.5,color:'rgba(255,255,255,0.85)'}}>Bedriftsvegen 1, 0000 Byen · din@firma.no · 000 00 000</div>
                  <div style={{fontSize:7.5,color:'rgba(255,255,255,0.85)'}}>Org.nr: 000 000 000 · www.dittfirma.no</div>
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:13,fontWeight:700,color:'white',letterSpacing:2}}>TILBUD</div>
                <div style={{fontSize:7.5,color:'rgba(255,255,255,0.9)'}}>Nr: T2606-412 · Dato: 4.6.2026 · Gyldig til: 4.7.2026</div>
              </div>
            </div>
            <div className="demo-pdf-body">
              <div className="demo-pdf-til-blokk">
                <div style={{fontSize:7.5,color:'#6b7280',textTransform:'uppercase'}}>Tilbud til</div>
                <div style={{fontWeight:700,fontSize:11}}>Kari Nordmann</div>
                <div style={{fontSize:8,color:'#6b7280'}}>Furuvegen 12, 5700 Voss · kari@epost.no</div>
              </div>
              <div style={{borderBottom:'1px solid #e5e7eb',margin:'5px 0'}}/>
              <div style={{fontWeight:700,fontSize:9.5,color:'var(--blaa)',marginBottom:3}}>Tilbud</div>
              <div style={{fontSize:8,lineHeight:1.45,color:'#374151',marginBottom:7}}>
                Hei Kari, vi sender herved tilbud på nødvendig forarbeid og oppsett av terrasse på 20 kvm. Vi stiller med fagfolk og nødvendig maskiner, og sørger for solid utførelse med kvalitetsmaterialer.
              </div>
              <table className="demo-pdf-tabell">
                <thead>
                  <tr><th>Beskrivelse</th><th>Antall</th><th>Enhetspris</th><th>Sum</th></tr>
                </thead>
                <tbody>
                  <tr><td>Arbeid</td><td>12 t</td><td>650 kr</td><td>7 800 kr</td></tr>
                  <tr><td>Maskinleie</td><td>1 stk</td><td>1 500 kr</td><td>1 500 kr</td></tr>
                  <tr><td>Impregnert lekt</td><td>12 stk</td><td>268 kr</td><td>3 216 kr</td></tr>
                  <tr><td>Terrasseskruer (pakke)</td><td>2 stk</td><td>124 kr</td><td>248 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>Sum eks. mva</td><td>12 764 kr</td></tr>
                  <tr className="demo-pdf-sum-rad"><td colSpan={3}>MVA 25%</td><td>3 191 kr</td></tr>
                  <tr className="demo-pdf-total-rad"><td colSpan={3}><strong>Totalt inkl. mva</strong></td><td><strong>15 955 kr</strong></td></tr>
                </tbody>
              </table>
              <div className="demo-pdf-aksept">
                <strong>Aksept av tilbud:</strong> Skriftlig aksept sendes til din@firma.no innen tilbudets gyldighetsperiode. Muntlig aksept er ikke bindende.
              </div>
              <div className={`demo-pdf-footer-linje ${nedlastet ? 'demo-nedlastet' : ''}`}>
                {nedlastet ? '✓ Tilbud-T2606-412.pdf lastet ned' : '⬇ Last ned PDF'}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
