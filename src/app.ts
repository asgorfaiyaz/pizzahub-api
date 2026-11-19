import cors from "cors";
import express from "express";
import { errorHandler } from "./middleware/error-handler.js";
import menuItemsRoutes from "./routes/menuItems.routes.js";
import vendorsRoutes from "./routes/vendors.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/health", async (_req, res) => {
  res.status(200).send("hello world");
});

app.use("/api/v1/menu-items", menuItemsRoutes);
app.use("/api/v1/vendors", vendorsRoutes);

app.use(errorHandler);

export default app;
