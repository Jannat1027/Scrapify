import express from "express";
import cors from "cors";
import routes from "./routes.js";
import { notFound, errorHandler } from "./middleware.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ success: true, message: "Scrapify API is running" }));
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;