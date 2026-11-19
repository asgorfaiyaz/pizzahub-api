import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import {
  getAllMenuItems as getAllMenuItemsRecords,
  getMenuItemById as getMenuItemByIdRecord,
} from "../services/menuItems.service.js";
import { sendResponse } from "../utils/apiResponse.js";

function isValidId(id: string) {
  return ObjectId.isValid(id);
}

export const getAllMenuItems: RequestHandler = async (_req, res) => {
  const menuItems = await getAllMenuItemsRecords();
  return sendResponse(res, 200, "Menu items retrieved successfully.", menuItems);
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
