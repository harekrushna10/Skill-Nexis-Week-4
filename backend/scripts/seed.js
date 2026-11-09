
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config();

const products = [
  {
    name: "Studio Wireless Headphones",
    category: "Tech",
    price: 4299,
    compareAtPrice: 5499,
    stock: 18,
    featured: true,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
    description: "Immersive sound, soft memory-foam cushions, and a clean everyday silhouette. Designed for long listening sessions."
  },
  {
    name: "Everyday Carry Backpack",
    category: "Accessories",
    price: 2499,
    compareAtPrice: 3199,
    stock: 24,
    featured: true,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=85",
    description: "A versatile, weather-resistant backpack with thoughtful pockets for your daily essentials."
  },
  {
    name: "Minimal Ceramic Table Lamp",
    category: "Home",
    price: 1899,
    compareAtPrice: 2299,
    stock: 12,
    featured: true,
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    description: "Warm ambient lighting meets a sculptural ceramic base. A considered detail for your space."
  },
  {
    name: "Classic Chronograph Watch",
    category: "Accessories",
    price: 5999,
    compareAtPrice: 7499,
    stock: 9,
    featured: true,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85",
    description: "A timeless dial, brushed finish, and comfortable strap make this an easy everyday classic."
  },
  {
    name: "Essential Everyday Sneakers",
    category: "Fashion",
    price: 3299,
    compareAtPrice: 3999,
    stock: 20,
    featured: false,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    description: "Lightweight comfort with a crisp, modern profile that pairs with almost anything."
  },
  {
    name: "Portable Bluetooth Speaker",
    category: "Tech",
    price: 2799,
    compareAtPrice: 3499,
    stock: 15,
    featured: false,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=85",
    description: "Room-filling sound in a compact, travel-friendly design with simple controls."
  },
  {
    name: "Soft Knit Throw Blanket",
    category: "Home",
    price: 1599,
    compareAtPrice: 1999,
    stock: 30,
    featured: false,
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    description: "A soft textured layer that brings warmth and a relaxed finish to your living space."
  },
  {
    name: "Modern Everyday Sunglasses",
    category: "Fashion",
    price: 1399,
    compareAtPrice: 1799,
    stock: 28,
    featured: false,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85",
    description: "A flattering modern frame with a lightweight feel for sunny days and city breaks."
  }
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing. Configure backend/.env");
    }

    await connectDB();

    console.log("MongoDB connected successfully.");

    const email = (
      process.env.ADMIN_EMAIL || "admin@shopsphere.local"
    ).toLowerCase();

    const password = process.env.ADMIN_PASSWORD || "Admin@12345";
    const name = process.env.ADMIN_NAME || "ShopSphere Admin";

    const hash = await bcrypt.hash(password, 12);

    await User.findOneAndUpdate(
      { email },
      {
        name,
        email,
        password: hash,
        role: "admin"
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log("Admin account created/updated successfully.");

    if (await Product.countDocuments() === 0) {
      await Product.insertMany(products);
      console.log(`${products.length} starter products inserted.`);
    } else {
      console.log("Products already exist. Skipping product insertion.");
    }

    console.log(`Seed complete. Admin email: ${email}`);
    console.log("ShopSphere starter data is ready.");

  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;

  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
};

seedDatabase();
