import type { RequestHandler } from "express";
import { sendResponse } from "../utils/apiResponse.js";

export const requireCustomer: RequestHandler = (req, res, next) => {
  if (req.userRole !== "customer") {
    return sendResponse(res, 403, "Customer access is required.");
  }

  return next();
};
