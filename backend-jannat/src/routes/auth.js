import { Router } from "express";
import { login, me, register, updateWallets } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema, walletSchema } from "../utils/validation.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", requireAuth, me);
router.patch("/me/wallets", requireAuth, requireRole("operator"), validate(walletSchema), updateWallets);

export default router;
