import { Router } from "express";
import { listCategories, listConditions, listLocations } from "../controllers/catalogController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/locations", listLocations);
router.get("/categories", requireAuth, listCategories);
router.get("/conditions", requireAuth, listConditions);

export default router;
