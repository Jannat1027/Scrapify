# Scrapify Backend (Express + MongoDB)

REST API for the Scrapify React frontend. Modular architecture:
`routes/` (endpoints) → `controllers/` (request/response, thin) → `services/` (shared logic, DRY) → `models/` (fat: schema + rules).

## 1. Setup (one time)

```bash
cd backend-shreyasree
npm install
```

Create your `.env`: copy `.env.example`, rename it to `.env`, and paste your
MongoDB Atlas connection string (Atlas → Connect → Drivers → copy) as `MONGO_URI`.

## 2. Start and seed

```bash
npm run dev        # starts the API on http://localhost:5000
npm run seed       # one time: fills demo users, categories, rates, listings
```

Demo logins (password `demo1234`): `operator@demo.com`, `recycler@demo.com`, `admin@demo.com`.

## 3. Test with Postman

1. `POST http://localhost:5000/api/auth/login` — body (raw JSON):
   ```json
   { "email": "operator@demo.com", "password": "demo1234" }
   ```
   Copy the `token` from the response.
2. For protected endpoints add a header: `Authorization: Bearer <token>`.

## Endpoints (18)

| # | Method | Endpoint | Who | What |
|---|--------|----------|-----|------|
| 1 | POST | /api/auth/register | public | new account (pending) |
| 2 | POST | /api/auth/login | public | returns JWT token |
| 3 | GET | /api/auth/me | any | my profile |
| 4 | GET | /api/categories | public | plastic categories |
| 5 | GET | /api/rates | public | today's rates |
| 6 | GET | /api/operator/scans | operator | my scan history |
| 7 | POST | /api/operator/scans | operator | save a new scan |
| 8 | GET | /api/operator/scans/:scanId | operator | scan detail |
| 9 | GET | /api/operator/listings | operator | my listings |
| 10 | POST | /api/operator/listings | operator | list a batch for sale |
| 11 | DELETE | /api/operator/listings/:id | operator | remove my listing |
| 12 | GET | /api/recycler/listings | recycler | browse available (?category=pet) |
| 13 | POST | /api/recycler/claims | recycler | claim a listing |
| 14 | GET | /api/recycler/claims | recycler | my claims |
| 15 | POST | /api/reports | any role | report a problem |
| 16 | GET | /api/admin/users | admin | all users |
| 17 | PATCH | /api/admin/users/:id/status | admin | approve/suspend |
| 18 | GET/PATCH | /api/admin/reports(+/:id) | admin | reported issues |
| 19 | GET/PUT | /api/admin/rates(+/:categoryId) | admin | price rates |

Plus `GET /api/health` for a quick "is it alive" check.
