import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

// Registrerte brukere: 3 gratis generasjoner telt i Supabase → betalingsmur
// Anonym tilgang er fjernet — innlogging kreves for å bruke appen
const MAKS_GRATIS = 3

export function AuthProvider({ children }) {
  const [bruker,         setBruker]         = useState(null)
  const [laster,         setLaster]         = useState(true)
  const [dbGenerasjoner, setDbGenerasjoner] = useState(0)
  const [dbPro,          setDbPro]          = useState(false)
  const [stripeKundeId,  setStripeKundeId]  = useState(null)
  const [dbLaster,       setDbLaster]       = useState(false)

  // ── Auth-lytter ──────────────────────────────────────────────────────
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

  // ── Last profil fra Supabase når bruker logger inn ───────────────────
  useEffect(() => {
    if (!bruker) {
      setDbGenerasjoner(0)
      setDbPro(false)
      setStripeKundeId(null)
      return
    }
    setDbLaster(true)
    supabase
      .from('profiles')
      .select('generasjoner_brukt, pro, stripe_customer_id')
      .eq('bruker_id', bruker.id)
      .maybeSingle()
      .then(({ data }) => {
        setDbGenerasjoner(data?.generasjoner_brukt ?? 0)
        setDbPro(data?.pro ?? false)
        setStripeKundeId(data?.stripe_customer_id ?? null)
        setDbLaster(false)
      })
  }, [bruker])

  // ── Auth-funksjoner ──────────────────────────────────────────────────
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

  // ── Registrer ett forsøk ─────────────────────────────────────────────
  async function registrerForsok() {
    if (dbPro || !bruker) return

    const ny = dbGenerasjoner + 1
    setDbGenerasjoner(ny)
    await supabase
      .from('profiles')
      .update({ generasjoner_brukt: ny })
      .eq('bruker_id', bruker.id)
  }

  // ── Avledede verdier ─────────────────────────────────────────────────
  const isPro = dbPro

  const kanBrukeForsok = isPro || (bruker && dbGenerasjoner < MAKS_GRATIS)

  const forsokGjenstaende = isPro
    ? Infinity
    : bruker
      ? Math.max(0, MAKS_GRATIS - dbGenerasjoner)
      : 0

  const trengerRegistrering = !bruker
  const trengerOppgradering = bruker && !isPro && dbGenerasjoner >= MAKS_GRATIS

  return (
    <AuthContext.Provider value={{
      bruker, laster: laster || dbLaster,
      loggInn, registrer, loggUt,
      isPro,
      stripeKundeId,
      forsokGjenstaende,
      kanBrukeForsok,
      trengerRegistrering,
      trengerOppgradering,
      registrerForsok,
      MAKS_GRATIS_FORSOK: MAKS_GRATIS,
      // legacy alias
      forsok: bruker ? dbGenerasjoner : 0,
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
