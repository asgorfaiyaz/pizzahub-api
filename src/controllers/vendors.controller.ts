import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { menuItemSchema } from "../schemas/menuItem.schema.js";
import { updateOrderStatusSchema } from "../schemas/order.schema.js";
import {
  createMenuItem as createMenuItemRecord,
  deleteMenuItem as deleteMenuItemRecord,
  getMenuItemsByVendorId,
  updateMenuItem as updateMenuItemRecord,
} from "../services/menuItems.service.js";
import {
  getVendorOrders as getVendorOrdersRecords,
  updateVendorOrderStatus as updateVendorOrderStatusRecord,
} from "../services/orders.service.js";
import { sendResponse } from "../utils/apiResponse.js";

function isValidMenuItemId(id: string) {
  return ObjectId.isValid(id);
}

export const getVendorMenuItems: RequestHandler = async (req, res) => {
  const menuItems = await getMenuItemsByVendorId(req.userId!);
  return sendResponse(res, 200, "Vendor menu items retrieved successfully.", menuItems);
};

export const createVendorMenuItem: RequestHandler = async (req, res) => {
  const result = menuItemSchema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, "Invalid request data.", result.error.issues);
  }

  const menuItem = await createMenuItemRecord(result.data, req.userId!);
  return sendResponse(res, 201, "Menu item created successfully.", menuItem);
};

export const updateVendorMenuItem: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidMenuItemId(id)) {
    return sendResponse(res, 400, "Invalid menu item ID.");
  }

  const result = menuItemSchema.partial().safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, "Invalid request data.", result.error.issues);
  }
  if (Object.keys(result.data).length === 0) {
    return sendResponse(res, 400, "Provide at least one field to update.");
  }

  const menuItem = await updateMenuItemRecord(id, req.userId!, result.data);
  if (!menuItem) return sendResponse(res, 404, "Menu item not found.");
  return sendResponse(res, 200, "Menu item updated successfully.", menuItem);
};

export const deleteVendorMenuItem: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidMenuItemId(id)) {
    return sendResponse(res, 400, "Invalid menu item ID.");
  }

  const result = await deleteMenuItemRecord(id, req.userId!);
  if (result.deletedCount === 0) return sendResponse(res, 404, "Menu item not found.");
  return sendResponse(res, 200, "Menu item deleted successfully.");
};

export const getVendorOrders: RequestHandler = async (req, res) => {
  const orders = await getVendorOrdersRecords(req.userId!);
  return sendResponse(res, 200, "Vendor orders retrieved successfully.", orders);
};

export const updateVendorOrderStatus: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidMenuItemId(id)) {
    return sendResponse(res, 400, "Invalid order ID.");
  }

  const result = updateOrderStatusSchema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, "Invalid status data.", result.error.issues);
  }

  const { order, error, message } = await updateVendorOrderStatusRecord(
    id,
    req.userId!,
    result.data.status,
  );

  if (error) {
    const statusCode = error === "NOT_FOUND" ? 404 : 400;
    return sendResponse(res, statusCode, message || "Failed to update order status.");
  }

  return sendResponse(res, 200, `Order ${result.data.status} successfully.`, order);
};
