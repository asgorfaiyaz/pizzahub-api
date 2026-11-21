import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number.parseInt(process.env.PORT ?? "5000", 10),
  mongodbUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017",
  mongodbDb: process.env.MONGODB_DB ?? "hireloop",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
};
