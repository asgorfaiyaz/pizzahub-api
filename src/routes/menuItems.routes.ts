import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
} from "../controllers/menuItems.controller.js";

const router = Router();

router.get("/", getAllMenuItems);
router.post("/", createMenuItem);
router.get("/:id", getMenuItemById);
router.patch("/:id", updateMenuItem);
router.delete("/:id", deleteMenuItem);

export default router;
