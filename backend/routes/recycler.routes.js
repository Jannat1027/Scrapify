// routes/recycler.routes.js: browsing and claiming.
const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/recyclerController");

router.use(requireRole("recycler"));

router.get("/listings", ctrl.browseListings); // GET /api/recycler/listings?category=pet
router.post("/claims", ctrl.claim); // POST /api/recycler/claims  body: { listingId }
router.get("/claims", ctrl.myClaims); // GET /api/recycler/claims

module.exports = router;
