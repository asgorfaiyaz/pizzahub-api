import { ObjectId, type Document, type Filter } from "mongodb";
import { getDatabase } from "../config/database.js";
import type {
  GetMenuItemsQuery,
  MenuItemInput,
} from "../schemas/menuItem.schema.js";

type MenuItemDocument = MenuItemInput & { vendorId: ObjectId };

const menuItems = getDatabase().collection<MenuItemDocument>("menuItems");

export async function createMenuItem(data: MenuItemInput, vendorId: ObjectId) {
  const document: MenuItemDocument = { ...data, vendorId };
  const result = await menuItems.insertOne(document);
  return menuItems.findOne({ _id: result.insertedId });
}

export async function getAllMenuItems(
  options: Partial<GetMenuItemsQuery> = {},
) {
  const {
    search,
    category,
    location,
    sortBy = "_id",
    sortOrder = "desc",
    page = 1,
    limit = 10,
  } = options;
  const skip = (page - 1) * limit;

  const filter: Filter<MenuItemDocument> = {
    status: "approved",
  };

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.itemName = { $regex: escaped, $options: "i" };
  }

  if (category && category.trim()) {
    const escaped = category.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.category = { $regex: `^${escaped}$`, $options: "i" };
  }

  if (location && location.trim()) {
    const escaped = location.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.location = { $regex: escaped, $options: "i" };
  }

  const pipeline: Document[] = [
    { $match: filter },
    {
      $sort: {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
        _id: 1,
      },
    },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: "user",
        localField: "vendorId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              businessName: 1,
            },
          },
        ],
        as: "vendor",
      },
    },
    {
      $unwind: {
        path: "$vendor",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  const [total, items] = await Promise.all([
    menuItems.countDocuments(filter),
    menuItems.aggregate(pipeline).toArray(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export function getMenuItemsByVendorId(vendorId: ObjectId) {
  return menuItems.find({ vendorId }).toArray();
}

export async function getDistinctLocations(): Promise<string[]> {
  const locations = await menuItems.distinct("location", {
    status: "approved",
  });
  return locations.sort((a, b) => a.localeCompare(b));
}

export async function getMenuItemById(id: string) {
  const [menuItem] = await menuItems
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: "user",
          localField: "vendorId",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                name: 1,
                businessName: 1,
              },
            },
          ],
          as: "vendor",
        },
      },
      {
        $unwind: {
          path: "$vendor",
          preserveNullAndEmptyArrays: true,
        },
      },
    ])
    .toArray();

  return menuItem ?? null;
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
