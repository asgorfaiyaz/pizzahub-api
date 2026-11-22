import { Router } from "express";
import {
  deleteMenuItemByAdminHandler,
  getSubmittedMenuItems,
  getTransactions,
  getUserById,
  getUsers,
  updateMenuItemStatusHandler,
  updateUserBlockStatus,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

// Secure all admin endpoints: requires valid session token and admin role
router.use(verifyToken, requireAdmin);

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/block", updateUserBlockStatus);

// Platform Transactions (Strictly Read-Only: No edit/update routes)
router.get("/transactions", getTransactions);

// Menu Items Management
router.get("/menu-items", getSubmittedMenuItems);
router.patch("/menu-items/:id/status", updateMenuItemStatusHandler);
router.delete("/menu-items/:id", deleteMenuItemByAdminHandler);

export default router;
