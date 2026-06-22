import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function SendteHistorikk({ onTilbake }) {
  const [historikk, setHistorikk] = useState([])
  const [laster, setLaster]       = useState(true)
  const [feil, setFeil]           = useState('')
  const [sletterId, setSletterId] = useState(null) // id på raden som slettes nå
  const [slettKandidat, setSlettKandidat] = useState(null) // raden bekreftelses-modalen spør om

  useEffect(() => {
    async function hent() {
      try {
        const { data, error } = await supabase
          .from('sendte_tilbud')
          .select('*')
          .order('sendt_dato', { ascending: false })
          .limit(100)
        if (error) throw error
        setHistorikk(data || [])
      } catch (e) {
        console.error('Historikk-feil:', e)
        setFeil('Kunne ikke hente historikk. Prøv igjen.')
      } finally {
        setLaster(false)
      }
    }
    hent()
  }, [])

  function formaterDato(isoStreng) {
    return new Date(isoStreng).toLocaleString('no-NO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  }

  // Egen popup-modal (samme .modal-overlay/.modal-boks-stil som "Send tilbud")
  // i stedet for nettleserens window.confirm() — slipper "På <domene> står
  // det"-prefikset, og gir tydelig spørsmålstekst med tilbudsnummer.
  async function bekreftSlett() {
    const rad = slettKandidat
    if (!rad) return
    setSletterId(rad.id)
    try {
      const { error } = await supabase.from('sendte_tilbud').delete().eq('id', rad.id)
      if (error) throw error
      setHistorikk(prev => prev.filter(r => r.id !== rad.id))
      setSlettKandidat(null)
    } catch (e) {
      console.error('Sletting feilet:', e)
      alert('Kunne ikke slette. Prøv igjen.')
    } finally {
      setSletterId(null)
    }
  }

  return (
    <div className="historikk-wrapper">
      <div className="historikk-header">
        <h2>Sendte tilbud</h2>
        <button className="btn btn-secondary" onClick={onTilbake}>← Tilbake</button>
      </div>

      {laster && <p className="historikk-laster">Henter historikk…</p>}
      {feil   && <p className="historikk-feil">{feil}</p>}

      {!laster && !feil && historikk.length === 0 && (
        <p className="historikk-tom">Ingen tilbud sendt ennå.</p>
      )}

      {!laster && historikk.length > 0 && (
        <div className="historikk-tabell-wrapper">
          <table className="historikk-tabell">
            <thead>
              <tr>
                <th>Dato</th>
                <th>Tilbudsnr.</th>
                <th>Kunde</th>
                <th>E-post</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {historikk.map(rad => (
                <tr key={rad.id}>
                  <td className="historikk-dato">{formaterDato(rad.sendt_dato)}</td>
                  <td className="historikk-nr">{rad.tilbudsnummer || '—'}</td>
                  <td>{rad.kundenavn || '—'}</td>
                  <td>
                    <a href={`mailto:${rad.kunde_epost}`} className="historikk-epost">
                      {rad.kunde_epost}
                    </a>
                  </td>
                  <td className="historikk-slett-celle">
                    <button
                      className="btn-fjern"
                      title="Slett fra historikk"
                      disabled={sletterId === rad.id}
                      onClick={() => setSlettKandidat(rad)}
                    >{sletterId === rad.id ? '…' : '×'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {slettKandidat && (
        <div className="modal-overlay" onClick={() => { if (sletterId !== slettKandidat.id) setSlettKandidat(null) }}>
          <div className="modal-boks send-modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-tittel">Slette tilbud?</h3>
            <p className="modal-bekreft-tekst">
              Sikker på at du vil slette tilbud <strong>{slettKandidat.tilbudsnummer || '—'}</strong>
              {slettKandidat.kundenavn ? <> ({slettKandidat.kundenavn})</> : null} fra historikken?
              Dette kan ikke angres.
            </p>
            <div className="modal-knapper">
              <button
                className="btn btn-fare"
                onClick={bekreftSlett}
                disabled={sletterId === slettKandidat.id}
              >
                {sletterId === slettKandidat.id ? 'Sletter …' : 'Slett'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSlettKandidat(null)}
                disabled={sletterId === slettKandidat.id}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
