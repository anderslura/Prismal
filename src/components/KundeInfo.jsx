import { useState, useEffect, useRef } from 'react'
import { hentKundePaMobil, sokKunderPaNavn, lagreKunde } from '../api/kundeService.js'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * KundeInfo – kundeseksjon med mob-oppslag, navn-søk og lagring til Supabase.
 * Props:
 *   kunde      – { kundenavn, kundeAdresse, kundeEpost, kundeMobil }
 *   onChange   – (felt, verdi) callback (samme som TilbudSkjema.oppdater)
 *   onNullstill – tøm alle kundefelt + jobb
 */
export default function KundeInfo({ kunde, onChange, onNullstill }) {
  const { bruker } = useAuth()
  const innlogget = !!bruker

  const [mobilInput, setMobilInput] = useState(kunde.kundeMobil || '')
  const [navnInput, setNavnInput] = useState(kunde.kundenavn || '')
  const [navnForslag, setNavnForslag] = useState([])
  const [status, setStatus] = useState('') // '' | 'laster' | 'ok' | 'feil'
  const navnTimer = useRef(null)

  // Sync ved nullstill fra parent
  useEffect(() => {
    setMobilInput(kunde.kundeMobil || '')
    setNavnInput(kunde.kundenavn || '')
  }, [kunde.kundeMobil, kunde.kundenavn])

  // Mobiloppslag på blur / Enter
  async function slaSoMobil() {
    if (!innlogget || !mobilInput.trim()) return
    try {
      const k = await hentKundePaMobil(mobilInput)
      if (k) fyllInnKunde(k)
    } catch (e) {
      console.error('Mobiloppslag feilet:', e)
    }
  }

  function fyllInnKunde(k) {
    onChange('kundeMobil', k.mobil)
    onChange('kundenavn', k.navn || '')
    onChange('kundeAdresse', k.adresse || '')
    onChange('kundeEpost', k.epost || '')
    setMobilInput(k.mobil)
    setNavnInput(k.navn || '')
  }

  // Live navn-søk
  function onNavnEndring(verdi) {
    setNavnInput(verdi)
    onChange('kundenavn', verdi)
    if (!innlogget || verdi.length < 2) { setNavnForslag([]); return }
    clearTimeout(navnTimer.current)
    navnTimer.current = setTimeout(async () => {
      try { setNavnForslag(await sokKunderPaNavn(verdi)) } catch {}
    }, 250)
  }

  function velgDropdown(k) {
    fyllInnKunde(k)
    setNavnForslag([])
  }

  // Lagre til Supabase
  async function lagreKlikk() {
    if (!innlogget || !mobilInput.trim() || !navnInput.trim()) return
    setStatus('laster')
    try {
      await lagreKunde({
        mobil: mobilInput,
        navn: navnInput,
        adresse: kunde.kundeAdresse,
        epost: kunde.kundeEpost,
      })
      setStatus('ok')
      setTimeout(() => setStatus(''), 2500)
    } catch (e) {
      console.error('Lagring feilet:', e)
      setStatus('feil')
      setTimeout(() => setStatus(''), 3000)
    }
  }

  return (
    <section className="skjema-seksjon">
      <div className="seksjon-tittel-rad">
        <h2 className="seksjon-tittel">Kunde</h2>
        <button className="btn-lenke roed" onClick={onNullstill}>
          Nullstill kunde/jobb
        </button>
      </div>

      {/* Mobil – kun for innloggede */}
      {innlogget && (
        <div className="felt-gruppe">
          <label>Mobilnummer</label>
          <div className="kunde-mob-rad">
            <input
              type="tel"
              placeholder="98765432"
              value={mobilInput}
              onChange={e => { setMobilInput(e.target.value); onChange('kundeMobil', e.target.value) }}
              onBlur={slaSoMobil}
              onKeyDown={e => e.key === 'Enter' && slaSoMobil()}
              className="kunde-mob-input"
            />
          </div>
          <p className="felt-hint">Skriv mob → trykk Enter eller Tab for å hente lagret kunde</p>
        </div>
      )}

      {/* Kundenavn med dropdown */}
      <div className="felt-gruppe kunde-navn-wrapper">
        <label>Kundenavn <span className="paakrevd">*</span></label>
        <input
          type="text"
          placeholder="Kari Nordmann"
          value={navnInput}
          onChange={e => onNavnEndring(e.target.value)}
          onBlur={() => setTimeout(() => setNavnForslag([]), 200)}
          autoComplete="off"
        />
        {navnForslag.length > 0 && (
          <ul className="kunde-dropdown">
            {navnForslag.map(k => (
              <li key={k.id} onMouseDown={() => velgDropdown(k)}>
                <span className="kunde-dropdown-navn">{k.navn}</span>
                <span className="kunde-dropdown-meta">
                  {k.mobil}{k.adresse ? ` · ${k.adresse}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="felt-gruppe">
        <label>Adresse</label>
        <input
          type="text"
          placeholder="Hjemveien 5, 0002 Oslo"
          value={kunde.kundeAdresse}
          onChange={e => onChange('kundeAdresse', e.target.value)}
        />
      </div>

      <div className="felt-gruppe">
        <label>E-post</label>
        <input
          type="email"
          placeholder="kari@epost.no"
          value={kunde.kundeEpost}
          onChange={e => onChange('kundeEpost', e.target.value)}
        />
      </div>

      {/* Lagre-knapp – kun for innloggede */}
      {innlogget && (
        <button
          className={`btn-lagre-kunde${status === 'ok' ? ' lagret' : status === 'feil' ? ' feil' : ''}`}
          onClick={lagreKlikk}
          disabled={status === 'laster' || !mobilInput.trim() || !navnInput.trim()}
        >
          {status === 'laster' ? 'Lagrer…'
            : status === 'ok'   ? '✓ Lagret'
            : status === 'feil' ? 'Feil – prøv igjen'
            : 'Lagre kunde'}
        </button>
      )}
    </section>
  )
}
