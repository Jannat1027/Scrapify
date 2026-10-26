# আজকের ক্লাসে Backend Demo — বাংলা গাইড

## কোন frontend page-এর জন্য কোন API?

| তোমার Page | Backend endpoint | কাজ |
|---|---|---|
| 4. `AuthPage` | `POST /api/auth/register` | নতুন account তৈরি |
| 4. `AuthPage` | `POST /api/auth/login` | email/password যাচাই করে JWT token দেয় |
| 4. `AuthPage` | `GET /api/auth/me` | token থেকে logged-in user ফেরত দেয় |
| 10. `BrowseListingsPage` | `GET /api/listings?search=chair&page=1&limit=10` | listing দেখা, search ও pagination |
| 10. Browse support | `GET /api/listings/:id` | একটি listing-এর details |
| 11. `MyClaimsPage` | `POST /api/claims` | কোনো listing-এর claim submit |
| 11. `MyClaimsPage` | `GET /api/claims/my` | login করা user-এর নিজের claim list |
| 11. Claims support | `PATCH /api/claims/:id/cancel` | নিজের pending claim cancel |

অতিরিক্তভাবে `POST /api/listings` আছে—login করা user নতুন listing তৈরি করতে পারবে।

## Architecture কীভাবে explain করবে

1. **Route:** কোন URL ও HTTP method এলে কোন controller চলবে, সেটা নির্ধারণ করে।
2. **Controller:** request থেকে body/params/token নেয়, service call করে, JSON response দেয়। Controller-এ business logic বেশি রাখা হয়নি।
3. **Service:** validation, authentication logic, search, ownership checks ও database operation করে।
4. **Model:** MongoDB collection-এর data structure, required fields, relationships ও indexes define করে।
5. **Middleware:** protected endpoint-এ JWT verify করে; common error handler সব error-কে consistent JSON format-এ ফেরত দেয়।
6. **Utils:** `asyncHandler`, `AppError`, `escapeRegex`-এর মতো reusable helper—এগুলো DRY বজায় রাখতে সাহায্য করে।

Request flow: `Frontend → Route → Controller → Service → Model/MongoDB → JSON response`

## Live demo করার আগে

1. MongoDB চালু করো অথবা `.env`-এ Atlas URI বসাও।
2. `.env.example` কপি করে `.env` বানাও; `JWT_SECRET` পরিবর্তন করো।
3. Terminal-এ `npm install`, তারপর `npm run seed`, তারপর `npm run dev` চালাও।
4. Postman-এ `postman_collection.json` import করো।
5. Health Check চালাও; Login Test User চালিয়ে token save করো; Browse Listings চালিয়ে listing ID save করো; তারপর Submit Claim এবং My Claims চালাও।
6. Cancel endpoint চালানোর আগে claim `pending` status-এ আছে নিশ্চিত হও।

Claim করার সময় test user ও listing owner আলাদা হতে হবে। Seed করা sample listing-এর owner হলো `demo.seller@example.com`, তাই `test.user@example.com` দিয়ে claim test করা যাবে।

## ক্লাসে বলার জন্য ছোট script

“আমি আমার AuthPage, BrowseListingsPage এবং MyClaimsPage-এর জন্য Express ও MongoDB ভিত্তিক backend endpoint তৈরি করেছি। Backend modular architecture follow করে: routes URL handle করে, controllers request/response manage করে, services business logic ও database operations করে, আর models data schema define করে। Authentication-এর জন্য bcrypt দিয়ে password hash এবং JWT দিয়ে protected routes করেছি। Browse Listings endpoint search ও pagination support করে। My Claims-এ logged-in user claim submit করতে পারে, নিজের claims দেখতে পারে এবং pending claim cancel করতে পারে। আমি এগুলো Postman দিয়ে test করছি।”

## সতর্কতা / project integration

তোমার existing React source code এখানে ছিল না, তাই frontend-এর আসল field names/response shape যাচাই করা সম্ভব হয়নি। এই backend-এর field names হলো `name`, `email`, `password`, `listingId`, `title`, `category` ইত্যাদি। React form-এর field আলাদা হলে request mapping ঠিক করতে হবে। এটি demo-ready starter; সম্পূর্ণ existing app-এর সঙ্গে integrated বলে দাবি করা হচ্ছে না।
