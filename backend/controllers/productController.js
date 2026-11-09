import Product from "../models/Product.js";

export async function listProducts(req, res, next) {
  try {
    const { search = "", category = "", sort = "featured" } = req.query;
    const filter = { stock: { $gte: 0 } };
    if (category && category !== "All") filter.category = category;
    if (search.trim()) filter.name = { $regex: search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
    const sortMap = {
      featured: { featured: -1, createdAt: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
      newest: { createdAt: -1 }
    };
    const products = await Product.find(filter).sort(sortMap[sort] || sortMap.featured);
    res.json({ products });
  } catch (error) { next(error); }
}

export async function getProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try {
    const { name, description, category, price, compareAtPrice, image, stock, featured } = req.body;
    if (!name || !description || !category || !image || !Number.isFinite(Number(price))) {
      return res.status(400).json({ message: "Please complete all required product fields." });
    }
    const product = await Product.create({
      name, description, category, price: Number(price),
      compareAtPrice: Number(compareAtPrice) || 0, image,
      stock: Math.max(0, Number(stock) || 0), featured: Boolean(featured)
    });
    res.status(201).json({ product });
  } catch (error) { next(error); }
}

export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted." });
  } catch (error) { next(error); }
}
