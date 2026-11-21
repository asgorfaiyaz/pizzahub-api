import { ObjectId, type Document } from "mongodb";
import { getDatabase } from "../config/database.js";
import type { CreateOrderInput, OrderStatus } from "../schemas/order.schema.js";

export type OrderDocument = {
  itemId: ObjectId;
  vendorId: ObjectId;
  customerId: ObjectId;
  deliveryDate: Date;
  deliveryAddress: string;
  message?: string;
  status: OrderStatus;
  createdAt: Date;
};

const orders = getDatabase().collection<OrderDocument>("orders");
const menuItems = getDatabase().collection("menuItems");
const users = getDatabase().collection("user");

export async function createOrder(
  data: CreateOrderInput,
  customerId: ObjectId,
) {
  const item = await menuItems.findOne({ _id: new ObjectId(data.itemId) });
  if (!item) {
    return { error: "NOT_FOUND", message: "Menu item not found." };
  }

  if (item.status !== "approved") {
    return {
      error: "UNAVAILABLE",
      message: "This menu item is currently unavailable for order.",
    };
  }

  if (!item.vendorId) {
    return {
      error: "INVALID_ITEM",
      message: "Menu item has no associated vendor.",
    };
  }

  const deliveryDate = new Date(data.deliveryDate);
  const startOfDay = new Date(deliveryDate);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(deliveryDate);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const existingActiveOrder = await orders.findOne({
    customerId,
    itemId: new ObjectId(data.itemId),
    deliveryDate: { $gte: startOfDay, $lte: endOfDay },
    status: { $in: ["pending", "accepted"] },
  });

  if (existingActiveOrder) {
    return {
      error: "DUPLICATE_ORDER",
      message:
        "You already have an active order for this item on the selected delivery date.",
    };
  }

  const document: OrderDocument = {
    itemId: new ObjectId(data.itemId),
    vendorId: new ObjectId(item.vendorId),
    customerId,
    deliveryDate,
    deliveryAddress: data.deliveryAddress,
    ...(data.message ? { message: data.message } : {}),
    status: "pending",
    createdAt: new Date(),
  };

  const result = await orders.insertOne(document);
  return { order: { _id: result.insertedId, ...document } };
}

export async function getCustomerOverviewStats(customerId: ObjectId) {
  const [total, pending, accepted, rejected, cancelled] = await Promise.all([
    orders.countDocuments({ customerId }),
    orders.countDocuments({ customerId, status: "pending" }),
    orders.countDocuments({ customerId, status: "accepted" }),
    orders.countDocuments({ customerId, status: "rejected" }),
    orders.countDocuments({ customerId, status: "cancelled" }),
  ]);

  return {
    total,
    pending,
    accepted,
    rejected,
    cancelled,
  };
}

export async function getVendorOverviewStats(vendorId: ObjectId) {
  const [
    totalMenuItems,
    activeMenuItems,
    pendingOrders,
    acceptedOrders,
    user,
  ] = await Promise.all([
    menuItems.countDocuments({ vendorId }),
    menuItems.countDocuments({ vendorId, status: { $ne: "inactive" } }),
    orders.countDocuments({ vendorId, status: "pending" }),
    orders.countDocuments({ vendorId, status: "accepted" }),
    users.findOne({ _id: vendorId }),
  ]);

  const isPremium =
    user?.subscriptionPlan === true || user?.subscriptionPlan === "premium";

  return {
    totalMenuItems,
    activeMenuItems,
    pendingOrders,
    acceptedOrders,
    currentSubscriptionPlan: isPremium ? "premium" : "free",
  };
}

export function getCustomerOrders(customerId: ObjectId) {
  const pipeline: Document[] = [
    { $match: { customerId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "menuItems",
        localField: "itemId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              itemName: 1,
              images: 1,
              price: 1,
              category: 1,
            },
          },
        ],
        as: "item",
      },
    },
    {
      $unwind: {
        path: "$item",
        preserveNullAndEmptyArrays: true,
      },
    },
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
              email: 1,
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
    {
      $addFields: {
        requestDate: "$createdAt",
      },
    },
  ];

  return orders.aggregate(pipeline).toArray();
}

export async function cancelCustomerOrder(
  orderId: string,
  customerId: ObjectId,
) {
  const order = await orders.findOne({
    _id: new ObjectId(orderId),
    customerId,
  });

  if (!order) {
    return { error: "NOT_FOUND", message: "Order not found." };
  }

  if (order.status !== "pending") {
    return {
      error: "INVALID_STATE",
      message: `Cannot cancel an order that is already ${order.status}.`,
    };
  }

  const updatedOrder = await orders.findOneAndUpdate(
    { _id: new ObjectId(orderId), customerId },
    { $set: { status: "cancelled" } },
    { returnDocument: "after" },
  );

  return { order: updatedOrder };
}

export async function updateVendorOrderStatus(
  orderId: string,
  vendorId: ObjectId,
  status: "accepted" | "rejected",
) {
  const order = await orders.findOne({
    _id: new ObjectId(orderId),
    vendorId,
  });

  if (!order) {
    return { error: "NOT_FOUND", message: "Order not found." };
  }

  if (order.status !== "pending") {
    return {
      error: "INVALID_STATE",
      message: `Cannot update an order that is already ${order.status}.`,
    };
  }

  const updatedOrder = await orders.findOneAndUpdate(
    { _id: new ObjectId(orderId), vendorId },
    { $set: { status } },
    { returnDocument: "after" },
  );

  return { order: updatedOrder };
}
export function getVendorOrders(vendorId: ObjectId) {
  const pipeline: Document[] = [
    { $match: { vendorId } },
    { $sort: { createdAt: -1 } },
    {
      $lookup: {
        from: "menuItems",
        localField: "itemId",
        foreignField: "_id",
        as: "item",
      },
    },
    {
      $unwind: {
        path: "$item",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "user",
        localField: "customerId",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              email: 1,
              phone: 1,
            },
          },
        ],
        as: "customer",
      },
    },
    {
      $unwind: {
        path: "$customer",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        customerMessage: "$message",
      },
    },
  ];

  return orders.aggregate(pipeline).toArray();
}
