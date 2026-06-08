import jsPDF from 'jspdf'
import 'jspdf-autotable'

/**
 * Genererer og laster ned et profesjonelt tilbud som PDF.
 */
function temaFarge(temaId) {
  const kart = {
    standard: [30, 80, 200],
    mork:     [17, 24, 39],
    gronn:    [22, 101, 52],
    rosa:     [190, 24, 93],
    jul:      [153, 27, 27],
    paske:    [133, 77, 14],
    bunad:    [29, 78, 216],
    pride:    [124, 58, 237],
  }
  return kart[temaId] || kart.standard
}

export function lastNedPDF(skjema, isPro = true) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const sideBredde = doc.internal.pageSize.getWidth()
  const margin = 20

  // --- FARGER OG FONTER ---
  const fargeHoved = temaFarge(skjema.pdfTema)
  const fargeMork = [30, 30, 30]
  const fargeGraa = [120, 120, 120]
  const fargeLysGraa = [245, 245, 245]

  // --- HEADER ---
  // Beregn antall linjer i firma-info for dynamisk header-høyde
  const firmaLinjer = [
    skjema.firmaAdresse,
    skjema.firmaTelefon ? `Tlf: ${skjema.firmaTelefon}` : null,
    skjema.firmaEpost,
    skjema.firmaOrgnr ? `Org.nr: ${skjema.firmaOrgnr}` : null,
    skjema.firmaNettside,
  ].filter(Boolean)
  const headerHoyde = Math.max(40, 18 + firmaLinjer.length * 5 + 4)

  // Tegn header-bakgrunn (pride = glatt regnbue, resten = solid)
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

  // Logo / firmanavn i header
  let tekstStartX = margin
  if (isPro && skjema.logoUrl) {
    try {
      const img = new Image()
      img.src = skjema.logoUrl
      const logoH = 16
      const logoW = img.width && img.height ? (img.width / img.height) * logoH : logoH
      doc.addImage(skjema.logoUrl, 'PNG', margin, 6, logoW, logoH)
      tekstStartX = margin + logoW + 4
    } catch {}
  } else if (!isPro) {
    // Prismal-logo: tre diagonale striper
    const sx = margin, sy = 5, sh = 18, sw = 13
    doc.setFillColor(168, 202, 255)
    doc.triangle(sx, sy + sh, sx + sw * 0.4, sy, sx + sw * 0.65, sy, 'F')
    doc.setFillColor(102, 153, 255)
    doc.triangle(sx + sw * 0.25, sy + sh, sx + sw * 0.65, sy, sx + sw * 0.9, sy, 'F')
    doc.setFillColor(51, 102, 238)
    doc.triangle(sx + sw * 0.5, sy + sh, sx + sw * 0.9, sy, sx + sw, sy, 'F')
    tekstStartX = margin + sw + 4
  }

  // Firmanavn
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(isPro ? (skjema.firmanavn || 'Ditt Firma AS') : 'PRISMAL', tekstStartX, 14)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  let y = 21
  firmaLinjer.forEach(linje => { doc.text(linje, tekstStartX, y); y += 5 })

  // Meta-felt øverst til høyre
  doc.setFontSize(9)
  doc.text('TILBUD', sideBredde - margin, 12, { align: 'right' })
  doc.setFontSize(8)
  doc.text(`Nr: ${skjema.tilbudsnummer}`, sideBredde - margin, 19, { align: 'right' })
  doc.text(`Dato: ${skjema.dato}`, sideBredde - margin, 25, { align: 'right' })
  doc.text(`Gyldig til: ${gyldigTil(30)}`, sideBredde - margin, 31, { align: 'right' })

  // --- KUNDE ---
  let cy = headerHoyde + 12
  doc.setTextColor(...fargeGraa)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('TILBUD TIL', margin, cy)

  cy += 5
  doc.setTextColor(...fargeMork)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(skjema.kundenavn || '', margin, cy)

  cy += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  if (skjema.kundeAdresse) { doc.text(skjema.kundeAdresse, margin, cy); cy += 5 }
  if (skjema.kundeEpost)   { doc.text(skjema.kundeEpost, margin, cy); cy += 5 }

  // --- SKILLELINJE ---
  cy += 5
  doc.setDrawColor(220, 220, 220)
  doc.line(margin, cy, sideBredde - margin, cy)
  cy += 8

  // --- TILBUDSTEKST ---
  doc.setTextColor(...fargeHoved)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`Tilbud`, margin, cy)
  cy += 7

  doc.setTextColor(...fargeMork)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')

  if (skjema.tilbudstekst) {
    const linjer = doc.splitTextToSize(skjema.tilbudstekst, sideBredde - margin * 2)
    doc.text(linjer, margin, cy)
    cy += linjer.length * 5 + 8
  }

  // --- PRISTABELL ---
  const totalArbeid = (skjema.arbeidere || []).reduce((s, a) => s + (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0), 0)
  const totalMaterialer = skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0).reduce((s, m) => s + (parseFloat(m.sum) || (parseFloat(m.pris)||0)*(parseFloat(m.antall)||1)), 0)
  const materialerMedPaaslag = skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0).reduce((s, m) => s + (m.hasPaaslag ? (parseFloat(m.sum)||(parseFloat(m.pris)||0)*(parseFloat(m.antall)||1)) : 0), 0)
  const paaslag = materialerMedPaaslag * (parseFloat(skjema.paaslagProsent) || 0) / 100
  const totalEksMva = totalArbeid + totalMaterialer + paaslag
  const mva = totalEksMva * 0.25
  const totalInklMva = totalEksMva + mva

  const rader = []
  ;(skjema.arbeidere || []).filter(a => a.timer && a.timepris).forEach(a => {
    const sum = (parseFloat(a.timer)||0)*(parseFloat(a.timepris)||0)
    rader.push([
      'Arbeid',
      `${a.timer} t`,
      kr(parseFloat(a.timepris)),
      kr(sum),
    ])
  })
  skjema.materialer.filter(m => (parseFloat(m.antall)||0) > 0).forEach(m => {
    const ant = parseFloat(m.antall) || 1
    const pris = parseFloat(m.pris) || 0
    const sum = parseFloat(m.sum) || pris * ant
    rader.push([m.navn, String(ant), kr(pris), kr(sum)])
  })

  doc.autoTable({
    startY: cy,
    head: [['Beskrivelse', 'Antall', 'Enhetspris', 'Sum']],
    body: rader,
    foot: [
      [{ content: 'Sum eks. mva', colSpan: 3, styles: { halign: 'right' } }, kr(totalEksMva)],
      [{ content: 'MVA 25%', colSpan: 3, styles: { halign: 'right' } }, kr(mva)],
      [{ content: 'Totalt inkl. mva', colSpan: 3, styles: { halign: 'right', fontStyle: 'bold' } }, { content: kr(totalInklMva), styles: { fontStyle: 'bold' } }],
    ],
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

  // --- GYLDIGHET + AKSEPTKLAUSUL ---
  let gy = doc.lastAutoTable.finalY + 10

  doc.setFontSize(8.5)
  doc.setTextColor(...fargeGraa)
  doc.setFont('helvetica', 'normal')
  doc.text('Tilbudet er gyldig i 30 dager fra utstedelsesdato.', margin, gy)
  gy += 8

  // Aksept-boks med venstre fargestripe
  const akseptTekst = `For å godta dette tilbudet må skriftlig aksept sendes til ${skjema.firmaEpost || 'firmaets e-post'} innen tilbudets gyldighetsperiode. Muntlig aksept er ikke bindende.`
  const akseptLinjer = doc.splitTextToSize(akseptTekst, sideBredde - margin * 2 - 6)
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

  // --- BUNNTEKST (dynamisk posisjon — aldri overlapp med aksept-boks) ---
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
    doc.text(
      'Tilbudet er gyldig i 30 dager.',
      sideBredde / 2, gy, { align: 'center' }
    )
    gy += 5
    doc.setFontSize(7)
    doc.setTextColor(102, 153, 255)
    doc.text('Laget med Prismal — prismal.no | Fjern Prismal-branding med Pro', sideBredde / 2, gy, { align: 'center' })
  }

  doc.save(`Tilbud-${skjema.tilbudsnummer}-${skjema.kundenavn || 'kunde'}.pdf`)
}

function kr(tall) {
  return new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }).format(tall || 0)
}

function gyldigTil(dager) {
  const d = new Date()
  d.setDate(d.getDate() + dager)
  return d.toLocaleDateString('no-NO')
}
