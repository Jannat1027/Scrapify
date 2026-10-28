
import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middleware/error.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import catalogRoutes from "./routes/catalog.js";

const app = express();


app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) callback(null, true);
      else callback(null, false);
    },
  }),
);


app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api", catalogRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
