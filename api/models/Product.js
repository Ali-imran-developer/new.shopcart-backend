const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: "default-image.jpg" },
    category: { type: String, trim: true },
    subCategory: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0 },
    available: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;