import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

const MAKS_GRATIS_TILBUD = 10

export function AuthProvider({ children }) {
  const [bruker, setBruker] = useState(null)
  const [laster, setLaster] = useState(true)
  const [antallTilbud, setAntallTilbud] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setBruker(session?.user ?? null)
      setLaster(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setBruker(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Hent antall tilbud fra localStorage per bruker
  useEffect(() => {
    if (bruker) {
      const key = `tilbud_count_${bruker.id}`
      const count = parseInt(localStorage.getItem(key) || '0')
      setAntallTilbud(count)
    } else {
      setAntallTilbud(0)
    }
  }, [bruker])

  async function loggInn(epost, passord) {
    const { error } = await supabase.auth.signInWithPassword({ email: epost, password: passord })
    if (error) throw error
  }

  async function registrer(epost, passord) {
    const { error } = await supabase.auth.signUp({ email: epost, password: passord })
    if (error) throw error
  }

  async function loggUt() {
    await supabase.auth.signOut()
  }

  function registrerTilbud() {
    if (!bruker) return
    const key = `tilbud_count_${bruker.id}`
    const ny = antallTilbud + 1
    localStorage.setItem(key, String(ny))
    setAntallTilbud(ny)
  }

  // isPro: leses fra Supabase user_metadata
  // Settes manuelt i Supabase SQL Editor, eller via Stripe webhook (TODO)
  const isPro = bruker?.user_metadata?.isPro === true

  const tilbudGjenstaende = MAKS_GRATIS_TILBUD - antallTilbud
  const kanLageTilbud = isPro || tilbudGjenstaende > 0

  return (
    <AuthContext.Provider value={{
      bruker,
      laster,
      loggInn,
      registrer,
      loggUt,
      isPro,
      antallTilbud,
      tilbudGjenstaende,
      kanLageTilbud,
      registrerTilbud,
      MAKS_GRATIS_TILBUD,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth må brukes innenfor AuthProvider')
  return ctx
}
