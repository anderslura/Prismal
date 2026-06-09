// Nøytrale/basis-temaer — øverste rad
const BASE_TEMAER = [
  { id: 'standard', navn: 'Standard',    beskrivelse: 'Klassisk blå — alltid trygt valg',          header: '#1e50c8', sub: '#ffffff' },
  { id: 'mork',     navn: 'Mørk',        beskrivelse: 'Mørkt og eksklusivt uttrykk',                header: '#111827', sub: '#ffffff' },
  { id: 'graa',     navn: 'Grå',         beskrivelse: 'Nøytralt og profesjonelt',                   header: '#64748b', sub: '#ffffff' },
  { id: 'hvit',     navn: 'Hvit',        beskrivelse: 'Minimalistisk og rent — lyst uttrykk',       header: '#f1f5f9', sub: '#1e293b' },
]

// Sesong-/tematemaer — sortert i kalenderrekkefølge
const SESONG_TEMAER = [
  { id: 'paske',    navn: 'Påske',       beskrivelse: 'Varm oransje — påskeuker (mars/april)',      header: '#d97706', sub: '#ffffff' },
  { id: 'pride',    navn: 'Pride',       beskrivelse: 'Regnbuegradient — pride-måneden (juni)',     header: 'linear-gradient(135deg,#e40303 0%,#ff8c00 20%,#ffed00 40%,#008026 60%,#004dff 80%,#750787 100%)', sub: '#ffffff' },
  { id: 'rosa',     navn: 'Rosa sløyfe', beskrivelse: 'Rosa sløyfe — brystkreft-måneden (oktober)', header: '#be185d', sub: '#ffffff' },
  { id: 'jul',      navn: 'Jul',         beskrivelse: 'Rød og festlig — desember',                  header: '#991b1b', sub: '#ffffff' },
]

const ALLE_TEMAER = [...BASE_TEMAER, ...SESONG_TEMAER]

const SPESIALDATOER = [
  { dato: 'Juni',      tema: 'pride', tittel: 'Pride-måneden',      beskrivelse: 'Vis støtte og inkludering.' },
  { dato: 'Oktober',   tema: 'rosa',  tittel: 'Brystkreft-måneden', beskrivelse: 'Rosa sløyfe — vis støtte.' },
  { dato: 'Desember',  tema: 'jul',   tittel: 'Julehøytiden',       beskrivelse: 'Rød og festlig stil.' },
]

function TemaRad({ temaer, valgtTema, onVelg }) {
  return (
    <div className="tema-rad">
      {temaer.map(t => (
        <button
          key={t.id}
          onClick={() => onVelg(t.id)}
          className={`tema-knapp ${valgtTema === t.id ? 'tema-knapp-aktiv' : ''}`}
          title={t.beskrivelse}
        >
          <span
            className={`tema-fargeprøve${t.id === 'hvit' ? ' tema-fargeprøve-lys' : ''}`}
            style={{ background: t.header }}
          />
          <span className="tema-navn">{t.navn}</span>
        </button>
      ))}
    </div>
  )
}

export default function PdfTemavelger({ valgtTema, onVelg }) {
  return (
    <div className="tema-velger">
      <div className="tema-header-rad">
        <h2 className="seksjon-tittel">PDF-tema</h2>
        <span className="tema-hint">Velg bakgrunn på tilbudet</span>
      </div>

      <TemaRad temaer={BASE_TEMAER}   valgtTema={valgtTema} onVelg={onVelg} />
      <TemaRad temaer={SESONG_TEMAER} valgtTema={valgtTema} onVelg={onVelg} />

      {/* Sesongbaserte temaer */}
      <div className="spesialdatoer">
        <p className="spesialdato-overskrift">Sesongbaserte temaer</p>
        {SPESIALDATOER.map(s => (
          <div
            key={s.tema}
            className="spesialdato-rad"
            onClick={() => onVelg(s.tema)}
            title="Klikk for å velge"
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
  return ALLE_TEMAER.find(t => t.id === temaId) || ALLE_TEMAER[0]
}
