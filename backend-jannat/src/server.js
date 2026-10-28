import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import Payment from "./models/Payment.js";
import { warmUpGrader } from "./utils/grading.js";

try {
  await connectDatabase();
  await Payment.syncIndexes();
  app.listen(env.port, () => console.log(`Scrapify API running on http://localhost:${env.port}`));
  warmUpGrader();
} catch (error) {
  console.error("Could not start the server:", error.message);
  process.exit(1);
}
