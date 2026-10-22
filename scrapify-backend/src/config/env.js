// ---------------------------------------------------------------------------
// Settings read from the .env file, in one place.
// The server refuses to start when a required setting is missing, so a
// typo shows up at once instead of as a strange error later.
// ---------------------------------------------------------------------------
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const REQUIRED = ["MONGO_URI", "JWT_SECRET"];
const missing = REQUIRED.filter((name) => !process.env[name]);
if (missing.length > 0) {
  console.error(`Missing settings in .env: ${missing.join(", ")}. Copy .env.example to .env and fill them in.`);
  process.exit(1);
}

// The example file's MONGO_URI has <user>, <password> and <cluster> in it, which only fail later as a DNS error.
if (/[<>]/.test(process.env.MONGO_URI)) {
  console.error("MONGO_URI in .env still has the <user>, <password> or <cluster> placeholders. Paste your real connection string.");
  process.exit(1);
}

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // "http://localhost:5173, https://scrapify.vercel.app" -> ["http://localhost:5173", "https://scrapify.vercel.app"]
  clientUrls: (process.env.CLIENT_URL || "http://localhost:5173").split(",").map((url) => url.trim()),
  isProduction: process.env.NODE_ENV === "production",
};
