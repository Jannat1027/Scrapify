// routes/public.routes.js: open endpoints for the landing/guide pages.
const router = require("express").Router();
const ctrl = require("../controllers/publicController");

router.get("/categories", ctrl.categories); // GET /api/categories
router.get("/rates", ctrl.rates); // GET /api/rates

module.exports = router;
