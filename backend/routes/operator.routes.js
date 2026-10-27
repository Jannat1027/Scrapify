// routes/operator.routes.js: only role "operator" gets in (middleware first, controller second).
const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/operatorController");

router.use(requireRole("operator"));

router.get("/scans", ctrl.myScans); // GET /api/operator/scans
router.post("/scans", ctrl.createScan); // POST /api/operator/scans
router.get("/scans/:scanId", ctrl.getScan); // GET /api/operator/scans/:scanId
router.get("/listings", ctrl.myListings); // GET /api/operator/listings
router.post("/listings", ctrl.createListing); // POST /api/operator/listings
router.delete("/listings/:id", ctrl.removeListing); // DELETE /api/operator/listings/:id

module.exports = router;
