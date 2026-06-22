import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function SendteHistorikk({ onTilbake }) {
  const [historikk, setHistorikk] = useState([])
  const [laster, setLaster]       = useState(true)
  const [feil, setFeil]           = useState('')
  const [sletterId, setSletterId] = useState(null) // id på raden som slettes nå
  const [bekreftId, setBekreftId] = useState(null) // id på raden som er "armert" for bekreftelse

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

  // To-trinns bekreftelse uten nettleserens egen confirm()-dialog (som viser
  // "På <domene> står det" — ulik/uelegant stil på tvers av nettlesere). Samme
  // mønster som "Slett lagret kunde" i KundeInfo.jsx: første klikk armerer i
  // 4 sek, andre klikk i det vinduet utfører selve slettingen.
  async function slettRad(rad) {
    if (bekreftId !== rad.id) {
      setBekreftId(rad.id)
      setTimeout(() => setBekreftId(prev => prev === rad.id ? null : prev), 4000)
      return
    }
    setBekreftId(null)
    setSletterId(rad.id)
    try {
      const { error } = await supabase.from('sendte_tilbud').delete().eq('id', rad.id)
      if (error) throw error
      setHistorikk(prev => prev.filter(r => r.id !== rad.id))
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
                      className={`btn-fjern${bekreftId === rad.id ? ' bekreft' : ''}`}
                      title={bekreftId === rad.id ? 'Klikk igjen for å bekrefte sletting' : 'Slett fra historikk'}
                      disabled={sletterId === rad.id}
                      onClick={() => slettRad(rad)}
                    >{sletterId === rad.id ? '…' : bekreftId === rad.id ? '✓' : '×'}</button>
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
