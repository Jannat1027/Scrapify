// ---------------------------------------------------------------------------
// The Express app: middleware, then every route group, then error handling.
// Kept apart from server.js so tests can use the app without opening a port.
// ---------------------------------------------------------------------------
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";
import listingRoutes from "./routes/listings.js";
import reportRoutes from "./routes/reports.js";
import scanRoutes from "./routes/scans.js";

const app = express();

// Only the frontend (CLIENT_URL) may call the API from a browser. Postman and curl send no Origin, so they pass.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) callback(null, true);
      else callback(null, false);
    },
  }),
);

// Scans carry a small compressed photo as a data URL, so allow bodies up to 2 MB.
app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api/scans", scanRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
