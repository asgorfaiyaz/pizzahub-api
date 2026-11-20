import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getMenuItemsQuerySchema } from "../schemas/menuItem.schema.js";
import {
  getAllMenuItems as getAllMenuItemsRecords,
  getDistinctLocations as getDistinctLocationsRecords,
  getMenuItemById as getMenuItemByIdRecord,
} from "../services/menuItems.service.js";
import { sendResponse } from "../utils/apiResponse.js";

function isValidId(id: string) {
  return ObjectId.isValid(id);
}

export const getAllMenuItems: RequestHandler = async (req, res) => {
  const result = getMenuItemsQuerySchema.safeParse(req.query);
  if (!result.success) {
    return sendResponse(
      res,
      400,
      "Invalid query parameters.",
      result.error.issues,
    );
  }

  const { search, name, category, location, sortBy, sortOrder, page, limit } =
    result.data;

  const { items, pagination } = await getAllMenuItemsRecords({
    search: search ?? name,
    category,
    location,
    sortBy,
    sortOrder,
    page,
    limit,
  });

  return sendResponse(
    res,
    200,
    "Menu items retrieved successfully.",
    items,
    pagination,
  );
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

export const getMenuItemLocations: RequestHandler = async (_req, res) => {
  const locations = await getDistinctLocationsRecords();
  return sendResponse(res, 200, "Locations retrieved successfully.", locations);
};
