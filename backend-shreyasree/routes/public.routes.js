const router = require("express").Router();
const ctrl = require("../controllers/publicController");

router.get("/categories", ctrl.categories);
router.get("/rates", ctrl.rates);

module.exports = router;
