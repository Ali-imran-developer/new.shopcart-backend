const mongoose = require("mongoose");

const ProductResaleSchema = new mongoose.Schema({
  discount: { type: Number, required: true, trim: true },
  inventory: { type: Number, required: true, trim: true },
  shipping: { type: Number, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  subCategory: { type: String, required: true, trim: true },
  myResellers: { type: Boolean, required: true, trim: true },
});

const resaleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    resale: { type: ProductResaleSchema, required: true }
  },
  { timestamps: true }
);

const Resale = mongoose.model("Resale", resaleSchema);
module.exports = Resale;