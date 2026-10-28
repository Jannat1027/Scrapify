import dotenv from "dotenv";

dotenv.config({ quiet: true });

const REQUIRED = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing settings in .env: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}


if (/[<>]/.test(process.env.MONGO_URI)) {
  console.error("MONGO_URI in .env still has the <user>, <password> or <cluster> placeholders. Paste your real connection string.");
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === "production";
if (isProduction && (process.env.JWT_SECRET.length < 24 || /change-me|your_long_random/i.test(process.env.JWT_SECRET))) {
  console.error("JWT_SECRET is too weak for production. Use a random string of at least 24 characters.");
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 5050,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID?.trim() || "",
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD?.trim() || "",
    live: process.env.SSLCOMMERZ_LIVE === "true",
  },
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((url) => url.trim()),
  isProduction,
};

env.serverUrl = (process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || `http://localhost:${env.port}`).replace(/\/$/, "");
env.frontendUrl = (process.env.FRONTEND_URL || env.clientUrls[0]).replace(/\/$/, "");
