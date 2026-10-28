# Scrapify: Jannat (operator workspace + full API)

```
backend-jannat/               Express + MongoDB API (auth, scans, listings, payments, reports, admin). Deploys on its own.
frontend/scrapify-frontend/   React + Vite operator app: register, log in, scan, list, payments.
```

## Run it locally

Backend (needs Node 20+ and a MongoDB, local or Atlas):

```
cd backend-jannat
cp .env.example .env        # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed                # demo data; every demo account has the password demo1234
npm run dev                 # http://localhost:5050
```

Frontend:

```
cd frontend/scrapify-frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5050/api
npm install
npm run dev                 # http://localhost:5173
```

Demo operator: `rahima@greenbin.bd` / `demo1234`.

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

## Operator endpoints (this folder)

`POST /api/scans/grade` (photo) then `POST /api/scans {gradingId, weight, composition?, condition?}`,
`GET /api/scans`, `POST /api/listings`, `GET /api/listings/mine`, `PATCH /api/listings/:id/cancel`,
and the payment routes under `/api/payments`. This backend also contains the recycler and admin routes,
so it alone serves every frontend.

## Deploy

One backend (`backend-jannat`) serves all three apps. Deploy it once, then each app separately.

1. **Database (MongoDB Atlas):** create a free cluster, a database user, and allow access from anywhere
   (`0.0.0.0/0`). Copy the connection string; it is `MONGO_URI`.
2. **Backend (Render / Railway):** root directory `backend-jannat`, build `npm install`, start `npm start`.
   * **Memory:** the CLIP model needs about **800 MB**, so choose a plan with at least **1 GB** of RAM. A 512 MB
     plan (Render's free one) crashes when the model loads.
   * Environment: `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET` (24+ random characters), `CLIENT_URL` (the three
     app addresses, comma separated), and `SSLCOMMERZ_STORE_ID` / `SSLCOMMERZ_STORE_PASSWORD` / `SSLCOMMERZ_LIVE`
     (`testbox` / `qwerty` / `false` is the SSLCommerz sandbox). `SERVER_URL` is the backend's public address, where
     SSLCommerz sends payment results; Render fills it in by itself. After paying, the recycler is sent back to the
     app they paid from; `FRONTEND_URL` is only the fallback.
   * Once, from the backend's shell: `npm run setup-db` (adds the plastic categories and areas; safe to run again),
     then `npm run create-admin` with `ADMIN_EMAIL` and `ADMIN_PASSWORD` set.
   * `npm run seed` empties the database for demo data; it refuses to run when `NODE_ENV=production`.
3. **Apps (Vercel / Netlify):** one project each, build `npm run build`, output `dist`, and
   `VITE_API_URL=https://<your-backend>/api`. `vercel.json` makes page refreshes work.

   | App | Root directory |
   | --- | --- |
   | Operator | `frontend/scrapify-frontend` |
   | Recycler | `noushin` |
   | Admin | `scrapify_admin` |

4. Put the three app addresses in the backend's `CLIENT_URL` and redeploy the backend.

## Payments

The recycler pays for a claimed batch from **My claims → Pay** in the recycler app (`noushin/`):

* **Pay online (SSLCommerz):** the recycler goes to the SSLCommerz checkout (bKash, Nagad, Rocket, cards) and comes
  back to My claims. The API marks the payment paid only after checking it with SSLCommerz's validation API.
* **bKash / Nagad by hand:** the recycler sends money to the operator's wallet number and enters the TrxID. The
  operator then marks it **Received** or **Not received** on the Payments page of the operator app, where they also
  set their bKash and Nagad numbers.

`.env.example` uses SSLCommerz's public sandbox store (`testbox` / `qwerty`): the checkout works but no real money
moves. For real money, register a merchant store at https://sslcommerz.com and set your own store ID, password and
`SSLCOMMERZ_LIVE=true`.
