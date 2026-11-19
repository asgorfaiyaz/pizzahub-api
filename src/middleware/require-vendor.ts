import type { RequestHandler } from "express";
import { getDatabase } from "../config/database.js";
import { sendResponse } from "../utils/apiResponse.js";

const users = getDatabase().collection("user");

export const requireVendor: RequestHandler = async (req, res, next) => {
  if (!req.userId) {
    return sendResponse(res, 401, "Authentication is required.");
  }

  const user = await users.findOne(
    { _id: req.userId },
    { projection: { role: 1 } },
  );
  if (!user) {
    return sendResponse(res, 401, "User account not found.");
  }
  if (user.role !== "vendor") {
    return sendResponse(res, 403, "Vendor access is required.");
  }

  req.userRole = user.role;
  return next();
};
