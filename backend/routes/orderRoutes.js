import { Router } from "express";
import { allOrders, createOrder, myOrders, updateOrderStatus } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";
const router = Router();
router.post("/", protect, createOrder);
router.get("/my", protect, myOrders);
router.get("/", protect, adminOnly, allOrders);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);
export default router;
