import { Router } from "express";
import { cancelListing, createListing, listMyListings } from "../controllers/listingController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { cancelSchema, createListingSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth, requireRole("operator"));

router.get("/mine", listMyListings);

router.post("/", validate(createListingSchema), createListing);
router.patch("/:id/cancel", validate(cancelSchema), cancelListing);

export default router;
