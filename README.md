# Prismal.no — MVP

AI-drevet prismal for norske håndverkere.

## Kom i gang lokalt

```bash
npm install
cp .env.example .env
# Fyll inn ANTHROPIC_API_KEY i .env
npm run dev
```

Netlify CLI anbefales for lokal testing av funksjoner:
```bash
npm install -g netlify-cli
netlify dev
```

## Deploy til Netlify

### 1. Opprett GitHub-repo
```bash
git init
git add .
git commit -m "feat: MVP prismal"
git branch -M main
git remote add origin https://github.com/DITT_BRUKERNAVN/prismal.git
git push -u origin main
```

### 2. Koble til Netlify
1. Gå til [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Velg GitHub-repoen
3. Build settings fylles inn automatisk fra `netlify.toml`
4. Trykk **Deploy site**

### 3. Legg inn API-nøkkel
1. Netlify dashboard → **Site configuration** → **Environment variables**
2. Legg til: `ANTHROPIC_API_KEY` = din nøkkel fra [console.anthropic.com](https://console.anthropic.com)
3. Re-deploy (automatisk ved neste push)

### 4. Koble prismal.no
1. Netlify dashboard → **Domain management** → **Add domain**
2. Skriv inn `prismal.no`
3. Oppdater DNS hos Domeneshop: pek CNAME/A-record til Netlify-adressen

## Filstruktur

```
prismal/
├── index.html
├── package.json
├── vite.config.js
├── netlify.toml              ← build + functions-konfig
├── .env.example              ← kopier til .env, legg inn API-nøkkel
├── .gitignore
├── netlify/
│   └── functions/
│       └── generer-tilbud.js ← Claude API-proxy (server-side)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── components/
    │   ├── TilbudSkjema.jsx  ← skjemaflyt
    │   └── TilbudPreview.jsx ← forhåndsvisning + redigering
    ├── api/
    │   ├── claude.js         ← kaller Netlify function
    │   └── pdf.js            ← jsPDF-eksport
    └── styles/
        └── index.css
```

## Neste steg (Fase 2–3)

- [ ] Stripe-integrasjon (betalingsmur etter 3 tilbud)
- [ ] Brukerkontoer (Supabase eller Netlify Identity)
- [ ] Personlig prisliste
- [ ] Tilbudshistorikk
- [ ] Logo-opplasting på PDF
