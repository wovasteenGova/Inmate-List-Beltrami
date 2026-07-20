# Inmate List Beltrami

Beltrami County inmate roster search (Nuxt 4 + Nitro scraper).

## Local dev

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Netlify

Connect this repo in Netlify with:

- **Build command:** `npm run build`
- **Publish directory:** (leave default — Nuxt Netlify preset writes `dist`)

The app uses Nitro's `netlify` preset for server routes under `/api/beltrami`.
