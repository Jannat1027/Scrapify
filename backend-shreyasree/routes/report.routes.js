// routes/report.routes.js: any logged-in user (operator or recycler) can report a problem.
const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const recyclerCtrl = require("../controllers/recyclerController");

// POST /api/reports  body: { listingId, reason }
router.post("/reports", requireRole("operator", "recycler", "admin"), recyclerCtrl.report);

module.exports = router;
