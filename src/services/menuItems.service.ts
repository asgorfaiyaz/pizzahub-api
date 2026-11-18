import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { MenuItemInput } from "../schemas/menuItem.schema.js";

const menuItems = getDatabase().collection<MenuItemInput>("menuItems");

export async function createMenuItem(data: MenuItemInput) {
  const result = await menuItems.insertOne(data);
  return menuItems.findOne({ _id: result.insertedId });
}

export function getAllMenuItems() {
  return menuItems.find().toArray();
}

export function getMenuItemById(id: string) {
  return menuItems.findOne({ _id: new ObjectId(id) });
}

export function updateMenuItem(id: string, data: Partial<MenuItemInput>) {
  return menuItems.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: data },
    { returnDocument: "after" },
  );
}

export function deleteMenuItem(id: string) {
  return menuItems.deleteOne({ _id: new ObjectId(id) });
}
