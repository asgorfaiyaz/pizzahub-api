import { z } from "zod";

export const getAdminUsersQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["customer", "vendor", "admin", "all"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type GetAdminUsersQuery = z.infer<typeof getAdminUsersQuerySchema>;

export const updateUserBlockStatusSchema = z.object({
  isBlocked: z.boolean({
    error: "isBlocked boolean field is required.",
  }),
});

export type UpdateUserBlockStatusInput = z.infer<
  typeof updateUserBlockStatusSchema
>;
