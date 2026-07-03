import jsPDF from 'jspdf'
import 'jspdf-autotable'

function temaFarge(temaId) {
  const kart = {
    standard: [30, 80, 200],
    mork:     [17, 24, 39],
    graa:     [100, 116, 139],
    hvit:     [241, 245, 249],
    rosa:     [190, 24, 93],
    jul:      [153, 27, 27],
    paske:    [217, 119, 6],
    pride:    [124, 58, 237],
  }
  return kart[temaId] || kart.standard
}

async function logoTilPngData(url) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const skala = 1
      const w = img.naturalWidth  * skala
      const h = img.naturalHeight * skala
      const canvas = document.createElement('canvas')
      canvas.width  = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      resolve({ dataUrl: canvas.toDataURL('image/png'), w: img.naturalWidth, h: img.naturalHeight })
    }
    img.onerror = () => resolve(null)
    img.src = url
  })
}

// ── Felles PDF-builder — returnerer jsPDF-instans ──
async function byggPdfDok(skjema, isPro = true) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const sideBredde = doc.internal.pageSize.getWidth()
  const margin = 20

  const fargeHoved = temaFarge(skjema.pdfTema)
  const fargeMork = [30, 30, 30]
  const fargeGraa = [120, 120, 120]
  const fargeLysGraa = [245, 245, 245]

  const firmaLinjer = [
    skjema.firmaAdresse,
    skjema.firmaTelefon ? `Tlf: ${skjema.firmaTelefon}` : null,
    skjema.firmaEpost,
    skjema.firmaOrgnr ? `Org.nr: ${skjema.firmaOrgnr}` : null,
    skjema.firmaNettside,
    (!skjema.firmaFacebookUrl && skjema.firmaFacebookNavn) ? `Facebook: ${skjema.firmaFacebookNavn}` : null,
  ].filter(Boolean)
  const visFacebookKnapp = !!skjema.firmaFacebookUrl
  const headerHoyde = Math.max(40, 18 + firmaLinjer.length * 5 + 4 + (visFacebookKnapp ? 9 : 0))

  if (skjema.pdfTema === 'pride') {
    const stops = [[228,3,3],[255,140,0],[255,237,0],[0,128,38],[0,77,255],[117,7,135]]
    const steg = 80
    for (let i = 0; i < steg; i++) {
      const t = i / (steg - 1)
      const segLen = stops.length - 1
      const seg = Math.min(Math.floor(t * segLen), segLen - 1)
      const segT = t * segLen - seg
      const c1 = stops[seg], c2 = stops[seg + 1]
      const r = Math.round(c1[0] + (c2[0]-c1[0]) * segT)
      const g = Math.round(c1[1] + (c2[1]-c1[1]) * segT)
      const b = Math.round(c1[2] + (c2[2]-c1[2]) * segT)
      doc.setFillColor(r, g, b)
      doc.rect(i * sideBredde / steg, 0, sideBredde / steg + 0.5, headerHoyde, 'F')
    }
  } else {
    doc.setFillColor(...fargeHoved)
    doc.rect(0, 0, sideBredde, headerHoyde, 'F')
  }

  let tekstStartX = margin
  if (isPro && skjema.logoUrl) {
    const logoData = await logoTilPngData(skjema.logoUrl)
    if (logoData) {
      const logoH = 16
      const logoW = logoData.w && logoData.h ? (logoData.w / logoData.h) * logoH : logoH
      doc.addImage(logoData.dataUrl, 'PNG', margin, 6, logoW, logoH)
      tekstStartX = margin + logoW + 4
    }
  } else if (!isPro) {
    const sx = margin, sy = 6, sh = 16, gap = 1.5, w = 3.5
    const skew = sh * 0.45
    const striper = [[168,202,255],[102,153,255],[51,102,238]]
    striper.forEach(([r, g, b], i) => {
      const ox = i * (w + gap)
      doc.setFillColor(r, g, b)
      doc.lines([[w,0],[skew,-sh],[-w,0],[-skew,sh]], sx+ox+skew, sy+sh, [1,1], 'F', true)
    })
    // Logoens visuelle bredde: skjev topp-venstre (skew) + 2 intervaller + 1 stripe + skjev topp-høyre (skew)
    // Tidligere bug: margin + sw*3 + gap*2 + 5 = margin+50mm — ga enormt gap mellom logo og tekst
    const logoBredde = skew + (striper.length - 1) * (w + gap) + w + skew
    tekstStartX = margin + logoBredde + 4
  }

  doc.setTextColor(...(skjema.pdfTema === 'hvit' ? [30,41,59] : [255,255,255]))
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(isPro ? (skjema.firmanavn || 'Ditt Firma AS') : 'PRISMAL', tekstStartX, 14)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  let y = 21
  firmaLinjer.forEach(linje => {
    if (skjema.firmaNettside && linje === skjema.firmaNettside) {
      const url = /^https?:\/\//i.test(skjema.firmaNettside) ? skjema.firmaNettside : `https://${skjema.firmaNettside}`
      doc.textWithLink(linje, tekstStartX, y, { url })
    } else {
      doc.text(linje, tekstStartX, y)
    }
    y += 5
  })

  if (visFacebookKnapp) {
    const fbNavn = skjema.firmaFacebookNavn || skjema.firmanavn || ''
    const fbTekst = `Besøk ${fbNavn ? fbNavn + 's' : 'vår'} Facebook-side`
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    const fbBredde = doc.getTextWidth(fbTekst) + 8
    doc.setFillColor(24, 119, 242)
    doc.roundedRect(tekstStartX, y - 4.3, fbBredde, 6, 1.5, 1.5, 'F')
    doc.setTextColor(255, 255, 255)
    doc.textWithLink(fbTekst, tekstStartX + 4, y, { url: skjema.firmaFacebookUrl })
    y += 8
    doc.setTextColor(...(skjema.pdfTema === 'hvit' ? [30,41,59] : [255,255,255]))
  }

  doc.setFontSize(9)
  doc.text('TILBUD', sideBredde - margin, 12, { align: 'right' })
  doc.setFontSize(8)
  doc.text(`Nr: ${skjema.tilbudsnummer}`, sideBredde - margin, 19, { align: 'right' })
  doc.text(`Dato: ${skjema.dato}`, sideBredde - margin, 25, { align: 'right' })
  doc.text(`Gyldig til: ${gyldigTil(30)}`, sideBredde - margin, 31, { align: 'right' })

  let cy = headerHoyde + 12
  doc.setTextColor(...fargeGraa)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('TILBUD TIL', margin, cy)

  cy += 4
  doc.setTextColor(...fargeMork)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(skjema.kundenavn || '', margin, cy)

  cy += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (skjema.kundeAdresse) { doc.text(skjema.kundeAdresse, margin, cy); cy += 5 }
  if (skjema.kundeEpost)   { doc.text(skjema.kundeEpost, margin, cy); cy += 5 }

  cy += 5
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, cy, sideBredde - margin, cy)
  cy += 8

  doc.setTextColor(...fargeHoved)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Tilbud', margin, cy)
  cy += 5

  doc.setTextColor(...fargeMork)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'normal')

  if (skjema.tilbudstekst) {
    const linjer = doc.splitTextToSize(skjema.tilbudstekst, sideBredde - margin * 2)
    doc.text(linjer, margin, cy)
    cy += linjer.length * 4.5 + 5
  }

  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMaterialer = skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0).reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.pris)||0)*(parseFloat(m.antall)||1)), 0)
  const materialerMedPaaslag = skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0).reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.sum)||(parseFloat(m.pris)||0)*(parseFloat(m.antall)||1)) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent) || 0) / 100
  function kjoringRadSum2(k) {
    const km = parseFloat(k.km)||0, sats = parseFloat(k.sats)||0
    const hengerSats = k.harHenger ? (parseFloat(k.hengerSats)||0) : 0
    return km * (sats + hengerSats)
  }
  const kjoringSum2     = (skjema.kjoring     || []).reduce((s, k) => s + kjoringRadSum2(k), 0)
  const utstyrsleieSum2 = (skjema.utstyrsleie || []).reduce((s, u) => s + (parseFloat(u.dager)||0)*(parseFloat(u.sats)||0), 0)
  const utstyrsleiePaaslag2 = skjema.utstyrsleiePaaslagAktiv ? utstyrsleieSum2 * (parseFloat(skjema.utstyrsleiePaaslagProsent)||0) / 100 : 0
  const bomSum2       = (skjema.bom       || []).reduce((s, b) => s + (parseFloat(b.antall)||0)*(parseFloat(b.pris)||0), 0)
  const parkeringSum2 = (skjema.parkering  || []).reduce((s, p) => s + (parseFloat(p.antall)||0)*(parseFloat(p.pris)||0), 0)
  const fergeSum2     = (skjema.ferge      || []).reduce((s, f) => s + (parseFloat(f.antall)||0)*(parseFloat(f.pris)||0), 0)
  const miljoAvgifterListe = (skjema.miljoavgifter || []).filter(m => (parseFloat(m.antall)||0) > 0 && (parseFloat(m.pris)||0) > 0)
  const miljoPaaslagFaktor = 1 + (parseFloat(skjema.miljoPaaslagProsent) || 0) / 100
  const miljoAvgifterSum2 = miljoAvgifterListe.reduce((s, m) => s + (parseFloat(m.antall)||0)*(parseFloat(m.pris)||0), 0)
  const miljoPaaslag2 = miljoAvgifterSum2 * (parseFloat(skjema.miljoPaaslagProsent) || 0) / 100
  const totalEksMva = totalArbeid + totalMaterialer + paaslag + miljoAvgifterSum2 + miljoPaaslag2 + kjoringSum2 + utstyrsleieSum2 + utstyrsleiePaaslag2 + bomSum2 + parkeringSum2 + fergeSum2
  const mva = totalEksMva * 0.25
  const totalInklMva = totalEksMva + mva

  // Seksjonsoverskrift: fet, full bredde (colSpan 4), litt ekstra luft over til neste seksjon
  function seksjonsrad(navn) {
    rader.push([{ content: navn.toUpperCase(), colSpan: 4, styles: {
      fontStyle: 'bold', fontSize: 8, textColor: fargeMork, fillColor: fargeLysGraa,
      cellPadding: { top: 3.5, right: 2, bottom: 1.5, left: 2 },
    } }])
  }
  // Kategoriunderoverskrift for materialer (lysere/mindre enn seksjonsoverskrift, med innrykk).
  // ekstraLuft=true legger litt mer luft over raden — brukes mellom to kategorier (ikke den første),
  // slik at flere kategorier ikke flyter i hverandre.
  function kategorirad(navn, ekstraLuft) {
    rader.push([{ content: navn, colSpan: 4, styles: {
      fontStyle: 'bold', fontSize: 9.5, textColor: fargeHoved, fillColor: [255, 255, 255],
      cellPadding: { top: ekstraLuft ? 5.5 : 2.5, right: 2, bottom: 1.5, left: 8 },
    } }])
  }

  const rader = []

  // ARBEID
  const arbeidRader = (skjema.arbeidere || []).filter(a => a.timer && a.timepris).map(a => {
    const sum = (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0)
    return ['Timearbeid', `${a.timer} t`, kr(parseFloat(a.timepris)), kr(sum)]
  })
  if (arbeidRader.length) { seksjonsrad('Arbeid'); rader.push(...arbeidRader) }

  // MATERIALER — med valgfri kategorigruppering (kun om minst én linje har kategori satt)
  const paaslagFaktor = 1 + (parseFloat(skjema.paaslagProsent) || 0) / 100
  const materialerIBrukListe = skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0)
  function materialRad(m) {
    const ant = parseFloat(m.antall) || 1
    const prisUten = parseFloat(m.pris) || 0
    const prisMedPaaslag = m.hasPaaslag ? prisUten * paaslagFaktor : prisUten
    return [m.navn, String(ant), kr(prisMedPaaslag), kr(prisMedPaaslag * ant)]
  }
  if (materialerIBrukListe.length) {
    seksjonsrad('Materialer')
    const harKategori = materialerIBrukListe.some(m => m.kategori)
    if (!harKategori) {
      materialerIBrukListe.forEach(m => rader.push(materialRad(m)))
    } else {
      const kategoriNokler = []
      const kategoriMap = {}
      materialerIBrukListe.forEach(m => {
        const key = m.kategori || ''
        if (!(key in kategoriMap)) { kategoriMap[key] = []; kategoriNokler.push(key) }
        kategoriMap[key].push(m)
      })
      // Navngitte kategorier først; ukategoriserte linjer vises sist, uten egen overskrift —
      // slik at ingenting "uten kategori" ligger over en kategori-overskrift.
      kategoriNokler.filter(Boolean).forEach((kat, i) => {
        kategorirad(kat, i > 0)
        kategoriMap[kat].forEach(m => rader.push(materialRad(m)))
      })
      ;(kategoriMap[''] || []).forEach(m => rader.push(materialRad(m)))
    }
  }

  // MILJØAVGIFTER
  if (miljoAvgifterListe.length) {
    seksjonsrad('Miljøavgifter')
    miljoAvgifterListe.forEach(m => {
      const ant = parseFloat(m.antall) || 0
      const prisMedPaaslag = (parseFloat(m.pris) || 0) * miljoPaaslagFaktor
      rader.push([m.navn || 'Miljøavgift', String(ant), kr(prisMedPaaslag), kr(prisMedPaaslag * ant)])
    })
  }

  // TRANSPORT
  const transportRader = []
  ;(skjema.kjoring||[]).forEach(k => {
    const km = parseFloat(k.km)||0, sats = parseFloat(k.sats)||0
    if (km > 0 && sats > 0) {
      const hengerSats = k.harHenger ? (parseFloat(k.hengerSats)||0) : 0
      const navn = k.harHenger ? 'Kjøring (med henger)' : 'Kjøring'
      transportRader.push([navn, `${km} km`, kr(sats + hengerSats) + '/km', kr(km * (sats + hengerSats))])
    }
  })
  ;(skjema.bom||[]).forEach(b => { const a=parseFloat(b.antall)||0,p=parseFloat(b.pris)||0; if(a>0&&p>0) transportRader.push(['Bom',String(a),kr(p),kr(a*p)]) })
  ;(skjema.parkering||[]).forEach(p => { const a=parseFloat(p.antall)||0,pr=parseFloat(p.pris)||0; if(a>0&&pr>0) transportRader.push(['Parkering',String(a),kr(pr),kr(a*pr)]) })
  ;(skjema.ferge||[]).forEach(f => { const a=parseFloat(f.antall)||0,p=parseFloat(f.pris)||0; if(a>0&&p>0) transportRader.push(['Ferge',String(a),kr(p),kr(a*p)]) })
  if (transportRader.length) { seksjonsrad('Transport'); rader.push(...transportRader) }

  // LEIE AV UTSTYR
  const utstyrsleieRader = []
  ;(skjema.utstyrsleie||[]).forEach(u => {
    const dager = parseFloat(u.dager)||0, sats = parseFloat(u.sats)||0
    if (dager > 0 && sats > 0)
      utstyrsleieRader.push([u.navn || 'Utstyrsleie', `${dager} dag(er)`, kr(sats) + '/dag', kr(dager * sats)])
  })
  if (utstyrsleiePaaslag2 > 0 && utstyrsleieRader.length)
    utstyrsleieRader.push([`Påslag leie av utstyr (${skjema.utstyrsleiePaaslagProsent}%)`, '', '', kr(utstyrsleiePaaslag2)])
  if (utstyrsleieRader.length) { seksjonsrad('Leie av utstyr'); rader.push(...utstyrsleieRader) }

  const mvaPliktig = skjema.firmaMvaPliktig !== false
  const footRader = mvaPliktig
    ? [
        [{ content: 'Sum eks. mva', colSpan: 3, styles: { halign: 'right' } }, kr(totalEksMva)],
        [{ content: 'MVA 25%', colSpan: 3, styles: { halign: 'right' } }, kr(mva)],
        [{ content: 'Totalt inkl. mva', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: kr(totalInklMva), styles: { fontStyle: 'bold' } }],
      ]
    : [
        [{ content: 'Totalt', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: kr(totalEksMva), styles: { fontStyle: 'bold' } }],
      ]

  doc.autoTable({
    startY: cy,
    head: [['Beskrivelse', 'Antall', 'Enhetspris', 'Sum']],
    body: rader,
    foot: footRader,
    theme: 'grid',
    headStyles: { fillColor: fargeHoved, textColor: 255, fontSize: 9 },
    footStyles: { fillColor: fargeLysGraa, textColor: fargeMork, fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: fargeMork },
    alternateRowStyles: { fillColor: [252, 252, 255] },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { halign: 'center', cellWidth: 22 },
      2: { halign: 'right', cellWidth: 32 },
      3: { halign: 'right', cellWidth: 32 },
    },
    margin: { left: margin, right: margin },
  })

  const sideHoyde = doc.internal.pageSize.getHeight()
  let gy = doc.lastAutoTable.finalY + 6

  const akseptTekstTest = `For å godta dette tilbudet må skriftlig aksept sendes til ${skjema.firmaEpost || 'firmaets e-post'} innen tilbudets gyldighetsperiode. Muntlig aksept er ikke bindende.`
  const testLinjer = doc.splitTextToSize(akseptTekstTest, sideBredde - margin * 2 - 6)
  const behovHoyde = 8 + testLinjer.length * 5 + 24 + 20
  if (gy + behovHoyde > sideHoyde - 8) { doc.addPage(); gy = margin }

  doc.setFontSize(8.5)
  doc.setTextColor(...fargeGraa)
  doc.setFont('helvetica', 'normal')
  doc.text('Tilbudet er gyldig i 30 dager fra utstedelsesdato.', margin, gy)
  gy += 8

  const akseptLinjer = doc.splitTextToSize(akseptTekstTest, sideBredde - margin * 2 - 6)
  const akseptHoyde = akseptLinjer.length * 5 + 8
  doc.setFillColor(245, 247, 255)
  doc.rect(margin, gy, sideBredde - margin * 2, akseptHoyde, 'F')
  doc.setFillColor(...fargeHoved)
  doc.rect(margin, gy, 3, akseptHoyde, 'F')
  doc.setTextColor(...fargeMork)
  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.text('Aksept av tilbud:', margin + 6, gy + 6)
  doc.setFont('helvetica', 'normal')
  doc.text(akseptLinjer, margin + 6, gy + 12)
  gy += akseptHoyde + 8

  doc.setDrawColor(220, 220, 220)
  doc.line(margin, gy, sideBredde - margin, gy)
  gy += 6
  doc.setFontSize(7.5)
  doc.setTextColor(...fargeGraa)
  if (isPro) {
    doc.text(
      `Tilbudet er gyldig i 30 dager. ${skjema.firmanavn || ''} · ${skjema.firmaEpost || ''} · ${skjema.firmaTelefon || ''}`,
      sideBredde / 2, gy, { align: 'center' }
    )
  } else {
    doc.text('Tilbudet er gyldig i 30 dager.', sideBredde / 2, gy, { align: 'center' })
    gy += 5
    doc.setFontSize(7)
    doc.setTextColor(102, 153, 255)
    doc.text('Laget med Prismal — prismal.no | Fjern Prismal-branding med Pro', sideBredde / 2, gy, { align: 'center' })
  }

  // ── Sidetall (kun ved flere sider) ──
  const totalSider = doc.internal.getNumberOfPages()
  if (totalSider > 1) {
    for (let i = 1; i <= totalSider; i++) {
      doc.setPage(i)
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...fargeGraa)
      doc.text(`Side ${i} av ${totalSider}`, sideBredde - margin, sideHoyde - 6, { align: 'right' })
    }
  }

  return doc
}

// ── Last ned PDF direkte ──
export async function lastNedPDF(skjema, isPro = true) {
  const doc = await byggPdfDok(skjema, isPro)
  doc.save(`Tilbud-${skjema.tilbudsnummer}-${skjema.kundenavn || 'kunde'}.pdf`)
}

// ── Generer PDF som base64-streng (for e-postsending) ──
export async function genererPdfBase64(skjema, isPro = true) {
  const doc = await byggPdfDok(skjema, isPro)
  // datauristring = "data:application/pdf;base64,JVBERi0x..."
  return doc.output('datauristring').split(',')[1]
}

// ── Generer PDF som blob-URL (for forhåndsvisning i nettleser uten nedlasting) ──
export async function genererPdfBlobUrl(skjema, isPro = true) {
  const doc = await byggPdfDok(skjema, isPro)
  return doc.output('bloburl')
}

function kr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall || 0)
}

function gyldigTil(dager) {
  const d = new Date()
  d.setDate(d.getDate() + dager)
  return d.toLocaleDateString('no-NO')
}
