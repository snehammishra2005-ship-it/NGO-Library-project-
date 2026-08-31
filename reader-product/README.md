# Library — Reader Product (public site)

This is the **public product published for readers on the internet**. It is a
single React frontend: browse the catalogue, check live availability, and
(optionally) keep a wishlist / notify-me list.

It contains **no staff/admin code of any kind**. It only reads from the
backend's public API (`/api/public/*`). That backend lives in the **admin
product** and is hosted by the library/owner — so the reader site is
"managed" by the admin side through the shared backend, without ever exposing
it.

## Run it (local dev)

The backend (in `../admin-product/backend`) must be running on port 4000
first. Then:

```bash
npm install
npm run dev      # http://localhost:5173
```

Vite proxies `/api` to the backend on `localhost:4000` automatically, so no
extra config is needed locally.

### Reader login (demo)
`aarav@reader.test` / `reader123`

## Deploying separately (e.g. Vercel / Netlify)

When the reader site is hosted apart from the backend, tell it where the
backend's **public** API lives:

1. Copy `.env.example` to `.env`
2. Set `VITE_API_BASE` to the backend's origin, e.g.
   `VITE_API_BASE=https://api.yourlibrary.com`
3. `npm run build` → deploy the `dist/` folder.

The backend must allow this site's origin (CORS) — add it to `CORS_ORIGINS`
in the backend's `.env`.
