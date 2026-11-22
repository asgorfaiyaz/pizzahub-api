import type { RequestHandler } from "express";
import { sendResponse } from "../utils/apiResponse.js";

export const requireAdmin: RequestHandler = (req, res, next) => {
  if (req.userRole !== "admin") {
    return sendResponse(res, 403, "Admin access is required.");
  }

  return next();
};
