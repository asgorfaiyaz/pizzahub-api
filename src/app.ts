import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import adminRoutes from "./routes/admin.routes.js";
import customersRoutes from "./routes/customers.routes.js";
import menuItemsRoutes from "./routes/menuItems.routes.js";
import vendorsRoutes from "./routes/vendors.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "https://pizzahub-asgorfaiyaz.vercel.app",
      "http://localhost:5173",
      env.clientUrl,
    ],
    credentials: true,
  }),
);

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use("/health", async (_req, res) => {
  res.status(200).send("hello world");
});

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/menu-items", menuItemsRoutes);
app.use("/api/v1/customers", customersRoutes);
app.use("/api/v1/vendors", vendorsRoutes);
app.use("/api/v1/webhooks", webhooksRoutes);

app.use(errorHandler);

export default app;
