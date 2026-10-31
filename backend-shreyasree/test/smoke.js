process.env.JWT_SECRET = "testsecret";

const http = require("http");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const express = require("express");

async function main() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri("scrapify");

  const app = express();
  app.use(express.json());
  app.use("/api/auth", require("../routes/auth.routes"));
  app.use("/api", require("../routes/public.routes"));
  app.use("/api/operator", require("../routes/operator.routes"));
  app.use("/api/recycler", require("../routes/recycler.routes"));
  app.use("/api/admin", require("../routes/admin.routes"));
  app.use("/api", require("../routes/report.routes"));
  const server = http.createServer(app);
  await new Promise((r) => server.listen(0, r));
  const base = `http://localhost:${server.address().port}`;

  await mongoose.connect(process.env.MONGO_URI);

  const User = require("../models/User");
  const Category = require("../models/Category");
  const Rate = require("../models/Rate");
  await Category.create({ id: "pet", name: "Clear PET", note: "bottles", icon: "cup-soda" });
  await Rate.create({ id: "pet", clean: 42, light: 34, heavy: 22 });
  await User.create({ id: "u1", name: "Op", email: "op@demo.com", password: "demo1234", role: "operator", status: "approved" });
  await User.create({ id: "u5", name: "Rec", email: "rec@demo.com", password: "demo1234", role: "recycler", status: "approved" });

  const api = {
    post: (path, body, token) => fetch(base + path, { method: "POST", headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }),
    get: (path, token) => fetch(base + path, { headers: token ? { authorization: `Bearer ${token}` } : {} }),
  };
  let pass = 0, fail = 0;
  async function check(name, res, expect, extra) {
    const ok = res.status === expect;
    ok ? pass++ : fail++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}  -> ${res.status}${ok ? "" : ` (expected ${expect}) ${extra || ""}`}`);
  }

  await check("health", await api.get("/api/health"), 200);

  await check("register pending user", await api.post("/api/auth/register", { name: "New Op", email: "new@demo.com", password: "demo1234", role: "operator" }), 201);
  let res = await api.post("/api/auth/login", { email: "new@demo.com", password: "demo1234" });
  await check("pending user cannot log in", res, 403);

  res = await api.post("/api/auth/login", { email: "op@demo.com", password: "demo1234" });
  await check("operator login", res, 200);
  const opToken = (await res.json()).token;

  res = await api.post("/api/auth/login", { email: "rec@demo.com", password: "demo1234" });
  const recToken = (await res.json()).token;
  await check("recycler login", res, 200);

  await check("wrong password rejected", await api.post("/api/auth/login", { email: "op@demo.com", password: "wrong" }), 401);

  await check("categories", await api.get("/api/categories"), 200);
  await check("rates", await api.get("/api/rates"), 200);

  res = await api.post("/api/operator/scans", { location: "Mirpur, Dhaka", weight: 50, condition: "clean", composition: { pet: 100 }, confidence: 0.9 }, opToken);
  await check("create scan", res, 201);
  const scan = await res.json();

  await check("list my scans", await api.get("/api/operator/scans", opToken), 200);
  await check("scan detail", await api.get(`/api/operator/scans/${scan.id}`, opToken), 200);

  res = await api.post("/api/operator/listings", { scanId: scan.id, category: "pet", condition: "clean", weight: 50 }, opToken);
  await check("create listing (price from rates)", res, 201);
  const listing = await res.json();
  console.log(`      listing ${listing.id} priced at ${listing.price} taka (expect 50kg x 42 = 2100)`);
  if (listing.price !== 2100) { fail++; console.log("FAIL  price calculation"); } else pass++;

  await check("recycler cannot create scans (role guard)", await api.post("/api/operator/scans", { location: "x", weight: 1, condition: "clean" }, recToken), 403);

  await check("browse listings", await api.get("/api/recycler/listings", recToken), 200);
  res = await api.post("/api/recycler/claims", { listingId: listing.id }, recToken);
  await check("claim listing", res, 200);
  res = await api.post("/api/recycler/claims", { listingId: listing.id }, recToken);
  await check("second claim blocked (atomic)", res, 409);
  await check("my claims", await api.get("/api/recycler/claims", recToken), 200);

  await check("report a problem", await api.post("/api/reports", { listingId: listing.id, reason: "test" }, recToken), 201);

  await check("operator blocked from admin", await api.get("/api/admin/users", opToken), 403);

  console.log(`\n${pass} passed, ${fail} failed`);
  await mongoose.disconnect();
  await mongod.stop();
  server.close();
  process.exit(fail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
