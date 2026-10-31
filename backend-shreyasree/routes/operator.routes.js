const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/operatorController");

router.use(requireRole("operator"));

router.get("/scans", ctrl.myScans);
router.post("/scans", ctrl.createScan);
router.get("/scans/:scanId", ctrl.getScan);
router.get("/listings", ctrl.myListings);
router.post("/listings", ctrl.createListing);
router.delete("/listings/:id", ctrl.removeListing);

module.exports = router;
