import { Response } from "express";

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function sendResponse<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  pagination?: PaginationMeta,
) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    ...(data === undefined ? {} : { data }),
    ...(pagination === undefined ? {} : { pagination }),
  });
}
