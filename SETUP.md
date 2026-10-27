# Scrapify: Umama (admin workspace)

```
backend/            Express + MongoDB API: auth, locations/categories, admin (users, rates, locations, reports, stats).
scrapify_admin/     React + Vite admin app: log in, dashboard, users, price rates, reports.
frontend/           The static landing site (unchanged).
_backup-original-backend/  Your original backend, kept in case you want it. Delete it when you don't.
```

The old backend had only auth and admin and used its own `{success,message,data}` answers. It was replaced by the
shared contract below so the admin app, the operator app and the recycler app all use the same API.

## Run it locally

```
cd backend && cp .env.example .env && npm install && npm run seed && npm run dev   # http://localhost:5000
cd scrapify_admin && cp .env.example .env && npm install && npm run dev            # http://localhost:5173
```

Demo admin: `admin@scrapify.app` / `demo1234`. On a real database, set `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
and run `npm run create-admin` instead of seeding.

## The shared API contract

All three backends (Jannat, Noushin, Umama) use the same database models, the same login and the same
JSON shapes, so any frontend can talk to any backend. Errors are always `{ "message": "..." }`.

| Endpoint | Who | Answer |
| --- | --- | --- |
| `POST /api/auth/register` `{role,name,org,location,email,password}` | public (operator or recycler) | `201 { user }` with `status: "pending"` |
| `POST /api/auth/login` `{email,password}` | public | `{ token, user }`; `403` while pending/suspended |
| `GET /api/auth/me` | any logged-in user | `{ user }` |
| `GET /api/locations` | public | `{ locations: [name] }` |

Send the token as `Authorization: Bearer <token>`. New accounts are `pending` until an admin approves them.
Passwords: at least 6 characters, with a number. The first admin is created with `npm run create-admin`.

## Admin endpoints (this folder, admin only)

`GET /api/admin/stats`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/status {status, note}`,
`POST|PATCH|DELETE /api/admin/categories`, `POST|DELETE /api/admin/locations`,
`GET /api/admin/reports`, `PATCH /api/admin/reports/:id/resolve`.

## Deploy

Backend root `backend` (`npm start`); frontend root `scrapify_admin` (`npm run build`, output `dist`,
`VITE_API_URL=https://<backend>/api`). Set the backend's `CLIENT_URL` to the deployed frontend address.
