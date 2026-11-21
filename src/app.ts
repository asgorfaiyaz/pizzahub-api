import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import customersRoutes from "./routes/customers.routes.js";
import menuItemsRoutes from "./routes/menuItems.routes.js";
import vendorsRoutes from "./routes/vendors.routes.js";
import webhooksRoutes from "./routes/webhooks.routes.js";

const app = express();

const allowedOrigins = [
  "https://pizzahub-asgorfaiyaz.vercel.app",
  "http://localhost:5173",
  env.clientUrl,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // if origin isn't undefind and if matches allowedOrigins arr then all good
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
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

app.use("/api/v1/menu-items", menuItemsRoutes);
app.use("/api/v1/customers", customersRoutes);
app.use("/api/v1/vendors", vendorsRoutes);
app.use("/api/v1/webhooks", webhooksRoutes);

app.use(errorHandler);

export default app;
