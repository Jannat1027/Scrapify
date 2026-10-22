# Scrapify backend

The Express + MongoDB API for the Scrapify frontend. It replaces the three
simulated parts of the frontend: `DataContext.jsx` (the database),
`AuthContext.jsx` (login) and `aiGrading.js` (photo grading).

## Run it

```bash
cd scrapify-backend
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm run seed             # loads the demo data (wipes the database first)
npm run dev              # http://localhost:5000
```

Every demo account uses the password `demo1234`:
`rahima@greenbin.bd` (operator), `tanvir@polymerloop.com` (recycler), `admin@scrapify.app` (admin).

## Folders

```
src/
  server.js          starts the server (connect to MongoDB, then listen)
  app.js             Express app: CORS, JSON, routes, error handling
  config/            env.js (settings from .env), db.js (MongoDB connection)
  models/            User, Category (with rates), Location, Scan, Listing, Report
  routes/            auth, catalog, scans, listings, reports, admin
  controllers/       what each route does
  middleware/        auth.js (JWT), requireRole.js, upload.js (multer), validate.js (zod), error.js
  utils/             pricing.js, grading.js, listingRules.js, validation.js, ids.js, seed.js
  data/seed.js       the demo data, copied from the frontend
postman/             Postman collection with every endpoint
```

## How it fits the frontend

- Every record keeps the frontend's string id (`u1`, `SC-1042`, `LS-2210`, `RP-31`).
  Mongo's `_id`, `__v` and `passwordHash` are never sent, so pages can keep using `row.id`.
- Categories and rates are one collection: `GET /api/categories` returns
  `{ id, name, note, icon, clean, light, heavy, source, updated }`.
- `GET /api/locations` returns plain names, like the frontend's list. It is public
  because the sign-up form needs it before login.
- Listings come with `operator` (`{ id, name, org, location, rating }`) and `recycler`
  profiles, so pages don't need the whole users table.
- Saved scans come with `estimate` (the price range from today's rates) and `listingId`.
- Errors are always `{ message }`, ready to show in a toast.

## Endpoints

| Who | Method and path | What it does |
| --- | --- | --- |
| Public | `POST /api/auth/register` | Create an account (starts as `pending`) |
| Public | `POST /api/auth/login` | Returns `{ token, user }`; pending and suspended accounts are refused |
| Public | `GET /api/locations` | Area names |
| Logged in | `GET /api/auth/me` | The current user |
| Logged in | `GET /api/categories` | Categories with their rates |
| Logged in | `GET /api/conditions` | clean / light / heavy |
| Operator, recycler | `POST /api/reports` | Report a problem with a listing you trade on |
| Operator | `POST /api/scans/grade` | Upload `photo` (multipart) → `{ grading }` |
| Operator | `POST /api/scans` | Save a scan |
| Operator | `GET /api/scans`, `GET /api/scans/:id` | Scan history, one scan |
| Operator | `POST /api/listings` | List a scan: `{ scanId, price }` |
| Operator | `GET /api/listings/mine` | Own listings |
| Operator, recycler | `PATCH /api/listings/:id/cancel` | `{ reason }`: an operator cancels an available listing, a recycler cancels a claim |
| Recycler, admin | `GET /api/listings?status=available` | Browse (recyclers only see available listings) |
| Recycler | `PATCH /api/listings/:id/claim` | Atomic claim |
| Recycler | `GET /api/listings/claims` | Own claims |
| Recycler | `PATCH /api/listings/:id/complete` | Mark a claim completed |
| Recycler | `PATCH /api/listings/:id/rate` | `{ rating: 1-5 }`, once, after completion |
| Admin | `GET /api/admin/stats` | Dashboard numbers and chart data |
| Admin | `GET /api/admin/users` | Users (`?role=` and `?status=` optional) |
| Admin | `PATCH /api/admin/users/:id/status` | `{ status, note }`: approve, flag or suspend |
| Admin | `POST /api/admin/categories`, `PATCH`/`DELETE /api/admin/categories/:id` | Manage categories and rates |
| Admin | `POST /api/admin/locations`, `DELETE /api/admin/locations/:name` | Manage areas |
| Admin | `GET /api/admin/reports` | Reported issues with both parties |
| Admin | `PATCH /api/admin/reports/:id/resolve` | `{ resolution }` |

## Business rules enforced on the server

1. **Price:** each plastic type's amount = share of the weight × the admin rate for that type and condition.
   The range is ±5% at full confidence, widening to ±30% at zero (`utils/pricing.js`).
2. **Lifecycle:** available → claimed → completed, or cancelled. Anything else gets a 409 (`utils/listingRules.js`).
3. **Claim safety:** `findOneAndUpdate({ id, status: "available" }, …)`, so only one recycler can win.
4. **Ownership:** operators cancel only their own available listings; recyclers complete, cancel and rate only their own claims.
5. **Roles:** `requireAuth` checks the JWT and reloads the user on every request, so a suspension takes effect at once; `requireRole()` guards each route group.
6. **Login:** only `approved` and `flagged` accounts can log in.
7. **Main category:** a listing's category is the plastic type with the biggest share in its scan.

## Deploy

- Database: MongoDB Atlas. Put its connection string in `MONGO_URI`.
- Server: Render or Railway. Build command `npm install`, start command `npm start`.
  Set `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL` (the deployed frontend URL) and `NODE_ENV=production`.
- Frontend: Vercel or Netlify, with `VITE_API_URL` set to the server URL plus `/api`.
