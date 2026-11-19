import { z } from "zod";

const MENU_ITEM_CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const;

export const menuItemSchema = z.object({
  itemName: z.string().trim().min(2, "Enter an item name."),
  category: z.enum(MENU_ITEM_CATEGORIES, {
    error: "Choose a valid menu item category.",
  }),
  description: z.string().trim().min(2, "Enter a description."),
  price: z.number().nonnegative("Price cannot be negative."),
  location: z.string().trim().min(1, "Enter a location."),
  images: z.array(z.url()).min(1, "Add at least one image."),
  status: z.enum(["pending", "approved", "rejected", "inactive"], {
    error: "Choose a valid status.",
  }),
});

export type MenuItemInput = z.infer<typeof menuItemSchema>;
