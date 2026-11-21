import { Router } from "express";
import {
  createVendorMenuItem,
  deleteVendorMenuItem,
  getVendorMenuItems,
  getVendorOrders,
  updateVendorMenuItem,
  updateVendorOrderStatus,
} from "../controllers/vendors.controller.js";
import { requireVendor } from "../middleware/require-vendor.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

// Secure all vendor endpoints: requires valid session token and vendor role
router.use(verifyToken, requireVendor);

router.get("/menu-items", getVendorMenuItems);
router.post("/menu-items", createVendorMenuItem);
router.patch("/menu-items/:id", updateVendorMenuItem);
router.delete("/menu-items/:id", deleteVendorMenuItem);

router.get("/orders", getVendorOrders);
router.patch("/orders/:id/status", updateVendorOrderStatus);

export default router;
