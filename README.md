# The Reading Room — Library System (two products)

This repository is organised as **two separate, independently deliverable
products** that share one backend:

```
Library management/
├── admin-product/     → handed to the library/client (the system of record)
│   ├── backend/       Express API + Oracle (or in-memory mock) — the engine
│   ├── admin-app/     Private staff console (Admin + Front-desk roles)
│   └── database/      Oracle schema · seed · drop
└── reader-product/    → published on the internet for public readers
    └── (React reader site: browse + availability + reader accounts)
```

### How the split works
- **`admin-product/`** is the complete back office **and** hosts the backend.
  The client runs this. Its backend exposes two sealed API layers over one
  database: a private `/api/admin/*` for the staff console, and a read-only
  `/api/public/*` for the reader site.
- **`reader-product/`** is only the public frontend. It reads from the
  backend's `/api/public/*`. It contains **zero** staff/admin code, links, or
  routes. It is "managed" by the admin side purely through the shared
  backend — the admin changes data, the reader site reflects it.

Nothing about the runtime flow changed in this split: the admin console still
manages books, members, borrowing, invoices, maintenance, staff, and reports;
the reader site still shows the live catalogue and availability.

---

## Quick start (all local, no database needed)

Three terminals (PowerShell: use `;` not `&&`). From the repo root you can
also `npm run install:all` first.

**1. Backend** (in the admin product) — http://localhost:4000
```bash
cd admin-product/backend
npm install
cp .env.example .env
npm run dev
```

**2. Admin console** — http://localhost:5174
```bash
cd admin-product/admin-app
npm install
npm run dev
```

**3. Reader site** — http://localhost:5173
```bash
cd reader-product
npm install
npm run dev
```

### Demo logins
| Product        | Who         | Email                | Password    |
|----------------|-------------|----------------------|-------------|
| Admin console  | Admin/Owner | `admin@library.test` | `admin123`  |
| Admin console  | Front-desk  | `staff@library.test` | `staff123`  |
| Reader site    | Reader      | `aarav@reader.test`  | `reader123` |

The Admin sees everything; **Front-desk** sees a reduced menu (dashboard,
borrowing, member lookup). Enforced on the server.

---

## Delivering the two products
- **Hand the client `admin-product/`** — a self-contained system (backend +
  console + DB scripts). Host its backend, keep the console private (private
  URL / IP allowlist / VPN; it already ships `robots.txt` + `noindex`).
- **Publish `reader-product/`** — build and deploy the static frontend, and
  point it at the backend's public origin with `VITE_API_BASE`
  (see `reader-product/README.md`). Add its origin to the backend's
  `CORS_ORIGINS`.

Each product has its own README with details:
[admin-product/README.md](admin-product/README.md) ·
[reader-product/README.md](reader-product/README.md)

---

## Data model & modes
- `backend/.env` `DB_MODE=mock` (default) runs a functional in-memory store —
  no Oracle needed. `DB_MODE=oracle` uses the real database
  (`admin-product/database/schema.sql` then `seed.sql`).
- Tables: `staff`, `members`, `books`, `borrow_log` (+ fines), `invoices`,
  `maintenance_records`, `wishlist`, `notify_requests`, `audit_log`.
- Strictly **black & white** UI across both products.
