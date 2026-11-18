import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { menuItemSchema } from "../schemas/menuItem.schema.js";
import {
  createMenuItem as createMenuItemRecord,
  deleteMenuItem as deleteMenuItemRecord,
  getAllMenuItems as getAllMenuItemsRecords,
  getMenuItemById as getMenuItemByIdRecord,
  updateMenuItem as updateMenuItemRecord,
} from "../services/menuItems.service.js";
import { sendResponse } from "../utils/apiResponse.js";

function isValidId(id: string) {
  return ObjectId.isValid(id);
}

export const getAllMenuItems: RequestHandler = async (_req, res) => {
  const menuItems = await getAllMenuItemsRecords();
  return sendResponse(res, 200, "Menu items retrieved successfully.", menuItems);
};

export const createMenuItem: RequestHandler = async (req, res) => {
  const result = menuItemSchema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, "Invalid request data.", result.error.issues);
  }

  const menuItem = await createMenuItemRecord(result.data);
  return sendResponse(res, 201, "Menu item created successfully.", menuItem);
};

export const getMenuItemById: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidId(id)) {
    return sendResponse(res, 400, "Invalid menu item ID.");
  }

  const menuItem = await getMenuItemByIdRecord(id);
  if (!menuItem) return sendResponse(res, 404, "Menu item not found.");
  return sendResponse(res, 200, "Menu item retrieved successfully.", menuItem);
};

export const updateMenuItem: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidId(id)) {
    return sendResponse(res, 400, "Invalid menu item ID.");
  }

  const result = menuItemSchema.partial().safeParse(req.body);
  if (!result.success) {
    return sendResponse(res, 400, "Invalid request data.", result.error.issues);
  }
  if (Object.keys(result.data).length === 0) {
    return sendResponse(res, 400, "Provide at least one field to update.");
  }

  const menuItem = await updateMenuItemRecord(id, result.data);
  if (!menuItem) return sendResponse(res, 404, "Menu item not found.");
  return sendResponse(res, 200, "Menu item updated successfully.", menuItem);
};

export const deleteMenuItem: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !isValidId(id)) {
    return sendResponse(res, 400, "Invalid menu item ID.");
  }

  const result = await deleteMenuItemRecord(id);
  if (result.deletedCount === 0) return sendResponse(res, 404, "Menu item not found.");
  return sendResponse(res, 200, "Menu item deleted successfully.");
};
