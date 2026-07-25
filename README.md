# SpaPlus Global

The official brand website for SpaPlus Global. Its permanent public address
will be `global.spaplus.co`.

The website presents the SpaPlus vision, story, leadership and international
market presence. Israel and Canada are live, with the United States marked as
coming soon.

## Legal entity

- The Israeli operating company must always be identified in English as
  `GLOBAL SPA MANAGEMENT LTD`.
- Israeli company number: `516106911`.
- Do not translate or display the registered company name in Hebrew on the
  website, legal pages, forms, email templates or public company notices.
- `SpaPlus Global` is the public brand name. Where legal identification is
  required, use: `SpaPlus Global, operated by GLOBAL SPA MANAGEMENT LTD`.

## Languages

English, Hebrew, Canadian French, Russian, Greek, Italian, Hungarian, Polish
and Spanish.

## Development

```bash
npm install
npm run dev
npm run build
```

The main application lives in `app`. The `codepen` directory is an automatically
prepared static preview used by GitHub Pages until the production domain is
connected.

## Domain architecture decision

- `global.spaplus.co` is reserved for this global brand website.
- `spaplus.co` is reserved for the future United States booking website.
- Until the United States website launches, `spaplus.co` and `www.spaplus.co`
  may use a temporary HTTP 302 redirect to `global.spaplus.co`.
- The language structure on the permanent site will use paths such as `/en/`,
  `/he/` and `/fr/`, rather than a `?lang=` query parameter.
- Country partner pages remain inside the global site, for example
  `/en/partners/` and `/he/partners/`.
- The global and United States websites must keep separate deployments,
  analytics, security configuration and application secrets.
- No DNS, redirect or production-domain change may be made until Adir provides
  explicit access and authorization for `spaplus.co`.
