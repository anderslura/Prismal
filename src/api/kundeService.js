import { supabase } from '../lib/supabase.js'

// Hent kunde på mobilnummer (eksakt match)
export async function hentKundePaMobil(mobil) {
  const { data, error } = await supabase
    .from('kunder')
    .select('*')
    .eq('mobil', mobil.trim())
    .maybeSingle()
  if (error) throw error
  return data // null hvis ikke funnet
}

// Live navn-søk (etter 2 tegn)
export async function sokKunderPaNavn(sok) {
  const { data, error } = await supabase
    .from('kunder')
    .select('*')
    .ilike('navn', `%${sok}%`)
    .order('navn')
    .limit(8)
  if (error) throw error
  return data ?? []
}

// Lagre/oppdater kunde – upsert på (bruker_id, mobil)
export async function lagreKunde({ mobil, navn, adresse, epost }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Ikke innlogget')
  const { error } = await supabase
    .from('kunder')
    .upsert(
      {
        bruker_id: user.id,
        mobil: mobil.trim(),
        navn: navn || null,
        adresse: adresse || null,
        epost: epost || null,
      },
      { onConflict: 'bruker_id,mobil' }
    )
  if (error) throw error
}

// Slett kunde på mobilnummer
export async function slettKunde(mobil) {
  const { error } = await supabase
    .from('kunder')
    .delete()
    .eq('mobil', mobil.trim())
  if (error) throw error
}
