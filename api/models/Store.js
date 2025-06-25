const mongoose = require("mongoose");

const StoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeName: { type: String, required: true, trim: true },
    storeDomain: { type: String, required: true, trim: true },
    storeLogo: { type: String, required: false, trim: true },
    totalOrders: { type: Number, trim: true, default: 0, ref: "Order" },
    totalProducts: { type: Number, trim: true, default: 0, ref: "Product" },
    totalCustomers: { type: Number, trim: true, default: 0, ref: "Customer" },
  },
  { timestamps: true }
);

const Store = mongoose.model("Store", StoreSchema);
module.exports = Store;