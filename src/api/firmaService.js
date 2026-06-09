import { supabase } from '../lib/supabase.js'

// Hent firmaprofil for innlogget bruker
export async function hentFirma() {
  const { data, error } = await supabase
    .from('firma')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data // null hvis ikke lagret ennå
}

// Lagre/oppdater firmaprofil (upsert på bruker_id / primary key)
export async function lagreFirma({ firmanavn, telefon, epost, adresse, orgnr, nettside, logoUrl }) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Ikke innlogget')
  const { error } = await supabase
    .from('firma')
    .upsert({
      bruker_id: user.id,
      firmanavn: firmanavn || null,
      telefon:   telefon   || null,
      epost:     epost     || null,
      adresse:   adresse   || null,
      orgnr:     orgnr     || null,
      nettside:  nettside  || null,
      logo_url:  logoUrl   || null,
    }, { onConflict: 'bruker_id' })
  if (error) throw error
}

// Slett firmaprofil fra Supabase (nullstiller til neste lagring)
export async function slettFirma() {
  const { error } = await supabase
    .from('firma')
    .delete()
    .neq('bruker_id', '00000000-0000-0000-0000-000000000000') // slett kun egen rad via RLS
  if (error) throw error
}
