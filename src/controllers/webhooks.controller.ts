import type { RequestHandler } from "express";
import type Stripe from "stripe";
import { env } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { handleStripeWebhookEvent } from "../services/subscription.service.js";

export const handleStripeWebhook: RequestHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  if (!sig || typeof sig !== "string") {
    return res.status(400).send("Webhook signature header is required.");
  }

  let event: Stripe.Event;

  try {
    const rawBody = (req as any).rawBody;
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      env.stripeWebhookSecret,
    );
  } catch (err: any) {
    console.error("Stripe Webhook Signature Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleStripeWebhookEvent(event);
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return res.status(500).json({ error: "Webhook processing error" });
  }
};
