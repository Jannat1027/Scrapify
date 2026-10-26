import { Router } from "express";
import { completePayment, createPayment, listPayments, verifyPayment } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { createPaymentSchema, verifyPaymentSchema } from "../utils/validation.js";

const router = Router();
router.use(requireAuth, requireRole("operator"));

router.get("/", listPayments);
router.post("/", validate(createPaymentSchema), createPayment);
router.patch("/:id/verify", validate(verifyPaymentSchema), verifyPayment);
router.patch("/:id/complete", completePayment);

export default router;