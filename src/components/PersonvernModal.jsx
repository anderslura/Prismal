/* PersonvernModal — Personvernerklæring og Vilkår for Prismal */
export default function PersonvernModal({ side, onLukk }) {
  return (
    <div className="modal-bakgrunn" onClick={onLukk}>
      <div
        className="modal-boks"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: 640,
          maxHeight: '85vh',
          overflowY: 'auto',
          padding: '2rem',
          background: '#ffffff',
          color: '#1a1a1a',
        }}
      >
        <button className="modal-lukk" onClick={onLukk}>✕</button>

        {side === 'personvern' ? <Personvern /> : <Vilkaar />}
      </div>
    </div>
  )
}

function Personvern() {
  return (
    <>
      <h2 style={{ marginTop: 0, color: '#1a1a1a' }}>Personvernerklæring</h2>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>Sist oppdatert: juni 2025</p>

      <h3>Behandlingsansvarlig</h3>
      <p>
        Hjelpeportalen AS<br />
        Org.nr: 937141319<br />
        E-post: kontakt@prismal.no
      </p>

      <h3>Hvilke data samler vi inn?</h3>
      <p>
        Vi samler inn e-postadresse ved registrering. Når du bruker tjenesten lagres antall
        genererte tilbud og abonnementsstatus. Betalingsinformasjon (kortnummer o.l.) behandles
        utelukkende av Stripe og lagres aldri hos oss.
      </p>

      <h3>Formål</h3>
      <p>
        Data brukes til å levere tjenesten, håndtere innlogging, administrere abonnement og
        sende nødvendige systemvarsler. Vi bruker ikke dine data til markedsføring fra tredjeparter.
      </p>

      <h3>Databehandlere og lagring</h3>
      <p>
        Vi benytter følgende underleverandører:
      </p>
      <ul>
        <li><strong>Supabase</strong> — databaselagring (EU-region)</li>
        <li><strong>Stripe</strong> — betalingsbehandling</li>
        <li><strong>Resend</strong> — e-postutsending</li>
        <li><strong>Netlify</strong> — hosting</li>
      </ul>
      <p>
        Alle leverandører er underlagt databehandleravtale og håndterer persondata i tråd med GDPR.
      </p>

      <h3>Cookies og lokal lagring</h3>
      <p>
        Prismal bruker lokal lagring (localStorage) i nettleseren din for å lagre innstillinger
        som timepris, materialmal og firmainformasjon. Dette er funksjonelt nødvendig og ikke
        markedsføringscookies.
      </p>

      <h3>Dine rettigheter</h3>
      <p>
        Du har rett til innsyn i, retting av og sletting av dine personopplysninger.
        Ta kontakt på kontakt@prismal.no for å utøve disse rettighetene.
        Du kan også klage til <strong>Datatilsynet</strong> (datatilsynet.no) dersom du mener
        vi behandler dine data i strid med personvernlovgivningen.
      </p>

      <h3>Sletting</h3>
      <p>
        Dersom du avslutter abonnementet og ber om sletting, vil dine personopplysninger
        bli slettet innen 30 dager. Noen data kan beholdes lengre der det kreves av regnskapslov.
      </p>
    </>
  )
}

function Vilkaar() {
  return (
    <>
      <h2 style={{ marginTop: 0, color: '#1a1a1a' }}>Vilkår for bruk</h2>
      <p style={{ color: '#888', fontSize: '0.85rem' }}>Sist oppdatert: juni 2025</p>

      <h3>Leverandør</h3>
      <p>
        Prismal er en tjeneste levert av Hjelpeportalen AS, org.nr 937141319.
        Kontakt: kontakt@prismal.no
      </p>

      <h3>Tjenesten</h3>
      <p>
        Prismal er et nettbasert verktøy for generering av tilbudsdokumenter.
        Tjenesten er beregnet på profesjonell bruk av næringsdrivende.
      </p>

      <h3>Konto og tilgang</h3>
      <p>
        For å bruke Prismal må du registrere en konto med e-postadresse. Du er ansvarlig
        for å holde innloggingsinformasjonen konfidensiell. Gratis-planen gir 3 tilbud.
        Pro-abonnement gir ubegrenset tilgang.
      </p>

      <h3>Betaling og abonnement</h3>
      <p>
        Pro-abonnement koster 59 kr/mnd. Betaling skjer
        via Stripe. Abonnementet fornyes automatisk månedlig. Det er ingen bindingstid —
        du kan si opp når som helst via abonnementsportalen, og beholder tilgang ut
        inneværende betalingsperiode.
      </p>

      <h3>Ansvarsbegrensning</h3>
      <p>
        Prismal leverer verktøy for å lage tilbudsdokumenter. Vi gir ingen garanti for
        at generert innhold er juridisk eller kommersielt egnet for ditt formål.
        Hjelpeportalen AS er ikke ansvarlig for tap som følge av feil i generert innhold
        eller tjenesteforstyrrelser.
      </p>

      <h3>Akseptabel bruk</h3>
      <p>
        Tjenesten skal kun brukes til lovlige formål. Misbruk, forsøk på omgåelse av
        betalingsmur eller deling av konto kan medføre stenging av kontoen.
      </p>

      <h3>Endringer</h3>
      <p>
        Vi forbeholder oss retten til å endre disse vilkårene. Vesentlige endringer
        varsles på e-post til registrerte brukere med minst 14 dagers varsel.
      </p>

      <h3>Lovvalg</h3>
      <p>
        Disse vilkårene er underlagt norsk rett. Eventuelle tvister løses ved norske domstoler.
      </p>
    </>
  )
}
