import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
import { env } from "./../config/env.js";
import { stripe } from "./../config/stripe.js";
import type Stripe from "stripe";

export interface TransactionDocument {
  _id?: ObjectId;
  transactionId: string;
  vendorId: ObjectId;
  amount: number;
  currency: string;
  paymentStatus: "completed" | "failed" | "pending";
  paymentMethod?: string[];
  stripeSessionId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
}

const users = getDatabase().collection("user");
const menuItems = getDatabase().collection("menuItems");
const transactions =
  getDatabase().collection<TransactionDocument>("transactions");

export const MAX_FREE_ACTIVE_ITEMS = 3;

/**
 * Check if a vendor is allowed to add or publish another item
 */
export async function canVendorAddMenuItem(
  vendorId: ObjectId,
): Promise<{ isPremium: boolean; reason?: string }> {
  const user = await users.findOne({ _id: vendorId });
  const isPremium =
    user?.subscriptionPlan === true || user?.subscriptionPlan === "premium";

  if (isPremium)
    return {
      isPremium: true,
    };

  // Count active/approved or pending items for this vendor
  const activeItemCount = await menuItems.countDocuments({
    vendorId,
    status: { $ne: "inactive" },
  });

  return {
    isPremium: false,
    reason: `Free plan limit reached (${activeItemCount}/${MAX_FREE_ACTIVE_ITEMS} active items). Please upgrade to Premium to publish more items.`,
  };
}

/**
 * Get current subscription status and active item usage
 */
export async function getVendorSubscriptionStatus(vendorId: ObjectId) {
  const user = await users.findOne({ _id: vendorId });
  const isPremium =
    user?.subscriptionPlan === true || user?.subscriptionPlan === "premium";

  const activeItemCount = await menuItems.countDocuments({
    vendorId,
    status: { $ne: "inactive" },
  });

  return {
    isPremium,
    plan: isPremium ? "premium" : "free",
    activeItemCount,
    maxFreeItems: MAX_FREE_ACTIVE_ITEMS,
    canPublishMore: isPremium || activeItemCount < MAX_FREE_ACTIVE_ITEMS,
  };
}

/**
 * Create a Stripe Checkout Session for vendor upgrade
 */
export async function createUpgradeCheckoutSession(
  vendorId: ObjectId,
): Promise<
  | { url: string | null }
  | { error: "NOT_FOUND" | "ALREADY_PREMIUM"; message: string }
> {
  const user = await users.findOne({ _id: vendorId });
  if (!user) {
    return { error: "NOT_FOUND", message: "Vendor account not found." };
  }

  // Check if already premium
  if (
    user.subscriptionPlan === true ||
    user.subscriptionPlan === "premium"
  ) {
    return {
      error: "ALREADY_PREMIUM",
      message: "You are already a Premium vendor.",
    };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: "price_1UeFscHiABkJtPu6XncAlmtq",
        quantity: 1,
      },
    ],
    customer_email: user.email,
    client_reference_id: vendorId.toString(),
    metadata: {
      vendorId: vendorId.toString(),
    },
    success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientUrl}/payment/cancel`,
  });

  return { url: session.url };
}

/**
 * Handle Stripe Webhook Events (Secure One-Time Payment Activation)
 */
export async function handleStripeWebhookEvent(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") {
    return;
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const vendorIdStr = session.metadata?.vendorId || session.client_reference_id;

  if (!vendorIdStr || !ObjectId.isValid(vendorIdStr)) {
    console.error("Webhook received without valid vendorId:", session.id);
    return;
  }

  const vendorId = new ObjectId(vendorIdStr);

  // Avoid duplicate records if Stripe retries the webhook
  const existingTransaction = await transactions.findOne({
    stripeSessionId: session.id,
  });
  if (existingTransaction) {
    return;
  }

  // Save completed transaction record
  const transactionDoc: TransactionDocument = {
    transactionId:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.id,
    vendorId,
    amount: (session.amount_total ?? 0) / 100,
    currency: session.currency || "usd",
    paymentStatus: "completed",
    paymentMethod: session.payment_method_types,
    stripeSessionId: session.id,
    stripeCustomerId:
      typeof session.customer === "string" ? session.customer : undefined,
    createdAt: new Date(),
  };

  await transactions.insertOne(transactionDoc);

  // Upgrade vendor to Premium
  await users.updateOne(
    { _id: vendorId },
    {
      $set: {
        subscriptionPlan: true,
      },
    },
  );
}

/**
 * Get payment confirmation for Payment Success page
 */
/**
 * Get payment confirmation for the success page (Read-only)
 * Only returns the record if the webhook has already verified and saved it.
 */
export async function getPaymentConfirmation(
  sessionId: string,
  vendorId: ObjectId,
) {
  const transaction = await transactions.findOne({
    stripeSessionId: sessionId,
    vendorId,
  });

  if (!transaction) {
    return null;
  }

  return {
    transactionId: transaction.transactionId,
    amount: transaction.amount,
    currency: transaction.currency.toUpperCase(),
    status: transaction.paymentStatus,
    plan: "Premium Vendor",
    createdAt: transaction.createdAt,
  };
}
