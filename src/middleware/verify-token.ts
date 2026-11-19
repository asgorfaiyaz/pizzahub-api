import type { RequestHandler } from "express";
import { getDatabase } from "../config/database.js";
import { sendResponse } from "../utils/apiResponse.js";

const Sessions = getDatabase().collection("session");

export const verifyToken: RequestHandler = async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return sendResponse(res, 401, "Authentication token is required.");
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return sendResponse(res, 401, "Authentication token is required.");
  }

  const session = await Sessions.findOne({ token });
  if (!session) {
    return sendResponse(res, 401, "Invalid or expired session.");
  }

  req.userId = session.userId;
  return next();
};
