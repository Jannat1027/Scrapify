// /api/scans: operators only.
import { Router } from "express";
import { createScan, getScan, grade, listMyScans } from "../controllers/scanController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { uploadPhoto } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { createScanSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth, requireRole("operator"));

router.post("/grade", uploadPhoto, grade);
router.post("/", validate(createScanSchema), createScan);
router.get("/", listMyScans);
router.get("/:id", getScan);

export default router;
