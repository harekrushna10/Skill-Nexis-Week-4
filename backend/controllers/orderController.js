import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export async function createOrder(req, res, next) {
  const session = await mongoose.startSession();
  try {
    const { items, shippingAddress } = req.body;
    const required = ["fullName", "phone", "address", "city", "postalCode"];
    if (!Array.isArray(items) || !items.length || !shippingAddress || required.some(k => !String(shippingAddress[k] || "").trim())) {
      return res.status(400).json({ message: "Add products and complete all shipping details." });
    }
    const normalized = [];
    let subtotal = 0;
    await session.withTransaction(async () => {
      for (const item of items) {
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw Object.assign(new Error("A product in your cart is no longer available."), { status: 400 });
        if (product.stock < quantity) throw Object.assign(new Error(`${product.name} does not have enough stock.`), { status: 400 });
        product.stock -= quantity;
        await product.save({ session });
        subtotal += product.price * quantity;
        normalized.push({ product: product._id, name: product.name, image: product.image, price: product.price, quantity });
      }
      const shipping = subtotal >= 2500 ? 0 : 99;
      const [order] = await Order.create([{
        user: req.user._id, items: normalized, shippingAddress,
        subtotal, shipping, total: subtotal + shipping, paymentMethod: "Cash on Delivery"
      }], { session });
      req.createdOrderId = order._id;
    });
    const order = await Order.findById(req.createdOrderId);
    res.status(201).json({ order, message: "Your order has been placed successfully." });
  } catch (error) { next(error); }
  finally { await session.endSession(); }
}

export async function myOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) { next(error); }
}

export async function allOrders(req, res, next) {
  try {
    const orders = await Order.find().populate("user", "name email").sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) { next(error); }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const allowed = ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"];
    if (!allowed.includes(req.body.status)) return res.status(400).json({ message: "Invalid order status." });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (error) { next(error); }
}
