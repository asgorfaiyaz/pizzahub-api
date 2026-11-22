import { ObjectId, type Filter, type Document } from "mongodb";
import { getDatabase } from "../config/database.js";
import type {
  GetAdminTransactionsQuery,
  GetAdminUsersQuery,
} from "../schemas/admin.schema.js";

const users = getDatabase().collection("user");
const sessions = getDatabase().collection("session");
const transactions = getDatabase().collection("transactions");

export async function getAllUsers(options: Partial<GetAdminUsersQuery> = {}) {
  const { search, role, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const filter: Filter<Document> = {};

  if (role && role !== "all") {
    filter.role = role;
  }

  if (search && search.trim()) {
    const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
      { businessName: { $regex: escaped, $options: "i" } },
    ];
  }

  const [usersList, total] = await Promise.all([
    users
      .find(filter, { projection: { password: 0 } })
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    users.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    users: usersList,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}

export async function getUserById(id: string) {
  if (!ObjectId.isValid(id)) {
    return null;
  }

  return users.findOne(
    { _id: new ObjectId(id) },
    { projection: { password: 0 } },
  );
}

export async function updateUserBlockStatus(
  userId: string,
  isBlocked: boolean,
  adminId: ObjectId,
) {
  if (!ObjectId.isValid(userId)) {
    return { error: "INVALID_ID", message: "Invalid user ID format." };
  }

  const targetId = new ObjectId(userId);

  // Prevent admin from blocking themselves
  if (targetId.equals(adminId)) {
    return {
      error: "SELF_BLOCK",
      message: "You cannot block or unblock your own admin account.",
    };
  }

  const user = await users.findOne({ _id: targetId });
  if (!user) {
    return { error: "NOT_FOUND", message: "User not found." };
  }

  await users.updateOne(
    { _id: targetId },
    {
      $set: {
        isBlocked,
        updatedAt: new Date(),
      },
    },
  );

  // When blocking, terminate all active sessions for this user
  if (isBlocked) {
    await sessions.deleteMany({ userId: targetId });
  }

  const updatedUser = await users.findOne(
    { _id: targetId },
    { projection: { password: 0 } },
  );

  return { user: updatedUser };
}

export async function getAllTransactions(
  options: Partial<GetAdminTransactionsQuery> = {},
) {
  const { page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  const pipeline: Document[] = [
    { $sort: { createdAt: -1 } },
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
              email: 1,
              businessName: 1,
              phone: 1,
              subscriptionPlan: 1,
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
      $project: {
        _id: 1,
        transactionId: 1,
        amount: 1,
        currency: 1,
        paymentStatus: 1,
        paymentMethod: 1,
        createdAt: 1,
        transactionDate: "$createdAt",
        subscriptionPlan: "$vendor.subscriptionPlan",
        vendor: {
          _id: "$vendor._id",
          name: "$vendor.name",
          email: "$vendor.email",
          businessName: "$vendor.businessName",
          phone: "$vendor.phone",
        },
      },
    },
  ];

  const [items, total] = await Promise.all([
    transactions.aggregate(pipeline).toArray(),
    transactions.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    transactions: items,
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  };
}
