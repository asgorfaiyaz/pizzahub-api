import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { createOrderSchema } from "../schemas/order.schema.js";
import {
  cancelCustomerOrder,
  createOrder as createOrderRecord,
  getCustomerOrders as getCustomerOrdersRecords,
  getCustomerOverviewStats as getCustomerOverviewStatsRecord,
} from "../services/orders.service.js";
import { sendResponse } from "../utils/apiResponse.js";

function isValidId(id: string) {
  return ObjectId.isValid(id);
}

export const createOrder: RequestHandler = async (req, res) => {
  const result = createOrderSchema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, "Invalid order data.", result.error.issues);
  }

  const createResult = await createOrderRecord(
    result.data,
    req.userId!,
  );

  if ("error" in createResult) {
    const statusCode =
      createResult.error === "NOT_FOUND"
        ? 404
        : createResult.error === "DUPLICATE_ORDER"
          ? 409
          : 400;
    return sendResponse(
      res,
      statusCode,
      createResult.message || "Failed to create order.",
    );
  }

  return sendResponse(res, 201, "Order placed successfully.", createResult.order);
};

export const myOrders: RequestHandler = async (req, res) => {
  const orders = await getCustomerOrdersRecords(req.userId!);
  return sendResponse(res, 200, "Orders retrieved successfully.", orders);
};

export const getCustomerOrders = myOrders;

export const getCustomerOverview: RequestHandler = async (req, res) => {
  const stats = await getCustomerOverviewStatsRecord(req.userId!);
  return sendResponse(
    res,
    200,
    "Customer overview retrieved successfully.",
    stats,
  );
};

export const cancelOrder: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidId(id)) {
    return sendResponse(res, 400, "Invalid order ID.");
  }

  const { order, error, message } = await cancelCustomerOrder(id, req.userId!);

  if (error) {
    const statusCode = error === "NOT_FOUND" ? 404 : 400;
    return sendResponse(res, statusCode, message || "Failed to cancel order.");
  }

  return sendResponse(res, 200, "Order cancelled successfully.", order);
};
