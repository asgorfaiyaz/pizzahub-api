import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getCustomerOverview,
  myOrders,
} from "../controllers/customers.controller.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

// All customer endpoints require authentication
router.use(verifyToken);

router.get("/overview", getCustomerOverview);
router.get("/my-orders", myOrders);

router.post("/orders", createOrder);
router.get("/orders", myOrders);
router.patch("/orders/:id/cancel", cancelOrder);

export default router;
