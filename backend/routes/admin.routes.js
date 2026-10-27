// routes/admin.routes.js: admin-only endpoints.
const router = require("express").Router();
const { requireRole } = require("../middleware/auth");
const ctrl = require("../controllers/adminController");

router.use(requireRole("admin"));

router.get("/users", ctrl.listUsers); // GET /api/admin/users
router.patch("/users/:id/status", ctrl.setUserStatus); // PATCH /api/admin/users/:id/status
router.get("/reports", ctrl.listReports); // GET /api/admin/reports
router.patch("/reports/:id", ctrl.resolveReport); // PATCH /api/admin/reports/:id
router.get("/rates", ctrl.listRates); // GET /api/admin/rates
router.put("/rates/:categoryId", ctrl.updateRate); // PUT /api/admin/rates/pet

module.exports = router;
