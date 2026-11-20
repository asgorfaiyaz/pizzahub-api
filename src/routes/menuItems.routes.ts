import { Router } from "express";
import {
  getAllMenuItems,
  getMenuItemById,
  getMenuItemLocations,
} from "../controllers/menuItems.controller.js";

const router = Router();

router.get("/", getAllMenuItems);
router.get("/locations", getMenuItemLocations);
router.get("/:id", getMenuItemById);

export default router;
