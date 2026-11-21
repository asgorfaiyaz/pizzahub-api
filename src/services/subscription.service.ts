import { ObjectId } from "mongodb";
import { getDatabase } from "../config/database.js";
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
const transactions =
  getDatabase().collection<TransactionDocument>("transactions");
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
        isPremium: true,
      },
    },
  );
}
