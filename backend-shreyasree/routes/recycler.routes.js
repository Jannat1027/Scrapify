const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/recyclerController");

router.use(requireRole("recycler"));

router.get("/listings", ctrl.browseListings);
router.post("/claims", ctrl.claim);
router.get("/claims", ctrl.myClaims);

module.exports = router;
