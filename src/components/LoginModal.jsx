import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function LoginModal({ onLukk }) {
  const { loggInn, registrer } = useAuth()
  const [modus, setModus] = useState('logginn') // 'logginn' | 'registrer' | 'glemt'
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
      } else if (modus === 'registrer') {
        await registrer(epost, passord)
        setBekreftelse(true)
      } else if (modus === 'glemt') {
        const { error } = await supabase.auth.resetPasswordForEmail(epost, {
          redirectTo: `${window.location.origin}/`,
        })
        if (error) throw error
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

  const titler = { logginn: 'Logg inn', registrer: 'Opprett konto', glemt: 'Glemt passord' }

  return (
    <div className="modal-bakgrunn" onClick={onLukk}>
      <div className="modal-boks" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{titler[modus]}</h2>
          <button className="modal-lukk" onClick={onLukk}>✕</button>
        </div>

        {bekreftelse ? (
          <div className="modal-bekreftelse">
            {modus === 'glemt' ? (
              <p>✅ Sjekk e-posten din — vi har sendt en lenke for å tilbakestille passordet.</p>
            ) : (
              <p>✅ Sjekk e-posten din og klikk bekreftelseslenken for å aktivere kontoen.</p>
            )}
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

            {modus !== 'glemt' && (
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
            )}

            {modus === 'logginn' && (
              <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '4px' }}>
                <button
                  type="button"
                  className="modal-lenke"
                  onClick={() => { setModus('glemt'); setFeil('') }}
                >
                  Glemt passord?
                </button>
              </div>
            )}

            {feil && <p className="modal-feil">{feil}</p>}

            <button className="btn btn-primary" type="submit" disabled={laster}>
              {laster ? 'Venter...' :
               modus === 'logginn'   ? 'Logg inn' :
               modus === 'registrer' ? 'Opprett konto' :
                                       'Send tilbakestillingslenke'}
            </button>

            <p className="modal-bytt">
              {modus === 'logginn' ? (
                <>Ny bruker? <button type="button" onClick={() => { setModus('registrer'); setFeil('') }}>Opprett konto</button></>
              ) : modus === 'registrer' ? (
                <>Har konto? <button type="button" onClick={() => { setModus('logginn'); setFeil('') }}>Logg inn</button></>
              ) : (
                <><button type="button" onClick={() => { setModus('logginn'); setFeil('') }}>← Tilbake til innlogging</button></>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
