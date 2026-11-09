import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.get("/", (_req, res) => res.json({ message: "ShopSphere API is running", status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((error, _req, res, _next) => {
  console.error(error);
  const status = error.status || (error.name === "ValidationError" ? 400 : 500);
  res.status(status).json({ message: error.code === 11000 ? "This email is already registered." : (error.message || "Something went wrong.") });
});

const port = process.env.PORT || 5003;
try {
  await connectDB();
  app.listen(port, () => console.log(`ShopSphere API listening on http://localhost:${port}`));
} catch (error) {
  console.error("Server startup failed:", error.message);
  process.exit(1);
}
