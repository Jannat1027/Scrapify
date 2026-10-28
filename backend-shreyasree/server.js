// server.js: the entry point. Creates the Express app, connects MongoDB and mounts every module's routes.
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const publicRoutes = require("./routes/public.routes");
const operatorRoutes = require("./routes/operator.routes");
const recyclerRoutes = require("./routes/recycler.routes");
const adminRoutes = require("./routes/admin.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();

// Middleware: parse JSON bodies and allow the React app to call this API.
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Small health check: open http://localhost:5000/api/health in the browser.
app.get("/api/health", (req, res) => res.json({ ok: true, name: "scrapify-api" }));

// Every module owns one route file (modular architecture).
app.use("/api/auth", authRoutes);
app.use("/api", publicRoutes);
app.use("/api/operator", operatorRoutes);
app.use("/api/recycler", recyclerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", reportRoutes);

// Any unknown /api address returns a clean 404 JSON.
app.use("/api", (req, res) => res.status(404).json({ message: "Route not found" }));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Scrapify API running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Could not start server:", err.message);
    process.exit(1);
  });
