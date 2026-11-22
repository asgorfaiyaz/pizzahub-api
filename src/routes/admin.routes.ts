import { Router } from "express";
import {
  getUserById,
  getUsers,
  updateUserBlockStatus,
} from "../controllers/admin.controller.js";
import { requireAdmin } from "../middleware/require-admin.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

// Secure all admin endpoints: requires valid session token and admin role
router.use(verifyToken, requireAdmin);

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/block", updateUserBlockStatus);

export default router;
