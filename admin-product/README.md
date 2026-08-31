# Library — Admin Product (system of record)

This is the **private product handed to the library/client**. It contains
the complete system of record and the staff console:

```
admin-product/
├── backend/      Node + Express API + Oracle (or in-memory mock) — the engine
├── admin-app/    Private React staff console (Admin + Front-desk roles)
└── database/     Oracle schema.sql · seed.sql · drop.sql
```

The backend here powers **everything** — the staff console AND the public
reader site. The reader site (shipped as a separate product) is just a
frontend that reads from this backend's public API. In other words, **this
product manages the reader console through the backend**, exactly as the
combined project did.

## Run it (local, no database needed)

Two terminals (PowerShell: use `;` not `&&`).

**1. Backend** — http://localhost:4000
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**2. Admin console** — http://localhost:5174
```bash
cd admin-app
npm install
npm run dev
```

Or from this folder: `npm run install:all`, then `npm run dev:backend` and
`npm run dev:admin` in separate terminals.

### Staff logins
| Role         | Email                | Password   |
|--------------|----------------------|------------|
| Admin/Owner  | `admin@library.test` | `admin123` |
| Front-desk   | `staff@library.test` | `staff123` |

## The two API layers (one backend, two sealed doors)
- `/api/public/*` — read-only catalogue + reader accounts. Used by the
  **reader product**. No access to staff/members/invoices/borrowing.
- `/api/admin/*` — full management. Requires a staff token; sensitive routes
  require the ADMIN role. Used by the admin console here.

## Hosting notes
- Keep the backend reachable by the reader site at its public origin — set
  `VITE_API_BASE` in the reader product to this backend's URL when they are
  deployed on different hosts.
- Keep the admin console private (private URL / IP allowlist / VPN). It
  already ships `robots.txt` (Disallow: /) and a `noindex` meta tag.
- Switch `backend/.env` `DB_MODE=oracle` to use the real Oracle database
  (run `database/schema.sql` then `database/seed.sql`). See `backend/.env.example`.
