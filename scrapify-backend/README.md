# Scrapify backend (operator)

The Express + MongoDB API behind the five operator pages: Dashboard, New scan,
Scan result, Scan history and My listings. It replaces the three simulated
parts of the frontend: `DataContext.jsx` (the database), `AuthContext.jsx`
(login) and `aiGrading.js` (photo grading).

## Run it

```bash
cd scrapify-backend
npm install
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET
npm run seed             # loads the demo data (wipes the database first)
npm run dev              # http://localhost:5050
```

Photos are graded by CLIP, a free image model, through `@huggingface/transformers` (`utils/grading.js`).
The server loads it at start-up; the first run downloads the model once, so it needs internet. A photo
with no plastic in it gets a 422 with `{ message }`.

Then start the frontend (`cd ../scrapify-frontend && npm run dev`) and log in as the demo
operator: `rahima@greenbin.bd`, password `demo1234`.

## Folders

```
src/
  server.js          starts the server (connect to MongoDB, then listen)
  app.js             Express app: CORS, JSON, routes, error handling
  config/            env.js (settings from .env), db.js (MongoDB connection)
  models/            User, Category (with rates), Grading, Scan, Listing, Report
  routes/            auth, catalog, scans, listings, reports
  controllers/       what each route does
  middleware/        auth.js (JWT), requireRole.js, upload.js (multer), validate.js (zod), error.js
  utils/             pricing.js, grading.js, listingRules.js, validation.js, ids.js, seed.js
  data/seed.js       the demo data
postman/             Postman collection with every endpoint
```

## How it fits the frontend

- Every record keeps the frontend's string id (`u1`, `SC-1042`, `LS-2210`, `RP-29`).
  Mongo's `_id`, `__v` and `passwordHash` are never sent, so pages can keep using `row.id`.
- Categories and rates are one collection: `GET /api/categories` returns
  `{ id, name, note, icon, clean, light, heavy, source, updated }`.
- Listings come with `operator` (`{ id, name, org, location, rating }`) and `recycler`
  profiles, so My listings can show who bought each batch.
- Saved scans come with `estimate` (the price range from today's rates) and `listingId`.
- Errors are always `{ message }`, ready to show in a toast.

## Endpoints

| Who | Method and path | What it does |
| --- | --- | --- |
| Public | `POST /api/auth/login` | Returns `{ token, user }`; only approved or flagged operators get in |
| Logged in | `GET /api/auth/me` | The current user |
| Logged in | `GET /api/categories` | Categories with their rates |
| Logged in | `GET /api/conditions` | clean / light / heavy |
| Operator | `POST /api/scans/grade` | Upload `photo` (multipart) → `{ grading }` with a `gradingId`, from the CLIP model (422 when there is no plastic) |
| Operator | `POST /api/scans` | Save a grading as a scan: `{ gradingId, weight }`, plus `composition` and `condition` to correct the AI |
| Operator | `GET /api/scans`, `GET /api/scans/:id` | Scan history, one scan |
| Operator | `POST /api/listings` | List a scan: `{ scanId, price }` |
| Operator | `GET /api/listings/mine` | Own listings |
| Operator | `PATCH /api/listings/:id/cancel` | `{ reason }`: cancel an own listing while it is available |
| Operator | `POST /api/reports` | Report a problem with an own listing |

## Business rules enforced on the server

1. **Price:** each plastic type's amount = share of the weight × the admin rate for that type and condition.
   The range is ±5% at full confidence, widening to ±30% at zero (`utils/pricing.js`).
2. **Cancelling:** an operator can cancel only their own listing, and only while it is available. Otherwise 403 or 409.
3. **Ownership:** operators see, list, cancel and report only their own scans and listings.
4. **Roles:** `requireAuth` checks the JWT and reloads the user on every request, so a suspension takes effect at once; `requireRole("operator")` guards each route group.
5. **Login:** only `approved` and `flagged` operator accounts can log in.
6. **Main category:** a listing's category is the plastic type with the biggest share in its scan.
7. **Gradings can't be faked:** every grading (the AI's answer, confidence, photo quality and the photo) is stored on
   the server. A scan is saved from its `gradingId`, once, by the operator who graded it, and the server fills in
   the AI's values itself. A different type or condition marks the scan corrected and keeps the AI's answer in
   `aiResult`, and is only allowed when the AI was unsure (below 70% or a dark or blurry photo).
   Unused gradings are deleted after a day.
