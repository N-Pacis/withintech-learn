import { Router } from "express";
import { validate } from "../../middleware/validate.middleware";
import { authenticate } from "../../middleware/auth.middleware";
import { isAdmin } from "../../middleware/isAdmin.middleware";
import { initiatePaymentSchema } from "./payments.schemas";
import * as ctrl from "../../controllers/payments.controller";

const router = Router();

router.post("/payments/initiate", authenticate, validate(initiatePaymentSchema), ctrl.postInitiatePayment);
router.get("/payments/status/:txId", authenticate, ctrl.getPaymentStatus);
router.get("/payments/sync-pending", authenticate, ctrl.getSyncPendingPayments);
router.get("/admin/payments", authenticate, isAdmin, ctrl.getListPayments);

export default router;
