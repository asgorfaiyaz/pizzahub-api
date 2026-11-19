import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { MenuItemInput } from "../schemas/menuItem.schema.js";

type MenuItemDocument = MenuItemInput & { vendorId: ObjectId };

const menuItems = getDatabase().collection<MenuItemDocument>("menuItems");

export async function createMenuItem(data: MenuItemInput, vendorId: ObjectId) {
  const document: MenuItemDocument = { ...data, vendorId };
  const result = await menuItems.insertOne(document);
  return menuItems.findOne({ _id: result.insertedId });
}

export function getAllMenuItems() {
  return menuItems.find().toArray();
}

export function getMenuItemsByVendorId(vendorId: ObjectId) {
  return menuItems.find({ vendorId }).toArray();
}

export function getMenuItemById(id: string) {
  return menuItems.findOne({ _id: new ObjectId(id) });
}

export function updateMenuItem(
  id: string,
  vendorId: ObjectId,
  data: Partial<MenuItemInput>,
) {
  return menuItems.findOneAndUpdate(
    { _id: new ObjectId(id), vendorId },
    { $set: data },
    { returnDocument: "after" },
  );
}

export function deleteMenuItem(id: string, vendorId: ObjectId) {
  return menuItems.deleteOne({ _id: new ObjectId(id), vendorId });
}
