import { Router } from "express";
import * as controller from "./controllers.js";
import { verifyToken, requireRole } from "./middleware.js";
import { ROLES } from "./utils.js";

const router = Router();

// ======================= AUTH (Nou) =======================
router.post("/auth/register", controller.register); // 1
router.post("/auth/login", controller.login); //       2
router.get("/auth/me", verifyToken, controller.me); // 3

// ======================= ADMIN (Umama) =======================
const adminOnly = [verifyToken, requireRole(ROLES.ADMIN)];

router.get("/locations", controller.getLocations); //                              public: the sign-up page needs it before login
router.get("/rates", verifyToken, controller.getPriceRates); //                    any logged-in user (shops price scans with it)
router.patch("/rates/:category", adminOnly, controller.updatePriceRate);
router.post("/admin/categories", adminOnly, controller.createCategory);
router.delete("/admin/categories/:category", adminOnly, controller.deleteCategory);
router.post("/admin/locations", adminOnly, controller.createLocation);
router.delete("/admin/locations/:id", adminOnly, controller.deleteLocation);
router.get("/admin/reports", adminOnly, controller.getReports);
router.patch("/admin/reports/:id", adminOnly, controller.resolveReport);
router.get("/admin/overview", adminOnly, controller.getOverview);

router.get("/admin/users", adminOnly, controller.getUsers); //                    4
router.patch("/admin/users/:id/status", adminOnly, controller.updateUserStatus); // 5



// ======================= OPERATOR (Jbh) =======================



// ======================= RECYCLER (Nou) =======================

export default router;