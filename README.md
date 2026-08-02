# Expediva

A production-ready website for **Expediva**, a student travel startup at IIT Roorkee. It plans
group trips — treks, weekend getaways, adventure trips and long tours — that college students
enrol in through a Google Form. The site is a public, editorial travel-magazine experience with a
private admin panel for managing trips.

- **Public site** — home, trips listing with search/filters, trip detail with a live enrolment
  countdown, past-trips gallery, contact, 404.
- **Admin panel** (`/admin`) — JWT-protected dashboard to create, edit, delete trips, toggle
  enrolment, edit seats inline, and upload images to Cloudinary.
- **No payments on-site.** Each trip links to a Google Form; the payment QR and screenshot upload
  live inside that form.

Design direction is deliberately editorial (Fraunces display serif + Space Grotesk body, warm
ivory/forest-ink/burnt-orange palette, film grain, restrained Framer Motion + Lenis animations)
and explicitly avoids the generic "AI-generated" look.

---

## Tech stack

| Layer     | Choice                                                                    |
| --------- | ------------------------------------------------------------------------- |
| Frontend  | React 18, Vite, TypeScript, React Router v6, Tailwind CSS                  |
| Animation | Framer Motion + Lenis smooth scroll (both respect `prefers-reduced-motion`) |
| Data      | TanStack Query with a small typed API client                              |
| Backend   | Node.js, Express, TypeScript                                              |
| Database  | MongoDB (Atlas in prod) via Mongoose                                       |
| Images    | Cloudinary (admin uploads via multer → Cloudinary; secure URLs in Mongo)  |
| Auth      | JWT in an httpOnly cookie, single seeded admin, bcrypt-hashed password     |
| Validation| zod on both client forms and server routes                                |
| Security  | helmet, CORS locked to the client origin, rate limit on the login route   |

---

## Repository layout

```
Expediva/
├── shared/types.ts        # Trip types shared by client + server
├── server/                # Express API  → deploy to Render
│   ├── src/
│   │   ├── config/        # env validation, db, cloudinary
│   │   ├── models/        # Trip, Admin (Mongoose)
│   │   ├── middleware/    # auth, error handler, multer upload
│   │   ├── routes/        # trips, auth, upload, sitemap/robots
│   │   ├── validation/    # zod schemas
│   │   ├── seed.ts        # `npm run seed`
│   │   └── index.ts
│   ├── .env.example
│   └── render.yaml
└── client/                # React app  → deploy to Vercel
    ├── src/
    │   ├── pages/         # Home, Trips, TripDetail, Gallery, Contact, NotFound
    │   ├── admin/         # login, guard, dashboard, trip form
    │   ├── components/    # layout, motion, trips, ui
    │   ├── config/        # site.ts, testimonials.ts  (edit these, not components)
    │   ├── hooks/  lib/
    │   └── ...
    ├── .env.example
    └── vercel.json
```

Nothing site-wide is hard-coded in components. Contact details, socials, trust points and general
FAQs live in [`client/src/config/site.ts`](client/src/config/site.ts); testimonials in
[`client/src/config/testimonials.ts`](client/src/config/testimonials.ts).

---

## Prerequisites

- **Node.js ≥ 20** and npm.
- A **MongoDB** connection string — either MongoDB Atlas (recommended, see below) or a local
  `mongod`.
- A **Cloudinary** account (free tier) — only needed for admin image uploads. Everything else runs
  without it; uploads return `503` until it's configured, and you can paste image URLs directly in
  the admin form in the meantime.

---

## 1. MongoDB Atlas setup

1. Create a free account at <https://www.mongodb.com/cloud/atlas> and create an **M0 (free)** cluster.
2. **Database Access** → *Add New Database User*. Choose password auth, give it a username and a
   strong password, and the **Read and write to any database** role. Note the credentials.
3. **Network Access** → *Add IP Address*. For a Render-hosted API the simplest option is
   **Allow access from anywhere** (`0.0.0.0/0`); tighten later if you like.
