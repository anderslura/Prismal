import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [bruker, setBruker] = useState(null)
  const [laster, setLaster] = useState(true)

  useEffect(() => {
    // Hent aktiv sesjon ved oppstart
    supabase.auth.getSession().then(({ data: { session } }) => {
      setBruker(session?.user ?? null)
      setLaster(false)
    })

    // Lytt på auth-endringer (login, logout, token refresh)
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

  // isPro: hardkodet true inntil Stripe er koblet til
  // TODO: les fra bruker-metadata eller subscriptions-tabell etter Stripe-integrasjon
  const isPro = true

  return (
    <AuthContext.Provider value={{ bruker, laster, loggInn, registrer, loggUt, isPro }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth må brukes innenfor AuthProvider')
  return ctx
}
