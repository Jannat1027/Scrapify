# MERN Backend Starter — Auth, Browse Listings, My Claims

This is a **backend starter** for the three frontend pages you worked on:

- Page 4: `AuthPage`
- Page 10: `BrowseListingsPage`
- Page 11: `MyClaimsPage`

The original React project/source was not included with the screenshots, so the field names and JSON response shapes here are a clean starter contract. Match them to your existing frontend's form fields and components before integrating.

## Architecture (following your class notes)

```text
src/
  config/       MongoDB connection
  models/       Mongoose schemas and database constraints
  routes/       URL + HTTP method -> controller
  controllers/  Read request, call service, return response
  services/     Validation, business rules, database operations
  middleware/   JWT auth, 404 and centralized error handling
  utils/        Reusable async handler, error class, regex helper
  app.js        Express middleware and route registration
  server.js     Start server + database connection
```

- **DRY:** shared `asyncHandler`, `AppError`, and `protect` middleware.
- **Thin controllers:** controllers mainly read `req`, call a service, and return JSON.
- **Business logic in services:** auth validation, listing search, claim checks and cancellation rules.
- **Models:** field validation, relationships, indexes and safe password selection.

## 1. Run locally

Requirements: Node.js and a running MongoDB (local MongoDB or MongoDB Atlas).

```bash
# From this project folder
npm install
```

Copy `.env.example` to `.env`, then set `MONGO_URI` and a long random `JWT_SECRET`.

```bash
npm run seed   # optional: inserts 3 sample browse listings
npm run dev
```

Server: `http://localhost:5000`

Health check: `GET http://localhost:5000/api/health`

If your React app runs on a different origin, update `CLIENT_ORIGIN` in `.env` (for example `http://localhost:3000`). Restart the backend after changing `.env`.

### Optional demo listing data

The seed script inserts a demo seller and 3 sample listings. Demo seller login:

- Email: `demo.seller@example.com`
- Password: `DemoPass123!`

Use this only for local demonstrations; do not deploy demo credentials.

## 2. Endpoint list

| Page / purpose | Method | Endpoint | Login required? |
|---|---|---|---|
| Health check | GET | `/api/health` | No |
| Register | POST | `/api/auth/register` | No |
| Login | POST | `/api/auth/login` | No |
| Current logged-in user | GET | `/api/auth/me` | Yes |
| Browse/search listings | GET | `/api/listings` | No |
| Listing details | GET | `/api/listings/:id` | No |
| Create listing (supporting endpoint) | POST | `/api/listings` | Yes |
| Submit a claim | POST | `/api/claims` | Yes |
| My Claims page data | GET | `/api/claims/my` | Yes |
| Cancel own pending claim | PATCH | `/api/claims/:id/cancel` | Yes |

Authenticated requests need this header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

## 3. Test with Postman (recommended order)

Set `baseUrl` mentally to `http://localhost:5000`.

### A. Register — `POST /api/auth/register`
Body -> raw -> JSON:

```json
{
  "name": "Test User",
  "email": "test.user@example.com",
  "password": "TestPass123!"
}
```

Expected: `201 Created`, with `data.token` and safe `data.user`. Password/hash is never returned.

### B. Login — `POST /api/auth/login`

```json
{
  "email": "test.user@example.com",
  "password": "TestPass123!"
}
```

Expected: `200 OK`. Copy `data.token` from the response for protected endpoints.

### C. Browse — `GET /api/listings?search=chair&page=1&limit=10`

Expected: `200 OK`, with `data.items` and `data.pagination`. `GET /api/listings?category=Furniture` filters by category. Run `npm run seed` first if the database has no listings.

### D. Submit a claim — `POST /api/claims`

Select **Authorization -> Bearer Token** in Postman and paste the token for a user who is not the listing owner. Use a real `_id` from the browse response.

```json
{
  "listingId": "PASTE_LISTING_OBJECT_ID_HERE",
  "message": "I am interested in this listing."
}
```

Expected: `201 Created`. A user cannot claim their own listing or create another active claim for the same listing.

### E. Open My Claims — `GET /api/claims/my`

Use the same user's Bearer token. Expected: `200 OK` with `data.claims`.

### F. Cancel a pending claim — `PATCH /api/claims/PASTE_CLAIM_ID_HERE/cancel`

Use the claimant's Bearer token. Only the owner of a **pending** claim can cancel it.

## 4. Request / response notes for the frontend

- Register/login success: read `response.data.data.token` and `response.data.data.user` when using Axios (Axios wraps the server JSON in its own `response.data`).
- Browse listings: use `response.data.data.items`.
- My claims: use `response.data.data.claims`.
- API errors return `{ "success": false, "message": "..." }` and an appropriate HTTP status.
- Store tokens according to your application's security requirements; avoid logging tokens or passwords.

Example Axios request after login:

```js
const result = await axios.post('http://localhost:5000/api/auth/login', {
  email,
  password,
});
const token = result.data.data.token;

const myClaims = await axios.get('http://localhost:5000/api/claims/my', {
  headers: { Authorization: `Bearer ${token}` },
});
```

## 5. Important assumptions

1. A listing has an owner and fields `title`, `description`, `category`, `price`, `quantity`, `unit`, `location`, and optional `imageUrl`.
2. A claim is created with `status: pending`; only its owner can cancel it while pending. Admin/seller approval endpoints are not included because the requested frontend pages were 4, 10 and 11.
3. This starter is not yet wired to your React source. If your actual form uses fields like `fullName`, `itemId`, or different page data structures, map those names in the controller/service or frontend.
