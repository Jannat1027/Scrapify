
import app from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

try {
  await connectDatabase();
  app.listen(env.port, () => console.log(`Scrapify API running on http://localhost:${env.port}`));
} catch (error) {
  console.error("Could not start the server:", error.message);
  process.exit(1);
}
