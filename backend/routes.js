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

router.get("/admin/users", adminOnly, controller.getUsers); //                    4
router.patch("/admin/users/:id/status", adminOnly, controller.updateUserStatus); // 5

// ======================= OPERATOR (Jbh) =======================



// ======================= RECYCLER (Nou) =======================

export default router;