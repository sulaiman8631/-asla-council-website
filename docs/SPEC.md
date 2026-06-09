# Asla Village Council Website — Full Documentation
**موقع مجلس قروي عسلة — التوثيق الكامل**

This is the detailed reference for the project summarized in `CLAUDE.md`. Build against
this document. UI text shown to citizens is Arabic; this doc is written in English for
implementation clarity, with the Arabic labels to use given inline.

---

## 1. Overview

A content-driven website that lets the residents of **عسلة (Asla)** follow council news
and services, and lets a council administrator publish and manage that content.

- **Audience:** general public (citizens) + one or more council administrators.
- **Languages:** Arabic (primary, RTL). Optional English later — not required for v1.
- **Goal:** simple, fast, trustworthy, mobile-first.

---

## 2. User roles & access

| Role | Auth | Can do |
|------|------|--------|
| **Citizen (public)** | None — never logs in | View all published content: news, town info, jobs, tenders, reports, gallery, contact + map. Send a contact message. |
| **Admin** | Username + password → JWT | Everything citizens can do **plus** create/edit/delete all content and edit town/contact info. |

There is no public registration anywhere on the site. The only credentialed account is the
admin, created by the `seed.js` script (and changeable from the dashboard).

---

## 3. Features → pages

### Public site (`/`)
1. **Home (`/`)** — logo + town name, hero, key stats (population / area / founded),
   latest 3–4 news cards, quick links to Jobs, Tenders, Reports.
2. **About the town (`/about`)** — `عن البلدة`: description, history, mayor/council info,
   statistics, a few representative photos.
3. **News (`/news`)** — `الأخبار`: paginated list of news cards (image, title, date, excerpt).
4. **News detail (`/news/:id`)** — full article with cover image and date.
5. **Jobs (`/jobs`)** — `الوظائف`: council job advertisements (title, type, deadline,
   status open/closed, description, optional PDF). Closed jobs are clearly marked.
6. **Tenders (`/tenders`)** — `العطاءات / المناقصات`: reference no., title, publish date,
   deadline, status, downloadable PDF.
7. **Reports / About-us documents (`/reports`)** — `التقارير`: downloadable PDF reports
   grouped by category/year.
8. **Gallery (`/gallery`)** — `معرض الصور`: grid of town images with captions, lightbox.
9. **Contact (`/contact`)** — `اتصل بنا`: address, phone, email, working hours, social links,
   **Google Maps embed** of the council location, and a contact form (POST message).

### Admin panel (`/admin`)
- **Login (`/admin/login`)** — username + password.
- **Dashboard (`/admin`)** — counts + shortcuts; protected by JWT (redirect to login if no token).
- CRUD screens (list + create/edit forms + delete) for: **News, Jobs, Tenders, Reports,
  Gallery**, plus single-record editors for **Town Info** and **Contact Info**.
- View incoming contact messages and mark as read.

---

## 4. Data model (relational — PostgreSQL via Prisma)

The database is **relational**. Define everything in `backend/prisma/schema.prisma` and
apply it with Prisma migrations. Every table has an integer (or `cuid`) primary key `id`
and `created_at` / `updated_at` timestamps unless noted. Snake_case columns in SQL map to
camelCase in Prisma via `@map`.

### Relationships (overview)
- `admins` **1—∞** `news`, `jobs`, `tenders`, `reports` (each content row has `created_by`).
- `categories` **1—∞** `news` and **1—∞** `reports` (a category groups many items; `kind`
  distinguishes a news category from a report category).
- `town_info` **1—∞** `town_statistics` (the singleton town row owns its extra stat cards).
- `gallery_images`, `contact_info`, `contact_messages` stand alone.

