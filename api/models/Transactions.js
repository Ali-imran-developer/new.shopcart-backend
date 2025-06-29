const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    paymentIntentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: { type: String, required: true },
    email: { type: String },
    orderId: { type: String },
    customer: {
      id: String,
      name: String,
      email: String,
    },
    paymentMethod: {
      type: {
        type: String,
        brand: String,
        last4: String,
        exp_month: Number,
        exp_year: Number,
      },
    },
    createdAt: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);