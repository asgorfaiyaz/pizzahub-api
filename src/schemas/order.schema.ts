import { ObjectId } from "mongodb";
import { z } from "zod";

export const ORDER_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const createOrderSchema = z.object({
  itemId: z.string().trim().refine((val) => ObjectId.isValid(val), {
    message: "Invalid menu item ID.",
  }),
  deliveryDate: z.coerce.date().refine((date) => !isNaN(date.getTime()), {
    message: "Valid delivery date is required.",
  }),
  deliveryAddress: z
    .string()
    .trim()
    .min(5, "Delivery address must be at least 5 characters."),
  message: z
    .string()
    .trim()
    .max(500, "Message cannot exceed 500 characters.")
    .optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(["accepted", "rejected"], {
    error: "Order status must be 'accepted' or 'rejected'.",
  }),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