4. **Database → Connect → Drivers**. Copy the connection string. It looks like:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Insert the password and add the database name `expediva` before the `?`:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/expediva?retryWrites=true&w=majority
   ```
   Put this in `server/.env` as `MONGODB_URI`.

---

## 2. Cloudinary setup

1. Create a free account at <https://cloudinary.com>.
2. On the **Dashboard**, find *Product Environment Credentials*: **Cloud name**, **API Key**,
   **API Secret**.
3. Put them in `server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=123456789012345
   CLOUDINARY_API_SECRET=your-api-secret
   CLOUDINARY_FOLDER=expediva
   ```
4. Uploads are stored under the `expediva/` folder. Deleting a trip also deletes its Cloudinary
   images (seed images from Unsplash are left alone).

> Skipping Cloudinary for now? Leave the three values blank. The site and admin still run; the
> trip form's **"paste an image URL"** field lets you attach images without uploading.

---

## 3. Run locally

From the repo root:

```bash
# install both apps
npm run install:all        # or: cd server && npm i  &&  cd ../client && npm i
```

### Server

```bash
cd server
cp .env.example .env        # then fill in MONGODB_URI, JWT_SECRET, admin creds, (Cloudinary)
npm run seed                # creates the admin user + 5 trips  (see below)
npm run dev                 # http://localhost:4000
```

### Client

```bash
cd client
cp .env.example .env.local  # VITE_API_URL=http://localhost:4000
npm run dev                 # http://localhost:5173
```

Open <http://localhost:5173>. The admin panel is at <http://localhost:5173/admin>.

---

## 4. Seed data & admin login

`npm run seed` (run inside `server/`) does two things:

1. **Upserts the admin account** from your env vars — `ADMIN_EMAIL` / `ADMIN_PASSWORD`
   (bcrypt-hashed) / `ADMIN_NAME`.
2. **Replaces the trips collection** with 5 realistic trips: Kasol–Kheerganga, Rishikesh rafting
   weekend, Chopta–Tungnath, Manali–Sissu, and Jibhi–Jalori (marked *completed* with a filled
   gallery so the past-trips page and home marquee have content). Dates are relative to today, so
   the seed never goes stale.

```bash
cd server
npm run seed             # wipes trips, reinserts the 5, upserts the admin
npm run seed -- --keep   # keep existing trips, only upsert the admin
```

**Log in to admin** with the credentials from your `.env`. With the defaults in `.env.example`:

- Email: `admin@expediva.in`
- Password: `changeme123`  ← **change this before going live.**

Go to <http://localhost:5173/admin/login>, sign in, and you land on the dashboard.

---

## 5. API reference

Base URL: `VITE_API_URL` (default `http://localhost:4000`). All errors return `{ "error": string }`.

| Method + Route                       | Access | Notes                                                       |
| ------------------------------------ | ------ | ----------------------------------------------------------- |
| `GET /api/trips`                     | Public | Filters: `status` (`upcoming`\|`past`), `category`, `difficulty`, `month` (1–12), `minPrice`, `maxPrice`, `search` |
| `GET /api/trips/:slug`               | Public | Single trip                                                 |
| `POST /api/auth/login`               | Public | Email + password → sets httpOnly cookie. Rate-limited       |
| `POST /api/auth/logout`              | Admin  | Clears the cookie                                           |
| `GET /api/auth/me`                   | Admin  | Session check                                              |
| `POST /api/trips`                    | Admin  | Create (zod-validated, slug auto-generated & de-duped)      |
| `PUT /api/trips/:id`                 | Admin  | Full edit                                                  |
| `PATCH /api/trips/:id/enrollment`    | Admin  | Toggle `enrollmentOpen`                                     |
| `PATCH /api/trips/:id/seats`         | Admin  | Update `seatsLeft` (clamped to `seatsTotal`)                |
| `DELETE /api/trips/:id`              | Admin  | Delete + remove Cloudinary images                          |
| `POST /api/upload`                   | Admin  | multipart `images` field, multi-file → `{ urls: [...] }`    |
| `GET /sitemap.xml`, `GET /robots.txt`| Public | SEO endpoints                                              |

### curl examples

```bash
API=http://localhost:4000

# public — list upcoming treks under ₹6000
curl "$API/api/trips?status=upcoming&category=trek&maxPrice=6000"

# public — one trip
curl "$API/api/trips/kasol-kheerganga-trek"

# admin — log in and keep the cookie jar
curl -c cookies.txt -X POST "$API/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@expediva.in","password":"changeme123"}'

# admin — toggle enrolment (use an _id from GET /api/trips)
curl -b cookies.txt -X PATCH "$API/api/trips/<TRIP_ID>/enrollment" \
  -H 'Content-Type: application/json' -d '{"enrollmentOpen":false}'

# admin — inline seat update
curl -b cookies.txt -X PATCH "$API/api/trips/<TRIP_ID>/seats" \
  -H 'Content-Type: application/json' -d '{"seatsLeft":4}'

# admin — upload images (requires Cloudinary configured)
curl -b cookies.txt -X POST "$API/api/upload" -F "images=@photo.jpg"
```

---

## 6. Environment variables

### `server/.env` (see `server/.env.example`)

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` \| `production` |
| `PORT` | API port (Render sets its own) |
| `MONGODB_URI` | Atlas connection string incl. `/expediva` db name |
| `JWT_SECRET` | ≥ 16 chars. Generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | Token lifetime, default `7d` |
| `CLIENT_ORIGIN` | Browser origin(s) allowed by CORS. Comma-separate for previews |
| `PUBLIC_SITE_URL` | Public site URL, used in `sitemap.xml` / `robots.txt` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` / `_FOLDER` | Cloudinary (uploads 503 if blank) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | Seeded admin account |

