import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthContext = createContext(null)

// Anonyme: 1 gratis smaksprøve (localStorage) → registreringskrav
// Registrerte: 3 gratis generasjoner telt i Supabase → betalingsmur
const MAKS_ANONYM   = 1
const MAKS_GRATIS   = 3          // registrert, ikke Pro
const ANONYM_KEY    = 'prismal_anonym_forsok'

export function AuthProvider({ children }) {
  const [bruker,            setBruker]            = useState(null)
  const [laster,            setLaster]            = useState(true)
  const [anonymForsok,      setAnonymForsok]      = useState(() => {
    try { return parseInt(localStorage.getItem(ANONYM_KEY) || '0') } catch { return 0 }
  })
  const [dbGenerasjoner,    setDbGenerasjoner]    = useState(0)
  const [dbLaster,          setDbLaster]          = useState(false)

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

  // ── Last generasjonsteller fra Supabase når bruker logger inn ────────
  useEffect(() => {
    if (!bruker) { setDbGenerasjoner(0); return }
    setDbLaster(true)
    supabase
      .from('profiles')
      .select('generasjoner_brukt')
      .eq('bruker_id', bruker.id)
      .maybeSingle()
      .then(({ data }) => {
        setDbGenerasjoner(data?.generasjoner_brukt ?? 0)
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
  // Kalles etter vellykket PDF-generering
  async function registrerForsok() {
    if (isPro) return                          // Pro: ingen tellelogikk

    if (bruker) {
      // Registrert bruker → inkrementer i Supabase
      const ny = dbGenerasjoner + 1
      setDbGenerasjoner(ny)
      await supabase
        .from('profiles')
        .update({ generasjoner_brukt: ny })
        .eq('bruker_id', bruker.id)
    } else {
      // Anonym → localStorage
      const ny = anonymForsok + 1
      try { localStorage.setItem(ANONYM_KEY, String(ny)) } catch {}
      setAnonymForsok(ny)
    }
  }

  // ── Avledede verdier ─────────────────────────────────────────────────
  const isPro = bruker?.user_metadata?.isPro === true

  // Kan bruke appen nå?
  const kanBrukeForsok = isPro
    || (bruker  && dbGenerasjoner < MAKS_GRATIS)
    || (!bruker && anonymForsok   < MAKS_ANONYM)

  // Hvor mange er igjen?
  const forsokGjenstaende = isPro
    ? Infinity
    : bruker
      ? Math.max(0, MAKS_GRATIS - dbGenerasjoner)
      : Math.max(0, MAKS_ANONYM - anonymForsok)

  // Trenger brukeren å registrere seg (anonym, brukt opp kvote)?
  const trengerRegistrering = !bruker && anonymForsok >= MAKS_ANONYM

  // Trenger brukeren å oppgradere (registrert, brukt opp kvote)?
  const trengerOppgradering = bruker && !isPro && dbGenerasjoner >= MAKS_GRATIS

  return (
    <AuthContext.Provider value={{
      bruker, laster: laster || dbLaster,
      loggInn, registrer, loggUt,
      isPro,
      forsokGjenstaende,
      kanBrukeForsok,
      trengerRegistrering,
      trengerOppgradering,
      registrerForsok,
      MAKS_GRATIS_FORSOK: MAKS_GRATIS,
      // legacy alias så App.jsx ikke krasjer
      forsok: bruker ? dbGenerasjoner : anonymForsok,
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
