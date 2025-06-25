const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    customerName: { type: String, trim: true, required: true, },
    phone: { type: Number, required: true, required: false, },
    city: { type: String, trim: true, required: true, },
    totalOrders: { type: Number, trim: true, required: true, min: 0 },
    totalSpent: { type: Number, required: true, min: 0, trim: true, },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;