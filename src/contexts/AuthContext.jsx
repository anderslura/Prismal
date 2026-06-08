import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

const MAKS_GRATIS_FORSOK = 3
const FORSOK_KEY = 'prismal_gratis_forsok'

export function AuthProvider({ children }) {
  const [bruker, setBruker] = useState(null)
  const [laster, setLaster] = useState(true)
  const [forsok, setForsok] = useState(() => {
    try { return parseInt(localStorage.getItem(FORSOK_KEY) || '0') } catch { return 0 }
  })

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

  function registrerForsok() {
    const ny = forsok + 1
    try { localStorage.setItem(FORSOK_KEY, String(ny)) } catch {}
    setForsok(ny)
  }

  // isPro: leses fra Supabase user_metadata (settes manuelt eller via Stripe webhook)
  const isPro = bruker?.user_metadata?.isPro === true

  const forsokGjenstaende = Math.max(0, MAKS_GRATIS_FORSOK - forsok)
  const kanBrukeForsok = isPro || forsokGjenstaende > 0

  return (
    <AuthContext.Provider value={{
      bruker, laster, loggInn, registrer, loggUt,
      isPro, forsok, forsokGjenstaende, kanBrukeForsok,
      registrerForsok, MAKS_GRATIS_FORSOK,
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
