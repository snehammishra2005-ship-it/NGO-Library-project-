# The Reading Room — Two-App Library System

A library system split into **two completely separate applications** that
share one database — not one site with two sections:

1. **Reader site** (`reader-site/`) — public. Anyone can browse the catalogue
   and check live availability, and readers can keep a wishlist / notify-me
   list. It talks **only** to a read-only public API and contains **no
   reference to the staff system anywhere** — no admin link, route, component,
   or API path exists in its code.
2. **Admin app** (`admin-app/`) — private staff console. Books, members,
   borrowing, invoices/receipts, maintenance, staff accounts, reports, and an
   audit log. Not linked from anywhere public; reached only by staff who know
   its address.

Both apps share **one backend** (`backend/`) that exposes two clearly
separated API layers over the same Oracle database:

```
/api/public/*   → reader site.  Read-only catalogue + the reader's own
                  wishlist/notify rows. No access to staff, members list,
                  invoices, borrowing, or any management data.
/api/admin/*    → admin app.     Full management. Every route requires a
                  staff token; sensitive routes require the ADMIN role.
                  Role checks run server-side on every request.
```

Borrowing still happens **in person** — the reader site is for discovery and
availability only. The UI of **both** apps is **strictly black & white** (no
colour anywhere); state is shown by fill, weight, and shape.

---

## Tech stack

| Layer            | Choice                                            |
|------------------|---------------------------------------------------|
| Reader frontend  | React + Vite + Tailwind (editorial, warm)         |
| Admin frontend   | React + Vite + Tailwind (dense back-office tool)   |
| Backend          | Node.js + Express (ESM), one server, two routers   |
| Database         | Oracle SQL (schema-first; in-memory mock for dev)  |
| Auth             | JWT with scopes: `reader` vs `staff` (+ role)      |

### Data modes (`DB_MODE` in `backend/.env`)
- **`mock`** (default) — a functional in-memory store seeded with sample
  data. No Oracle needed; great for development. Resets on restart.
- **`oracle`** — real Oracle via `oracledb`. Run `database/schema.sql` then
  `database/seed.sql`, install the Instant Client, set the env vars.

---

## Project structure

```
Library management/
├── database/          schema.sql · seed.sql (generated) · drop.sql
├── backend/           one Express server, two API layers
│   └── src/
│       ├── routes/    public.js  ·  admin.js
│       ├── controllers/  books · readerAuth · reader · admin/*
│       ├── repos/     books · auth · reader · borrow · members ·
│       │              invoices · maintenance · staff · reports ·
│       │              dashboard · audit   (each: mock + oracle path)
│       ├── middleware/ auth (reader/staff/admin) · rateLimit · errors
│       └── data/      seedData.js · store.js (mock)
├── reader-site/       public React app  → talks only to /api/public
└── admin-app/         private React app → talks only to /api/admin
```

---

## Getting started (mock mode — no database needed)

Open **three** terminals (PowerShell: use `;` not `&&`).

**1. Backend** — http://localhost:4000
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

**2. Reader site** — http://localhost:5173
```bash
cd reader-site
npm install
npm run dev
```

**3. Admin app** — http://localhost:5174
```bash
cd admin-app
npm install
npm run dev
```

Or install everything at once from the root: `npm run install:all`.

### Demo logins
| App        | Who         | Email                | Password    |
|------------|-------------|----------------------|-------------|
| Admin app  | Admin/Owner | `admin@library.test` | `admin123`  |
| Admin app  | Front-desk  | `staff@library.test` | `staff123`  |
| Reader site| Reader      | `aarav@reader.test`  | `reader123` |

**Roles:** the Admin sees everything; **Front-desk** sees a reduced menu —
dashboard, borrowing (issue/return), and member lookup only. Books, invoices,
maintenance, staff, and reports are Admin-only, enforced on the server.

---

## Security & separation

- The reader site's code contains **zero** admin routes/components/API paths.
- The admin app requires login before any data is fetched or shown.
- Server-side role checks on every admin route (not just hidden buttons).
- Admin app ships `robots.txt` (Disallow: /) and a `noindex` meta tag.
- Rate limiting on both login endpoints; JWTs expire (`JWT_EXPIRES_IN`).
- An **audit log** records who changed what and when (visible in the console).

> For a real deployment, host the admin app behind a private URL + IP
> allowlist or VPN, and keep the reader site and admin app on separate
> origins. The two frontends are already separate builds, so this is just a
> hosting choice.

---

## Data model (Oracle)

| Table                 | Purpose                                              |
|-----------------------|------------------------------------------------------|
| `staff`               | Staff accounts, role ADMIN / FRONT_DESK.             |
| `members`             | Readers/members; optional online login + membership. |
| `books`               | Catalogue; trigger syncs `status` to copies.         |
| `borrow_log`          | Physical issue/return + fines, by staff.             |
| `invoices`            | Membership fees / fines / other; paid or unpaid.     |
| `maintenance_records` | Damaged/lost books AND general upkeep, with cost.    |
| `wishlist`, `notify_requests` | Reader-account features.                     |
| `audit_log`           | Who changed what, when.                              |

---

## API summary

Public (`/api/public`): `GET /books`, `GET /books/genres`, `GET /books/:id`,
`POST /reader/signup`, `POST /reader/login`, `GET /reader/me`, and the reader's
own `GET/POST/DELETE /reader/wishlist` + `/reader/notify`.

Admin (`/api/admin`, staff token): `POST /login`, `GET /dashboard`, books
CRUD, `GET/POST/PUT /members`, `GET/POST /borrow-log(/return)`, invoices,
maintenance, staff, `GET /reports` (+ `/reports/most-borrowed.csv`), `GET
/audit`. Sensitive routes require the ADMIN role.

---

## Regenerating the Oracle seed
After editing `backend/src/data/seedData.js`:
```bash
cd backend && npm run gen:seed   # rewrites database/seed.sql with fresh bcrypt hashes
```

## Next ideas
- Auto-fulfil notify-me when a return brings a copy back.
- Cover-image upload to real storage (currently a URL + generated fallback).
- 2FA on admin login; pagination on large tables.
