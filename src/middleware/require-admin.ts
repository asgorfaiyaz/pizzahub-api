import type { RequestHandler } from "express";
import { getDatabase } from "../config/database.js";
import { sendResponse } from "../utils/apiResponse.js";

const users = getDatabase().collection("user");

export const requireAdmin: RequestHandler = async (req, res, next) => {
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

  if (user.role !== "admin") {
    return sendResponse(res, 403, "Admin access is required.");
  }

  req.userRole = user.role;
  return next();
};
