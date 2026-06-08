import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function LoginModal({ onLukk }) {
  const { loggInn, registrer } = useAuth()
  const [modus, setModus] = useState('logginn') // 'logginn' | 'registrer'
  const [epost, setEpost] = useState('')
  const [passord, setPassord] = useState('')
  const [feil, setFeil] = useState('')
  const [laster, setLaster] = useState(false)
  const [bekreftelse, setBekreftelse] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setFeil('')
    setLaster(true)
    try {
      if (modus === 'logginn') {
        await loggInn(epost, passord)
        onLukk?.()
      } else {
        await registrer(epost, passord)
        setBekreftelse(true)
      }
    } catch (err) {
      const meldinger = {
        'Invalid login credentials': 'Feil e-post eller passord.',
        'Email not confirmed': 'Bekreft e-posten din før du logger inn.',
        'User already registered': 'Denne e-posten er allerede registrert.',
        'Password should be at least 6 characters': 'Passordet må være minst 6 tegn.',
      }
      setFeil(meldinger[err.message] || err.message)
    } finally {
      setLaster(false)
    }
  }

  return (
    <div className="modal-bakgrunn" onClick={onLukk}>
      <div className="modal-boks" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{modus === 'logginn' ? 'Logg inn' : 'Opprett konto'}</h2>
          <button className="modal-lukk" onClick={onLukk}>✕</button>
        </div>

        {bekreftelse ? (
          <div className="modal-bekreftelse">
            <p>✅ Sjekk e-posten din og klikk bekreftelseslenken for å aktivere kontoen.</p>
            <button className="btn btn-primary" onClick={() => { setModus('logginn'); setBekreftelse(false) }}>
              Gå til innlogging
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <label>
              E-post
              <input
                type="email"
                value={epost}
                onChange={e => setEpost(e.target.value)}
                placeholder="din@epost.no"
                required
                autoFocus
              />
            </label>
            <label>
              Passord
              <input
                type="password"
                value={passord}
                onChange={e => setPassord(e.target.value)}
                placeholder={modus === 'registrer' ? 'Minst 6 tegn' : ''}
                required
              />
            </label>

            {feil && <p className="modal-feil">{feil}</p>}

            <button className="btn btn-primary" type="submit" disabled={laster}>
              {laster ? 'Venter...' : modus === 'logginn' ? 'Logg inn' : 'Opprett konto'}
            </button>

            <p className="modal-bytt">
              {modus === 'logginn' ? (
                <>Ny bruker? <button type="button" onClick={() => { setModus('registrer'); setFeil('') }}>Opprett konto</button></>
              ) : (
                <>Har konto? <button type="button" onClick={() => { setModus('logginn'); setFeil('') }}>Logg inn</button></>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
