const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

router.use(requireRole("admin"));

router.get("/users", ctrl.listUsers);
router.patch("/users/:id/status", ctrl.setUserStatus);
router.get("/reports", ctrl.listReports);
router.patch("/reports/:id", ctrl.resolveReport);
router.get("/rates", ctrl.listRates);
router.put("/rates/:categoryId", ctrl.updateRate);

module.exports = router;
