# Asla Village Council Website

Content-driven website for مجلس قروي عسلة (Asla Village Council). Public site in Arabic
(RTL) for citizens (news, jobs, tenders, reports, gallery, contact) plus an admin panel
for council staff to manage that content.

Full implementation reference: [`docs/SPEC.md`](docs/SPEC.md).

## Stack
- `backend/` — Express + Prisma (PostgreSQL) + JWT auth + Multer uploads. Entry: `src/server.js`.
- `frontend/` — React + Vite + TypeScript + Tailwind CSS v4, RTL Arabic UI (Cairo / El Messiri fonts).

## Conventions
- API responses: `{ success, data, message }`. Errors return Arabic messages with 400/401/404/500.
- Admin routes require `Authorization: Bearer <token>` (JWT, 12h expiry); public GETs are open.
- `town_info` and `contact_info` are singleton tables (fixed `id = 1`).
- Snake_case DB columns map to camelCase Prisma fields via `@map`.
- Uploaded files live in `backend/uploads/`, served at `/uploads/...` (gitignored).

## Setup
See [`README.md`](README.md) for install/migrate/seed/run steps for both apps.
