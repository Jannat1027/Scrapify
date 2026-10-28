import { Router } from "express";
import { getStats, listReports, listUsers, resolveReport, setUserStatus } from "../controllers/adminController.js";
import {
  createCategory,
  createLocation,
  deleteCategory,
  deleteLocation,
  updateCategory,
} from "../controllers/catalogController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import {
  createCategorySchema,
  locationSchema,
  resolveReportSchema,
  updateCategorySchema,
  userStatusSchema,
} from "../utils/validation.js";

const router = Router();
router.use(requireAuth, requireRole("admin"));

router.get("/stats", getStats);

router.get("/users", listUsers);
router.patch("/users/:id/status", validate(userStatusSchema), setUserStatus);

router.post("/categories", validate(createCategorySchema), createCategory);
router.patch("/categories/:id", validate(updateCategorySchema), updateCategory);
router.delete("/categories/:id", deleteCategory);

router.post("/locations", validate(locationSchema), createLocation);
router.delete("/locations/:name", deleteLocation);

router.get("/reports", listReports);
router.patch("/reports/:id/resolve", validate(resolveReportSchema), resolveReport);

export default router;
