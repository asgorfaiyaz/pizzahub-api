import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import {
  getAdminMenuItemsQuerySchema,
  getAdminTransactionsQuerySchema,
  getAdminUsersQuerySchema,
  updateMenuItemStatusSchema,
  updateUserBlockStatusSchema,
} from "../schemas/admin.schema.js";
import {
  deleteMenuItemByAdmin,
  getAllSubmittedMenuItems,
  getAllTransactions,
  getAllUsers,
  getUserById as getUserByIdRecord,
  updateMenuItemStatus,
  updateUserBlockStatus as updateUserBlockStatusRecord,
} from "../services/admin.service.js";
import { sendResponse } from "../utils/apiResponse.js";

export const getUsers: RequestHandler = async (req, res) => {
  const result = getAdminUsersQuerySchema.safeParse(req.query);
  if (!result.success) {
    return sendResponse(
      res,
      400,
      "Invalid query parameters.",
      result.error.issues,
    );
  }

  const { users, pagination } = await getAllUsers(result.data);

  return sendResponse(
    res,
    200,
    "Users retrieved successfully.",
    users,
    pagination,
  );
};

export const getUserById: RequestHandler = async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid user ID format.");
  }

  const user = await getUserByIdRecord(id);
  if (!user) {
    return sendResponse(res, 404, "User not found.");
  }

  return sendResponse(res, 200, "User details retrieved successfully.", user);
};

export const updateUserBlockStatus: RequestHandler = async (req, res) => {
  const id = req.params.id;

  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid user ID format.");
  }

  const result = updateUserBlockStatusSchema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(
      res,
      400,
      "Invalid request body.",
      result.error.issues,
    );
  }

  const response = await updateUserBlockStatusRecord(
    id,
    result.data.isBlocked,
    req.userId!,
  );

  if (response.error) {
    const statusCode =
      response.error === "NOT_FOUND"
        ? 404
        : response.error === "SELF_BLOCK"
          ? 400
          : 400;
    return sendResponse(res, statusCode, response.message);
  }

  const action = result.data.isBlocked ? "blocked" : "unblocked";
  return sendResponse(
    res,
    200,
    `User has been ${action} successfully.`,
    response.user,
  );
};

export const getTransactions: RequestHandler = async (req, res) => {
  const result = getAdminTransactionsQuerySchema.safeParse(req.query);
  if (!result.success) {
    return sendResponse(
      res,
      400,
      "Invalid query parameters.",
      result.error.issues,
    );
  }

  const { transactions, pagination } = await getAllTransactions(result.data);

  return sendResponse(
    res,
    200,
    "Transactions retrieved successfully.",
    transactions,
    pagination,
  );
};

export const getSubmittedMenuItems: RequestHandler = async (req, res) => {
  const result = getAdminMenuItemsQuerySchema.safeParse(req.query);
  if (!result.success) {
    return sendResponse(
      res,
      400,
      "Invalid query parameters.",
      result.error.issues,
    );
  }

  const { items, pagination } = await getAllSubmittedMenuItems(result.data);

  return sendResponse(
    res,
    200,
    "Submitted menu items retrieved successfully.",
    items,
    pagination,
  );
};

export const updateMenuItemStatusHandler: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid menu item ID format.");
  }

  const result = updateMenuItemStatusSchema.safeParse(req.body);
  if (!result.success) {
    return sendResponse(
      res,
      400,
      "Invalid request body.",
      result.error.issues,
    );
  }

  const response = await updateMenuItemStatus(id, result.data.status);
  if (response.error) {
    const statusCode = response.error === "NOT_FOUND" ? 404 : 400;
    return sendResponse(res, statusCode, response.message);
  }

  return sendResponse(
    res,
    200,
    `Menu item status updated to '${result.data.status}' successfully.`,
    response.item,
  );
};

export const deleteMenuItemByAdminHandler: RequestHandler = async (
  req,
  res,
) => {
  const id = req.params.id;
  if (typeof id !== "string" || !ObjectId.isValid(id)) {
    return sendResponse(res, 400, "Invalid menu item ID format.");
  }

  const response = await deleteMenuItemByAdmin(id);
  if (response.error) {
    const statusCode = response.error === "NOT_FOUND" ? 404 : 400;
    return sendResponse(res, statusCode, response.message);
  }

  return sendResponse(res, 200, "Menu item deleted successfully.");
};