### `client/.env.local` (see `client/.env.example`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Base URL of the API (no trailing slash) |
| `VITE_SITE_URL` | Canonical site URL for OG tags / JSON-LD |

> Everything in the client `.env` ships in the JS bundle — never put secrets there.

---

## 7. Deploy checklist

The two apps deploy independently. **Deploy the API (Render) first** so you know its URL, then the
client (Vercel), then come back and set the API's `CLIENT_ORIGIN` to the real Vercel domain.

### A. Database — MongoDB Atlas

- [ ] M0 cluster created, DB user created, Network Access allows Render (`0.0.0.0/0` is fine).
- [ ] `MONGODB_URI` in hand, with `/expediva` before the `?`.

### B. API — Render

- [ ] New **Web Service** from the repo. **Root Directory:** `server`
      (or import `server/render.yaml` as a Blueprint).
- [ ] Build command: `npm install && npm run build` — Start command: `npm start`
- [ ] Health check path: `/api/health`
- [ ] Environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` = Atlas string
  - [ ] `JWT_SECRET` = long random string
  - [ ] `CLIENT_ORIGIN` = your Vercel URL(s), comma-separated, **no trailing slash**
        (e.g. `https://expediva.vercel.app,https://www.expediva.in`)
  - [ ] `PUBLIC_SITE_URL` = your public site URL
  - [ ] `CLOUDINARY_*` = your Cloudinary credentials
  - [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` (**strong password**)
- [ ] After first deploy, seed the production DB. Either run `npm run seed` locally with the
      **production** `MONGODB_URI` in your `.env`, or open a Render **Shell** and run `npm run seed`.
- [ ] Note the API URL, e.g. `https://expediva-api.onrender.com`.

> The Render free tier sleeps after inactivity; the first request after a nap takes a few seconds.

### C. Client — Vercel

- [ ] Import the repo. **Root Directory:** `client`. Framework preset: **Vite** (auto-detected via
      `vercel.json`).
- [ ] Environment variables:
  - [ ] `VITE_API_URL` = the Render API URL (no trailing slash)
  - [ ] `VITE_SITE_URL` = the Vercel/production URL
- [ ] In [`client/vercel.json`](client/vercel.json), update the two `/robots.txt` and `/sitemap.xml`
      rewrite destinations to your Render host so crawlers find them at the site root.
- [ ] Deploy. `vercel.json` already handles SPA fallback and long-cache headers for `/assets`.

### D. Wire the two together (CORS)

- [ ] Set the API's `CLIENT_ORIGIN` to the exact Vercel domain(s) and redeploy the API.
      A mismatch here is the usual cause of "blocked by CORS" errors in the browser console.
- [ ] Because the client (Vercel) and API (Render) are on different domains, auth uses a
      cross-site cookie. This is already handled in code (`SameSite=None; Secure` in production) —
      just make sure both are served over **HTTPS** (they are by default).
- [ ] Smoke test: open the site, load `/trips`, open a trip, then log in at `/admin/login` and
      toggle a trip's enrolment. If login "works" but the dashboard bounces back to login, the
      cookie isn't sticking — recheck `CLIENT_ORIGIN` and that both sides are HTTPS.

---

## 8. Performance & SEO notes

- Routes are code-split; images are lazy-loaded with responsive `srcset` (Cloudinary/Unsplash
  transforms) and `f_auto,q_auto`-style sizing. Lighthouse mobile scores land in the high-80s/90s
  on the seeded content; production Cloudinary (AVIF/WebP, same-CDN) does better still.
- Per-page `<title>`/meta/OG tags via `react-helmet-async`; `TouristTrip` JSON-LD on trip pages;
  `Organization` JSON-LD on the home page.
- `sitemap.xml` and `robots.txt` are served by Express (one sitemap entry per trip) and proxied to
  the site root by `vercel.json`.
- **Prerendering (optional).** This is a client-rendered SPA, so crawlers that don't execute JS see
  an empty shell. Google renders JS and indexes it fine, and the meta/JSON-LD above cover link
  previews. If organic search becomes a priority, add prerendering without a rewrite of the app:
  put [Prerender.io](https://prerender.io) in front (a Vercel middleware or the Prerender CDN that
  serves bots static snapshots), or migrate the client to **Next.js**/SSR and reuse the same API
  and components. Start with Prerender.io — it's a config change, not a rewrite.

---

## 9. Handy scripts (repo root)

```bash
npm run install:all     # install server + client
npm run dev:server      # API dev server
npm run dev:client      # Vite dev server
npm run seed            # seed the database
npm run build:server    # tsc → server/dist
npm run build:client    # tsc + vite build → client/dist
npm run typecheck       # typecheck both apps
```
