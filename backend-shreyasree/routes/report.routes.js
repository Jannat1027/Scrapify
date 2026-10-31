const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const recyclerCtrl = require("../controllers/recyclerController");

router.post("/reports", requireRole("operator", "recycler", "admin"), recyclerCtrl.report);

module.exports = router;
