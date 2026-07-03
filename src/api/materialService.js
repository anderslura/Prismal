import { supabase } from '../lib/supabase.js'

async function getBrukerId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// Hent hele materialbiblioteket for innlogget bruker, sortert på sist brukt
export async function hentMaterialer() {
  const brukerId = await getBrukerId()
  if (!brukerId) return []
  const { data, error } = await supabase
    .from('materialer')
    .select('*')
    .eq('bruker_id', brukerId)
    .order('sist_brukt', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Autocomplete-søk på navn (etter 1 tegn) — kun egne materialer
export async function sokMaterialer(sok) {
  const brukerId = await getBrukerId()
  if (!brukerId) return []
  const { data, error } = await supabase
    .from('materialer')
    .select('*')
    .eq('bruker_id', brukerId)
    .ilike('navn', `%${sok}%`)
    .order('sist_brukt', { ascending: false })
    .limit(8)
  if (error) throw error
  return data ?? []
}

// Lagre/oppdater material — upsert på (bruker_id, navn)
export async function lagreMaterial({ navn, pris, hasPaaslag }) {
  const brukerId = await getBrukerId()
  if (!brukerId) return
  const { error } = await supabase
    .from('materialer')
    .upsert(
      {
        bruker_id:   brukerId,
        navn:        navn.trim(),
        pris:        Number(pris) || 0,
        has_paaslag: hasPaaslag ?? true,
        sist_brukt:  new Date().toISOString(),
      },
      { onConflict: 'bruker_id,navn' }
    )
  if (error) console.error('lagreMaterial feilet:', error)
}

// Slett ett material — kun eget
export async function slettMaterial(navn) {
  const brukerId = await getBrukerId()
  if (!brukerId) return
  const { error } = await supabase
    .from('materialer')
    .delete()
    .eq('bruker_id', brukerId)
    .eq('navn', navn.trim())
  if (error) throw error
}
