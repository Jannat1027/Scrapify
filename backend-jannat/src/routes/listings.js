import { Router } from "express";
import {
  browseListings,
  cancelListing,
  claimListing,
  completeListing,
  createListing,
  listMyClaims,
  listMyListings,
  rateListing,
} from "../controllers/listingController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { cancelSchema, createListingSchema, rateSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth);

const operator = requireRole("operator");
const recycler = requireRole("recycler");

router.get("/", requireRole("recycler", "admin"), browseListings);
router.get("/mine", operator, listMyListings);
router.get("/claims", recycler, listMyClaims);

router.post("/", operator, validate(createListingSchema), createListing);
router.patch("/:id/claim", recycler, claimListing);
router.patch("/:id/complete", recycler, completeListing);
router.patch("/:id/rate", recycler, validate(rateSchema), rateListing);
router.patch("/:id/cancel", requireRole("operator", "recycler"), validate(cancelSchema), cancelListing);

export default router;
