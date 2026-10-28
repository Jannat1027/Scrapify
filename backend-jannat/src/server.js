import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import Payment from "./models/Payment.js";
import { warmUpGrader } from "./utils/grading.js";
import { mailConfigured } from "./utils/mailer.js";

try {
  await connectDatabase();
  await Payment.syncIndexes();
  app.listen(env.port, () => console.log(`Scrapify API running on http://localhost:${env.port}`));
  if (!mailConfigured) console.warn("SMTP_HOST is not set: sign-up confirmation links are printed here instead of emailed.");
  warmUpGrader();
} catch (error) {
  console.error("Could not start the server:", error.message);
  process.exit(1);
}
