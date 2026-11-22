import { Router } from "express";
import {
  cancelOrder,
  createOrder,
  getCustomerOverview,
  myOrders,
} from "../controllers/customers.controller.js";
import { requireCustomer } from "../middleware/require-customer.js";
import { verifyToken } from "../middleware/verify-token.js";

const router = Router();

// Secure all customer endpoints: requires valid session token and customer role
router.use(verifyToken, requireCustomer);

router.get("/overview", getCustomerOverview);
router.get("/my-orders", myOrders);

router.post("/orders", createOrder);
router.get("/orders", myOrders);
router.patch("/orders/:id/cancel", cancelOrder);

export default router;
