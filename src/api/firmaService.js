import { supabase } from '../lib/supabase.js'

// Hent firmaprofil for innlogget bruker
export async function hentFirma() {
  const { data, error } = await supabase
    .from('firma')
    .select('*')
    .maybeSingle()
  if (error) throw error
  return data
}

// Lagre/oppdater firmaprofil (upsert på bruker_id)
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

// Slett firmaprofil fra Supabase
export async function slettFirma() {
  const { error } = await supabase
    .from('firma')
    .delete()
    .neq('bruker_id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

// ── Logo opplasting ──────────────────────────────────────────

/**
 * Skaler ned og komprimer bilde i nettleseren via Canvas.
 * SVG sendes uendret (kan ikke tegnes på canvas uten inline-konvertering).
 */
async function komprimer(fil, maxBredde = 800, maxHoyde = 400, kvalitet = 0.85) {
  if (fil.type === 'image/svg+xml') return fil // SVG beholder vi som-er

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(fil)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { naturalWidth: w, naturalHeight: h } = img

      // Skaler ned proporsjonalt om nødvendig
      if (w > maxBredde || h > maxHoyde) {
        const ratio = Math.min(maxBredde / w, maxHoyde / h)
        w = Math.round(w * ratio)
        h = Math.round(h * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)

      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Canvas toBlob feilet')),
        'image/webp',
        kvalitet
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Kunne ikke laste bilde')) }
    img.src = url
  })
}

/**
 * Last opp logo til Supabase Storage.
 * Én fil per bruker – overskriver alltid gammel logo.
 * Returnerer public URL.
 */
export async function uploadLogo(fil) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Ikke innlogget')

  const komprimert = await komprimer(fil)
  const ext  = fil.type === 'image/svg+xml' ? 'svg' : 'webp'
  const sti  = `${user.id}/logo.${ext}`
  const mime = fil.type === 'image/svg+xml' ? 'image/svg+xml' : 'image/webp'

  const { error } = await supabase.storage
    .from('logoer')
    .upload(sti, komprimert, { upsert: true, contentType: mime })

  if (error) throw error

  const { data } = supabase.storage.from('logoer').getPublicUrl(sti)
  return data.publicUrl
}

// Slett logo fra Storage
export async function slettLogo() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const paths = [`${user.id}/logo.webp`, `${user.id}/logo.svg`]
  await supabase.storage.from('logoer').remove(paths)
}
