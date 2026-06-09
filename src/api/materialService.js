import { supabase } from '../lib/supabase.js'

// Hent hele materialbiblioteket, sortert på sist brukt
export async function hentMaterialer() {
  const { data, error } = await supabase
    .from('materialer')
    .select('*')
    .order('sist_brukt', { ascending: false })
  if (error) throw error
  return data ?? []
}

// Autocomplete-søk på navn (etter 1 tegn)
export async function sokMaterialer(sok) {
  const { data, error } = await supabase
    .from('materialer')
    .select('*')
    .ilike('navn', `%${sok}%`)
    .order('sist_brukt', { ascending: false })
    .limit(8)
  if (error) throw error
  return data ?? []
}

// Lagre/oppdater material — upsert på (bruker_id, navn)
// Oppdaterer også sist_brukt slik at hyppig brukte kommer øverst
export async function lagreMaterial({ navn, pris, hasPaaslag }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return // stille feil — ikke innlogget
  const { error } = await supabase
    .from('materialer')
    .upsert(
      {
        bruker_id:   user.id,
        navn:        navn.trim(),
        pris:        Number(pris) || 0,
        has_paaslag: hasPaaslag ?? true,
        sist_brukt:  new Date().toISOString(),
      },
      { onConflict: 'bruker_id,navn' }
    )
  if (error) console.error('lagreMaterial feilet:', error)
}

// Slett ett material fra biblioteket
export async function slettMaterial(navn) {
  const { error } = await supabase
    .from('materialer')
    .delete()
    .eq('navn', navn.trim())
  if (error) throw error
}
