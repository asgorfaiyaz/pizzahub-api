import type { RequestHandler } from "express";
import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import { sendResponse } from "../utils/apiResponse.js";

const Sessions = getDatabase().collection("session");
const users = getDatabase().collection("user");

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

  if (!(session.userId instanceof ObjectId)) {
    return sendResponse(res, 401, "Invalid session.");
  }

  // Check if user is blocked or does not exist
  const user = await users.findOne(
    { _id: session.userId },
    { projection: { isBlocked: 1, role: 1 } },
  );

  if (!user) {
    return sendResponse(res, 401, "User account not found.");
  }

  if (user.isBlocked === true) {
    return sendResponse(
      res,
      403,
      "Your account has been blocked. You cannot access protected features.",
      undefined,
      undefined,
      "ACCOUNT_BLOCKED",
    );
  }

  req.userId = session.userId;
  req.userRole = user.role;
  return next();
};