> Use `ON DELETE RESTRICT` for `created_by` (don't delete an admin who authored content) and
> `ON DELETE SET NULL` for the optional `category_id` (deleting a category leaves items uncategorized).

### Tables

**admins**
```
id             PK
username       text, unique, not null
password_hash  text, not null        // bcrypt only — never store plaintext
role           text, not null, default 'admin'
```

**categories**  — shared lookup table for news & reports
```
id     PK
name   text, not null                // Arabic, e.g. عام / صحة / مالي
kind   text, not null                // enum: 'news' | 'report'
UNIQUE (name, kind)
```

**news**
```
id           PK
title        text, not null          // Arabic
body         text, not null          // Arabic, long text
cover_image  text, null              // uploaded file path/URL
category_id  FK → categories.id, null  (ON DELETE SET NULL)
created_by   FK → admins.id, not null  (ON DELETE RESTRICT)
is_published boolean, not null, default true
published_at timestamptz, not null, default now()
```

**jobs**
```
id           PK
title        text, not null          // Arabic
description  text, not null          // Arabic
requirements text, null              // Arabic
type         text, null              // دوام كامل / جزئي / مؤقت
location     text, not null, default 'عسلة'
deadline     date, not null
status       text, not null, default 'open'   // enum: 'open' | 'closed'
attachment   text, null              // optional PDF
created_by   FK → admins.id, not null
```

**tenders**
```
id            PK
reference_no  text, unique, not null  // رقم العطاء
title         text, not null          // Arabic
description   text, null              // Arabic
document      text, not null          // PDF path/URL
publish_date  date, not null, default now()
deadline      date, not null
status        text, not null, default 'open'   // enum: 'open' | 'closed'
created_by    FK → admins.id, not null
```

**reports**
```
id           PK
title        text, not null          // Arabic
description  text, null              // Arabic
file         text, not null          // PDF path/URL
category_id  FK → categories.id, null  (ON DELETE SET NULL)
year         integer, null
published_at timestamptz, not null, default now()
created_by   FK → admins.id, not null
```

**gallery_images**
```
id          PK
url         text, not null           // uploaded image path/URL
caption     text, null               // Arabic
sort_order  integer, not null, default 0
```

**town_info**  — singleton (enforce a single row; e.g. fixed id = 1)
```
id          PK
name        text, not null, default 'عسلة'
tagline     text, null               // Arabic slogan
about       text, null               // Arabic description
history     text, null               // Arabic
population  integer, null            // عدد السكان
area        text, null               // المساحة
established text, null               // سنة التأسيس
mayor_name  text, null               // رئيس المجلس
logo        text, null               // uploaded logo path/URL
```

**town_statistics**  — extra stat cards belonging to town_info
```
id            PK
town_info_id  FK → town_info.id, not null  (ON DELETE CASCADE)
label         text, not null          // Arabic
value         text, not null
sort_order    integer, not null, default 0
```

**contact_info**  — singleton (fixed id = 1). Fixed social set → plain columns, not a table.
```
id            PK
address       text, null              // Arabic
phone         text, null
email         text, null
working_hours text, null              // Arabic
map_embed_url text, null              // Google Maps embed <iframe src=...>
lat           double precision, null
lng           double precision, null
facebook      text, null
instagram     text, null
twitter       text, null
youtube       text, null
```

**contact_messages**
```
id        PK
name      text, not null
email     text, null
subject   text, null
message   text, not null
is_read   boolean, not null, default false
```

---

## 5. API contract

Base URL: `/api`. Standard response shape:
```json
{ "success": true, "data": { }, "message": "" }
```
Errors return `{ "success": false, "message": "..." }` with status 400/401/404/500.

### Public (open, GET unless noted)
```
GET  /api/town                 → TownInfo singleton
GET  /api/contact-info         → ContactInfo singleton
GET  /api/news                 → list (query: ?page, ?limit, ?category)
GET  /api/news/:id             → one article
GET  /api/jobs                 → list (?status)
GET  /api/jobs/:id
GET  /api/tenders              → list (?status)
GET  /api/tenders/:id
GET  /api/reports              → list (?year, ?category)
GET  /api/gallery              → list
POST /api/contact              → submit a contact message (rate-limit this)
```

### Auth
```
POST /api/auth/login           → { username, password } → { token, admin }
```

### Admin (all require header `Authorization: Bearer <token>`)
```
POST   /api/news        PUT /api/news/:id        DELETE /api/news/:id
POST   /api/jobs        PUT /api/jobs/:id        DELETE /api/jobs/:id
POST   /api/tenders     PUT /api/tenders/:id     DELETE /api/tenders/:id
POST   /api/reports     PUT /api/reports/:id     DELETE /api/reports/:id
POST   /api/gallery     DELETE /api/gallery/:id
PUT    /api/town                 # update town info
PUT    /api/contact-info         # update contact info
GET    /api/contact              # list messages
PATCH  /api/contact/:id/read     # mark read
DELETE /api/contact/:id
POST   /api/upload               # multipart/form-data → { url } (image or pdf)
```

---

## 6. Auth flow (admin only)
1. Admin posts credentials to `/api/auth/login`.
2. Server verifies username + bcrypt-compares password, signs a JWT (`{ id, role }`,
   expires ~12h) with `JWT_SECRET`.
3. Frontend stores the token **in memory / React state for the admin session**
   (acceptable to use `localStorage` only in the real Vite app, NOT in chat artifacts).
4. Axios attaches `Authorization: Bearer <token>` to admin requests.
5. `auth` middleware verifies the token on every `/api/<resource>` write route and the
   admin GET routes; returns 401 if missing/invalid. Public GET routes skip it.

---

## 7. File uploads
- Endpoint `POST /api/upload` (admin-only), `multipart/form-data`, field name `file`.
- Use Multer with disk storage in `backend/uploads/`; serve statically at `/uploads/...`.
- Validate: images `image/jpeg|png|webp` ≤ 3 MB; documents `application/pdf` ≤ 10 MB.
- Return `{ success: true, data: { url: "/uploads/<filename>" } }`.
- `uploads/` is gitignored. (For production, consider Cloudinary/S3 — note it, don't build it for v1.)

---

## 8. Google Map
- Admin pastes a Google Maps **embed iframe src** into `ContactInfo.mapEmbedUrl`.
- Contact page renders it inside a responsive iframe wrapper.
- No Google API key is required for a basic place embed.

---

## 9. Environment variables (`backend/.env`)
```
PORT=5000
DATABASE_URL=postgresql://asla:password@127.0.0.1:5432/asla_council?schema=public
JWT_SECRET=change-me-to-a-long-random-string
ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-me   # used once by the seed script, then change it from the dashboard
CLIENT_URL=http://localhost:5173
```
`DATABASE_URL` is the Prisma connection string (local Postgres, or a hosted one like
Neon/Supabase/Railway). Prisma reads it automatically.
Frontend `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```
Always commit `.env.example`, never `.env`.

---

## 10. Setup & run
```bash
# 1. Database: have PostgreSQL running locally (or use a hosted Postgres in DATABASE_URL)
#    e.g. create a database named asla_council and a user matching DATABASE_URL.
# 2. Backend
cd backend && npm install
cp .env.example .env        # then edit values (esp. DATABASE_URL)
npx prisma migrate dev      # creates the relational tables from schema.prisma
npx prisma generate         # generates the Prisma Client
npm run seed                # creates the admin + town/contact singletons
npm run dev                 # http://localhost:5000

# 3. Frontend
cd ../frontend && npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

> Useful: `npx prisma studio` opens a GUI to inspect/edit the relational data.

---

## 11. Seeding (`backend/prisma/seed.js`, run via `npm run seed`)
- Creates one `admins` row from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (bcrypt-hashed) if none exists.
- Inserts the `town_info` and `contact_info` singleton rows (fixed id = 1) with `name = "عسلة"`.
- Seeds a few `categories` (news + report kinds).
- Optionally inserts 2–3 sample news/jobs/tenders (linked to the admin via `created_by`) so the UI isn't empty on first run.
- Wire it up with Prisma's seed config in `package.json`: `"prisma": { "seed": "node prisma/seed.js" }`.

---

## 12. Security checklist
- bcrypt password hashing; never return the hash in any response.
- Validate and sanitize all input (use `express-validator` or manual checks).
- `helmet`, `cors` restricted to `CLIENT_URL`, and rate-limit `POST /api/contact` and `/api/auth/login`.
- File-type + size validation on every upload.
- Generic error messages to clients; detailed logs server-side only.

---

## 13. RTL / Arabic notes
- Set `dir="rtl"` and `lang="ar"` on `<html>` (in `index.html`) and the root layout.
- Use an Arabic-friendly Google Font (e.g. *Cairo*, *Tajawal*, or *El Messiri* for headings).
- Tailwind: prefer logical utilities; mirror icons/arrows for RTL.
- Format dates in Arabic, e.g. `new Intl.DateTimeFormat('ar', {dateStyle:'long'})`.

---

## 14. Acceptance criteria (definition of done)
- [ ] A citizen can open the site with no account and view: home, about/town info (incl.
      population & images & logo), news list + detail, jobs, tenders (with PDF download),
      reports (with PDF download), gallery, and contact page with a working Google map.
- [ ] A citizen can submit the contact form successfully.
- [ ] All public pages are Arabic and render correctly in RTL on mobile and desktop.
- [ ] Admin can log in; wrong credentials are rejected.
- [ ] Admin can create, edit, and delete every content type, and edit town & contact info,
      with image/PDF uploads working.
- [ ] Admin routes are inaccessible without a valid token; public routes never require auth.
- [ ] `npm run seed` produces a working admin + town/contact singletons.
- [ ] No secrets are committed; `.env.example` is present for both apps.
