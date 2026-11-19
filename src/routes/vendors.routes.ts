import { Router } from "express";
import {
  createVendorMenuItem,
  deleteVendorMenuItem,
  getVendorMenuItems,
  updateVendorMenuItem,
} from "../controllers/vendors.controller.js";
import { requireVendor } from "../middleware/require-vendor.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

router.get("/menu-items", verifyToken, requireVendor, getVendorMenuItems);
router.post("/menu-items", verifyToken, requireVendor, createVendorMenuItem);
router.patch("/menu-items/:id", verifyToken, requireVendor, updateVendorMenuItem);
router.delete("/menu-items/:id", verifyToken, requireVendor, deleteVendorMenuItem);

export default router;
