// /api/reports: operators and recyclers report a problem with a listing.
import { Router } from "express";
import { createReport } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { createReportSchema } from "../utils/validation.js";

const router = Router();

router.post("/", requireAuth, requireRole("operator", "recycler"), validate(createReportSchema), createReport);

export default router;
