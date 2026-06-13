import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function SendteHistorikk({ onTilbake }) {
  const [historikk, setHistorikk] = useState([])
  const [laster, setLaster]       = useState(true)
  const [feil, setFeil]           = useState('')

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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
