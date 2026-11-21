import { Router } from "express";
import {
  createCheckoutSession,
  createVendorMenuItem,
  deleteVendorMenuItem,
  getPaymentConfirmationHandler,
  getSubscriptionStatus,
  getVendorMenuItems,
  getVendorOrders,
  getVendorOverview,
  updateVendorMenuItem,
  updateVendorOrderStatus,
} from "../controllers/vendors.controller.js";
import { requireVendor } from "../middleware/require-vendor.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

// Secure all vendor endpoints: requires valid session token and vendor role
router.use(verifyToken, requireVendor);

router.get("/overview", getVendorOverview);

router.get("/menu-items", getVendorMenuItems);
router.post("/menu-items", createVendorMenuItem);
router.patch("/menu-items/:id", updateVendorMenuItem);
router.delete("/menu-items/:id", deleteVendorMenuItem);

router.get("/orders", getVendorOrders);
router.patch("/orders/:id/status", updateVendorOrderStatus);

// Vendor Subscription & Stripe Checkout routes
router.get("/subscription", getSubscriptionStatus);
router.get("/subscription/confirmation", getPaymentConfirmationHandler);
router.post("/subscription/create-checkout-session", createCheckoutSession);

export default router;
