import { Router } from "express";
import {
  checkoutOptions,
  confirmPayment,
  gatewayClosed,
  gatewayIpn,
  gatewaySuccess,
  listPayments,
  payManually,
  payOnline,
  rejectPayment,
} from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { manualPaymentSchema, onlinePaymentSchema, rejectPaymentSchema } from "../utils/validation.js";

const router = Router();

router.post("/sslcommerz/success", gatewaySuccess);
router.post("/sslcommerz/fail", gatewayClosed("failed"));
router.post("/sslcommerz/cancel", gatewayClosed("cancelled"));
router.post("/sslcommerz/ipn", gatewayIpn);

router.use(requireAuth);
const recycler = requireRole("recycler");
const operator = requireRole("operator");

router.get("/", listPayments);
router.get("/checkout/:listingId", recycler, checkoutOptions);
router.post("/manual", recycler, validate(manualPaymentSchema), payManually);
router.post("/online", recycler, validate(onlinePaymentSchema), payOnline);
router.patch("/:id/confirm", operator, confirmPayment);
router.patch("/:id/reject", operator, validate(rejectPaymentSchema), rejectPayment);

export default router;
