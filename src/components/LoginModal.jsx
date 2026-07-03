import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function LoginModal({ onLukk, initialModus = 'logginn' }) {
  const { loggInn, registrer } = useAuth()
  const [modus, setModus] = useState(initialModus) // 'logginn' | 'registrer' | 'glemt'
  const [epost, setEpost] = useState('')
  const [passord, setPassord] = useState('')
  const [feil, setFeil] = useState('')
  const [laster, setLaster] = useState(false)
  const [bekreftelse, setBekreftelse] = useState(false)
  const [visOpprettHint, setVisOpprettHint] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setFeil('')
    setVisOpprettHint(false)
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
        'Invalid login credentials': 'Feil e-post eller passord — eller du har ikke opprettet konto enda.',
        'Email not confirmed': 'Bekreft e-posten din før du logger inn.',
        'User already registered': 'Denne e-posten er allerede registrert.',
        'Password should be at least 6 characters': 'Passordet må være minst 6 tegn.',
      }
      setFeil(meldinger[err.message] || err.message)
      // Nytt forsøk på et ikke-eksisterende passord ER det vanligste tegnet på at
      // brukeren aldri opprettet konto (Supabase gir samme feil for begge tilfeller
      // av sikkerhetsgrunner). Vis en direkte vei til "Opprett konto" her.
      if (err.message === 'Invalid login credentials' && modus === 'logginn') {
        setVisOpprettHint(true)
      }
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
                {modus === 'registrer' ? 'Velg et passord for Prismal' : 'Passord'}
                <input
                  type="password"
                  value={passord}
                  onChange={e => setPassord(e.target.value)}
                  placeholder={modus === 'registrer' ? 'Velg et passord (minst 6 tegn)' : ''}
                  required
                />
                {modus === 'registrer' && (
                  <p style={{fontSize:'12px',color:'#94a3b8',marginTop:'5px',marginBottom:0}}>
                    Dette er et nytt passord du velger selv — ikke passordet til e-posten din.
                  </p>
                )}
              </label>
            )}

            {modus === 'logginn' && (
              <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '4px' }}>
                <button
                  type="button"
                  className="modal-lenke"
                  onClick={() => { setModus('glemt'); setFeil(''); setVisOpprettHint(false) }}
                >
                  Glemt passord?
                </button>
              </div>
            )}

            {feil && <p className="modal-feil">{feil}</p>}

            {visOpprettHint && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { setModus('registrer'); setFeil(''); setVisOpprettHint(false) }}
              >
                Opprett konto med denne e-posten →
              </button>
            )}

            <button className="btn btn-primary" type="submit" disabled={laster}>
              {laster ? 'Venter...' :
               modus === 'logginn'   ? 'Logg inn' :
               modus === 'registrer' ? 'Opprett konto' :
                                       'Send tilbakestillingslenke'}
            </button>

            <p className="modal-bytt">
              {modus === 'logginn' ? (
                <>Ny bruker? <button type="button" onClick={() => { setModus('registrer'); setFeil(''); setVisOpprettHint(false) }}>Opprett konto</button></>
              ) : modus === 'registrer' ? (
                <>Har konto? <button type="button" onClick={() => { setModus('logginn'); setFeil(''); setVisOpprettHint(false) }}>Logg inn</button></>
              ) : (
                <><button type="button" onClick={() => { setModus('logginn'); setFeil(''); setVisOpprettHint(false) }}>← Tilbake til innlogging</button></>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
