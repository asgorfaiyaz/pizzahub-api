import type { RequestHandler } from "express";
import { sendResponse } from "../utils/apiResponse.js";

export const requireVendor: RequestHandler = (req, res, next) => {
  if (req.userRole !== "vendor") {
    return sendResponse(res, 403, "Vendor access is required.");
  }

  return next();
};
