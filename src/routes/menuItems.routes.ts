import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
} from "../controllers/menuItems.controller.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

router.get("/", getAllMenuItems);
router.post("/", verifyToken, createMenuItem);
router.get("/:id", getMenuItemById);
router.patch("/:id", verifyToken, updateMenuItem);
router.delete("/:id", verifyToken, deleteMenuItem);

export default router;
