import { useState } from 'react'

const ENHETER = [
  'stk','m','m²','m³','km','kg','tonn','L','spann',
  'rull','pk','sekk','sett','dag','time','uke','leie'
]

export default function TilbudSkjema({ skjema, oppdater, onGenerer, laster, feil, prisliste, setPrisliste, isPro }) {

  const [nyEnhet, setNyEnhet] = useState('stk')
  const [nyNavn, setNyNavn] = useState('')
  const [nyPris, setNyPris] = useState('')
  const [nyAnt, setNyAnt] = useState('1')
  const [nyHasPaaslag, setNyHasPaaslag] = useState(true)

  function leggTilArbeider() {
    const lagretPris = (() => { try { return localStorage.getItem('timepris') || '' } catch { return '' } })()
    oppdater('arbeidere', [...skjema.arbeidere, { id: Date.now(), timer: '', timepris: lagretPris }])
  }

  function oppdaterArbeider(i, felt, verdi) {
    const ny = [...skjema.arbeidere]
    ny[i] = { ...ny[i], [felt]: verdi }
    oppdater('arbeidere', ny)
    if (felt === 'timepris') { try { localStorage.setItem('timepris', verdi) } catch {} }
  }

  function leggTilMaterial() {
    if (!nyNavn) return
    const ant = parseFloat(nyAnt) || 1
    const pris = parseFloat(nyPris) || 0
    const navn = ant > 1 ? `${nyNavn} (${ant} ${nyEnhet})` : nyNavn
    oppdater('materialer', [...skjema.materialer, { id: Date.now(), navn, pris: pris * ant, hasPaaslag: nyHasPaaslag }])
    setNyNavn(''); setNyPris(''); setNyAnt('1')
  }

  function oppdaterMaterialPris(id, verdi) {
    oppdater('materialer', skjema.materialer.map(m => m.id === id ? { ...m, pris: parseFloat(verdi) || 0 } : m))
  }

  function fjernMaterial(id) {
    oppdater('materialer', skjema.materialer.filter(m => m.id !== id))
  }

  // Transport og bom: finn eller null
  const harTransport = skjema.materialer.some(m => m._type === 'transport')
  const harBom = skjema.materialer.some(m => m._type === 'bom')

  function oppdaterRask(type, felt, verdi) {
    const idx = skjema.materialer.findIndex(m => m._type === type)
    if (idx === -1) return
    const ny = [...skjema.materialer]
    ny[idx] = { ...ny[idx], [felt]: verdi, pris: type === 'transport'
      ? (felt === 'ant' ? (parseFloat(verdi)||0) * (parseFloat(ny[idx].sats)||0) : (parseFloat(ny[idx].ant)||0) * (parseFloat(verdi)||0))
      : (felt === 'sats' ? parseFloat(verdi)||0 : ny[idx].pris)
    }
    if (felt === 'sats' || felt === 'ant') {
      ny[idx].pris = (parseFloat(ny[idx].ant)||0) * (parseFloat(ny[idx].sats)||0)
    }
    oppdater('materialer', ny)
  }

  function leggTilRask(type) {
    if (type === 'transport') {
      oppdater('materialer', [...skjema.materialer, { id: Date.now(), _type: 'transport', navn: 'Transport', ant: '', sats: '', pris: 0, hasPaaslag: false }])
    } else {
      oppdater('materialer', [...skjema.materialer, { id: Date.now(), _type: 'bom', navn: 'Bompenger', ant: '', sats: '', pris: 0, hasPaaslag: false }])
    }
  }

  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMaterialer = skjema.materialer.reduce((s, m) => s + (parseFloat(m.pris)||0), 0)
  const materialerMedPaaslag = skjema.materialer.reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.pris)||0) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent)||0) / 100
  const totalSum = totalArbeid + totalMaterialer + paaslag

  return (
    <div className="skjema-layout">
      <div className="skjema-kolonne">

        {/* FIRMA */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Din bedrift</h2>
          <div className="felt-gruppe">
            <label>Firmanavn</label>
            <input type="text" placeholder="Ola Nordmann AS" value={skjema.firmanavn} onChange={e => oppdater('firmanavn', e.target.value)} />
          </div>
          <div className="felt-rad">
            <div className="felt-gruppe">
              <label>Telefon</label>
              <input type="tel" placeholder="900 00 000" value={skjema.firmaTelefon} onChange={e => oppdater('firmaTelefon', e.target.value)} />
            </div>
            <div className="felt-gruppe">
              <label>E-post</label>
              <input type="email" placeholder="post@firma.no" value={skjema.firmaEpost} onChange={e => oppdater('firmaEpost', e.target.value)} />
            </div>
          </div>
          <div className="felt-gruppe">
            <label>Adresse</label>
            <input type="text" placeholder="Gateveien 1, 0001 Oslo" value={skjema.firmaAdresse} onChange={e => oppdater('firmaAdresse', e.target.value)} />
          </div>
          <div className="felt-rad">
            <div className="felt-gruppe">
              <label>Org.nr</label>
              <input type="text" placeholder="123456789" maxLength={9} value={skjema.firmaOrgnr||''} onChange={e => oppdater('firmaOrgnr', e.target.value.replace(/\D/g, '').slice(0,9))} />
            </div>
            <div className="felt-gruppe">
              <label>Nettside</label>
              <input type="text" placeholder="www.firma.no" value={skjema.firmaNettside||''} onFocus={e => { if(!skjema.firmaNettside) oppdater('firmaNettside', 'www.') }} onChange={e => oppdater('firmaNettside', e.target.value)} />
            </div>
          </div>
          <div className="felt-gruppe">
            <label>Logo på PDF {!isPro && <span className="pro-badge">PRO</span>}</label>
            {isPro ? (
              <div className="logo-opplasting">
                {skjema.logoUrl ? (
                  <div className="logo-preview">
                    <img src={skjema.logoUrl} alt="Logo" className="logo-img" />
                    <button className="btn-fjern" onClick={() => oppdater('logoUrl', '')}>×</button>
                  </div>
                ) : (
                  <label className="logo-velg-knapp">
                    Velg logofil (PNG/JPG)
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" style={{display:'none'}} onChange={e => {
                      const fil = e.target.files[0]; if (!fil) return
                      const reader = new FileReader()
                      reader.onload = ev => oppdater('logoUrl', ev.target.result)
                      reader.readAsDataURL(fil)
                    }} />
                  </label>
                )}
              </div>
            ) : (
              <div className="pro-locked">🔒 Tilgjengelig på Pro-plan (99 kr/mnd)</div>
            )}
          </div>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px'}}>
            <p className="lagret-info">✓ Lagres automatisk</p>
            <button className="btn-lenke roed" onClick={() => {
              if (confirm('Nullstille lagret firmainformasjon?')) {
                localStorage.removeItem('firma'); localStorage.removeItem('logoUrl')
                ;['firmanavn','firmaTelefon','firmaEpost','firmaAdresse','firmaOrgnr','firmaNettside','logoUrl'].forEach(f => oppdater(f, ''))
              }
            }}>Nullstill</button>
          </div>
        </section>

        {/* KUNDE */}
        <section className="skjema-seksjon">
          <div className="seksjon-tittel-rad">
            <h2 className="seksjon-tittel">Kunde</h2>
            <button className="btn-lenke roed" onClick={() => {
              ;['kundenavn','kundeAdresse','kundeEpost','beskrivelse'].forEach(f => oppdater(f, ''))
              oppdater('materialer', []); oppdater('arbeidere', [{id:Date.now(), timer:'', timepris: (() => { try { return localStorage.getItem('timepris')||'' } catch { return '' } })()}])
            }}>Nullstill kunde/jobb</button>
          </div>
          <div className="felt-gruppe">
            <label>Kundenavn <span className="paakrevd">*</span></label>
            <input type="text" placeholder="Kari Nordmann" value={skjema.kundenavn} onChange={e => oppdater('kundenavn', e.target.value)} />
          </div>
          <div className="felt-gruppe">
            <label>Adresse</label>
            <input type="text" placeholder="Hjemveien 5, 0002 Oslo" value={skjema.kundeAdresse} onChange={e => oppdater('kundeAdresse', e.target.value)} />
          </div>
          <div className="felt-gruppe">
            <label>E-post</label>
            <input type="email" placeholder="kari@epost.no" value={skjema.kundeEpost} onChange={e => oppdater('kundeEpost', e.target.value)} />
          </div>
        </section>

        {/* JOBB */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Jobben</h2>
          <div className="felt-gruppe">
            <label>Beskrivelse <span className="paakrevd">*</span></label>
            <textarea rows={5} placeholder="Beskriv hva som skal gjøres, omfang, adresse, spesielle forhold osv." value={skjema.beskrivelse} onChange={e => oppdater('beskrivelse', e.target.value)} />
          </div>
        </section>

      </div>

      <div className="skjema-kolonne">

        {/* ARBEID */}
        <section className="skjema-seksjon">
          <div className="seksjon-tittel-rad">
            <h2 className="seksjon-tittel">Arbeid</h2>
            <button className="btn-lenke" onClick={leggTilArbeider}>+ Legg til rad</button>
          </div>
          <div className="arbeider-header">
            <span>Timer</span><span>Kr/time</span><span></span><span></span>
          </div>
          {skjema.arbeidere.map((a, i) => (
            <div key={a.id} className="arbeider-rad-enkel">
              <input type="number" min="0" step="0.5" placeholder="eks. 8" value={a.timer} onChange={e => oppdaterArbeider(i, 'timer', e.target.value)} />
              <input type="number" min="0" step="50" placeholder="eks. 650" value={a.timepris} onChange={e => oppdaterArbeider(i, 'timepris', e.target.value)} />
              <span className="arbeider-sum">{a.timer && a.timepris ? formaterKr((parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0)) : ''}</span>
              {skjema.arbeidere.length > 1 && <button className="btn-fjern" onClick={() => oppdater('arbeidere', skjema.arbeidere.filter(x => x.id !== a.id))}>×</button>}
            </div>
          ))}
          {totalArbeid > 0 && <p className="kalkyle-linje">Totalt: <strong>{formaterKr(totalArbeid)}</strong></p>}
        </section>

        {/* MATERIALER */}
        <section className="skjema-seksjon">
          <h2 className="seksjon-tittel">Materialer & utgifter</h2>

          {/* KOLONNEOVERSKRIFTER */}
          <div className="mat-header">
            <span>Beskrivelse</span>
            <span>Ant.</span>
            <span>Kr/enhet</span>
            <span>Sum</span>
            <span title="Inkluder i påslag">Påslag</span>
            <span></span>
          </div>

          {/* TRANSPORT — alltid synlig */}
          {!harTransport ? (
            <div className="mat-rad mat-rad-rask">
              <span className="mat-fast-navn">Transport</span>
              <input type="number" min="0" step="1" placeholder="0" className="mat-ant"
                onChange={e => { if(e.target.value) leggTilRask('transport'); setTimeout(()=>oppdaterRask('transport','ant',e.target.value),50) }} />
              <span className="mat-fast-enhet">km</span>
              <input type="number" min="0" placeholder="kr/km" className="mat-pris"
                onChange={e => oppdaterRask('transport','sats',e.target.value)} />
              <span className="mat-sum"></span>
              <input type="checkbox" className="mat-paaslag-cb" defaultChecked={false} disabled title="Transport inkluderes ikke i påslag" />
              <span></span>
            </div>
          ) : skjema.materialer.filter(m => m._type === 'transport').map(m => (
            <div key={m.id} className="mat-rad">
              <span className="mat-fast-navn">Transport</span>
              <input type="number" min="0" step="1" placeholder="0" className="mat-ant" value={m.ant||''}
                onChange={e => oppdaterRask('transport','ant',e.target.value)} />
              <span className="mat-fast-enhet">km</span>
              <input type="number" min="0" placeholder="kr/km" className="mat-pris" value={m.sats||''}
                onChange={e => oppdaterRask('transport','sats',e.target.value)} />
              <span className="mat-sum">{m.pris > 0 ? formaterKr(m.pris) : ''}</span>
              <input type="checkbox" className="mat-paaslag-cb" checked={m.hasPaaslag}
                onChange={e => oppdater('materialer', skjema.materialer.map(x => x.id===m.id ? {...x, hasPaaslag: e.target.checked} : x))} />
              <button className="btn-fjern" onClick={() => fjernMaterial(m.id)}>×</button>
            </div>
          ))}

          {/* BOM — alltid synlig */}
          {!harBom ? (
            <div className="mat-rad mat-rad-rask">
              <span className="mat-fast-navn">Bompenger</span>
              <span className="mat-ant"></span>
              <span className="mat-fast-enhet">kr</span>
              <input type="number" min="0" placeholder="beløp" className="mat-pris"
                onChange={e => { if(e.target.value) { leggTilRask('bom'); setTimeout(()=>oppdaterRask('bom','sats',e.target.value),50) } }} />
              <span className="mat-sum"></span>
              <input type="checkbox" className="mat-paaslag-cb" defaultChecked={false} disabled />
              <span></span>
            </div>
          ) : skjema.materialer.filter(m => m._type === 'bom').map(m => (
            <div key={m.id} className="mat-rad">
              <span className="mat-fast-navn">Bompenger</span>
              <span className="mat-ant"></span>
              <span className="mat-fast-enhet">kr</span>
              <input type="number" min="0" placeholder="beløp" className="mat-pris" value={m.sats||''}
                onChange={e => { const v = parseFloat(e.target.value)||0; oppdater('materialer', skjema.materialer.map(x => x.id===m.id ? {...x, sats:e.target.value, pris:v} : x)) }} />
              <span className="mat-sum">{m.pris > 0 ? formaterKr(m.pris) : ''}</span>
              <input type="checkbox" className="mat-paaslag-cb" checked={m.hasPaaslag}
                onChange={e => oppdater('materialer', skjema.materialer.map(x => x.id===m.id ? {...x, hasPaaslag:e.target.checked} : x))} />
              <button className="btn-fjern" onClick={() => fjernMaterial(m.id)}>×</button>
            </div>
          ))}

          {/* ØVRIGE MATERIALER */}
          {skjema.materialer.filter(m => !m._type).map(m => (
            <div key={m.id} className="mat-rad">
              <span className="mat-fast-navn">{m.navn}</span>
              <span className="mat-ant"></span>
              <span></span>
              <input type="number" min="0" className="mat-pris" value={m.pris}
                onChange={e => oppdaterMaterialPris(m.id, e.target.value)} />
              <span className="mat-sum">{formaterKr(m.pris)}</span>
              <input type="checkbox" className="mat-paaslag-cb" checked={m.hasPaaslag}
                onChange={e => oppdater('materialer', skjema.materialer.map(x => x.id===m.id ? {...x, hasPaaslag:e.target.checked} : x))} />
              <button className="btn-fjern" onClick={() => fjernMaterial(m.id)}>×</button>
            </div>
          ))}

          {/* NY LINJE */}
          <div className="mat-rad mat-ny-rad">
            <input type="text" placeholder="Beskrivelse" value={nyNavn} onChange={e => setNyNavn(e.target.value)}
              className="mat-ny-navn" onKeyDown={e => e.key==='Enter' && leggTilMaterial()} />
            <input type="number" min="1" step="1" placeholder="1" value={nyAnt} onChange={e => setNyAnt(e.target.value)} className="mat-ant" />
            <input type="number" min="0" placeholder="kr/enhet" value={nyPris} onChange={e => setNyPris(e.target.value)}
              className="mat-pris" onKeyDown={e => e.key==='Enter' && leggTilMaterial()} />
            <span className="mat-sum">{nyPris && nyAnt ? formaterKr((parseFloat(nyPris)||0)*(parseFloat(nyAnt)||1)) : ''}</span>
            <input type="checkbox" className="mat-paaslag-cb" checked={nyHasPaaslag} onChange={e => setNyHasPaaslag(e.target.checked)} title="Inkluder i påslag" />
            <button className="btn btn-secondary btn-sm" onClick={leggTilMaterial}>Legg til</button>
          </div>
        </section>

        {/* PÅSLAG */}
        <section className="skjema-seksjon">
          <div className="seksjon-tittel-rad">
            <h2 className="seksjon-tittel">Påslag materialer</h2>
            <span className="paaslaginfo">Kun avhukede linjer</span>
          </div>
          <div className="paaslag-rad">
            <input type="number" min="0" max="200" step="5" placeholder="0" value={skjema.paaslagProsent}
              onChange={e => oppdater('paaslagProsent', e.target.value)} className="paaslag-input" />
            <span className="paaslag-symbol">%</span>
            {parseFloat(skjema.paaslagProsent) > 0 && materialerMedPaaslag > 0 && (
              <span className="paaslag-resultat">= +{formaterKr(paaslag)}</span>
            )}
          </div>
        </section>

        {/* SUM */}
        {totalSum > 0 && (
          <section className="skjema-seksjon sum-seksjon">
            <h2 className="seksjon-tittel">Estimert total</h2>
            <div className="sum-tabell">
              {totalArbeid > 0 && <div className="sum-linje"><span>Arbeid</span><span>{formaterKr(totalArbeid)}</span></div>}
              {totalMaterialer > 0 && <div className="sum-linje"><span>Materialer</span><span>{formaterKr(totalMaterialer)}</span></div>}
              {paaslag > 0 && <div className="sum-linje"><span>Påslag {skjema.paaslagProsent}%</span><span>{formaterKr(paaslag)}</span></div>}
              <div className="sum-linje sum-total"><span>Total eks. mva</span><span>{formaterKr(totalSum)}</span></div>
              <div className="sum-linje sum-mva"><span>Inkl. 25% mva</span><span>{formaterKr(totalSum * 1.25)}</span></div>
            </div>
          </section>
        )}

        {feil && <p className="feilmelding">{feil}</p>}
        <button className="btn btn-primary btn-stor" onClick={onGenerer} disabled={laster}>
          {laster ? 'Genererer tilbud...' : 'Generer profesjonelt tilbud'}
        </button>

      </div>
    </div>
  )
}

function formaterKr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall)
}
