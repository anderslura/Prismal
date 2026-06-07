const TEMAER = [
  { id: 'standard',   navn: 'Standard',       header: '#1e50c8', sub: '#ffffff' },
  { id: 'mork',       navn: 'Mørk',           header: '#111827', sub: '#ffffff' },
  { id: 'gronn',      navn: 'Natur',          header: '#166534', sub: '#ffffff' },
  { id: 'rosa',       navn: '🎀 Rosa sløyfe', header: '#be185d', sub: '#ffffff' },
  { id: 'jul',        navn: '🎄 Jul',         header: '#991b1b', sub: '#ffffff' },
  { id: 'paske',      navn: '🐣 Påske',       header: '#854d0e', sub: '#ffffff' },
  { id: 'bunad',      navn: '🇳🇴 17. mai',    header: '#1d4ed8', sub: '#ffffff' },
  { id: 'pride',      navn: '🏳️‍🌈 Pride',      header: 'linear-gradient(135deg,#e40303 0%,#ff8c00 20%,#ffed00 40%,#008026 60%,#004dff 80%,#750787 100%)', sub: '#ffffff' },
]

const SPESIALDATOER = [
  { dato: '01.10–31.10', tema: 'rosa',   tittel: 'Brystkreft-måneden',    beskrivelse: 'Oktober — rosa sløyfe. Vis støtte.' },
  { dato: '17.05',       tema: 'bunad',  tittel: 'Nasjonaldagen',          beskrivelse: 'Norges grunnlovsdag.' },
  { dato: '24.12–26.12', tema: 'jul',    tittel: 'Julehøytiden',           beskrivelse: 'Rød og festlig stil.' },
  { dato: '22.04',       tema: 'gronn',  tittel: 'Jordens dag',            beskrivelse: 'April — vis miljøengasjement.' },
  { dato: 'Juni',          tema: 'pride',  tittel: 'Pride-måneden',           beskrivelse: 'Juni — vis støtte og inkludering.' },
]

export default function PdfTemavelger({ valgtTema, onVelg }) {
  return (
    <div className="tema-velger">
      <div className="tema-header-rad">
        <h2 className="seksjon-tittel">PDF-tema</h2>
        <span className="tema-hint">Velg bakgrunn på tilbudet</span>
      </div>

      {/* Temaknapper */}
      <div className="tema-grid">
        {TEMAER.map(t => (
          <button
            key={t.id}
            onClick={() => onVelg(t.id)}
            className={`tema-knapp ${valgtTema === t.id ? 'tema-knapp-aktiv' : ''}`}
            title={t.navn}
          >
            <span className="tema-fargeprøve" style={{background: t.header}}/>
            <span className="tema-navn">{t.navn}</span>
          </button>
        ))}
      </div>

      {/* Spesialdatoer */}
      <div className="spesialdatoer">
        <p className="tema-hint" style={{marginBottom:8}}>💡 Spesialdatoer å merke seg</p>
        {SPESIALDATOER.map(s => (
          <div
            key={s.tema}
            className="spesialdato-rad"
            onClick={() => onVelg(s.tema)}
            title="Klikk for å velge dette temaet"
          >
            <span className="spesialdato-dato">{s.dato}</span>
            <div>
              <span className="spesialdato-tittel">{s.tittel}</span>
              <span className="spesialdato-sub"> — {s.beskrivelse}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function hentTemaFarger(temaId) {
  return TEMAER.find(t => t.id === temaId) || TEMAER[0]
}
