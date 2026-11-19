import type { ObjectId } from "mongodb";

declare global {
  namespace Express {
    interface Request {
      userId?: ObjectId;
      userRole?: string;
    }
  }
}

export {};
