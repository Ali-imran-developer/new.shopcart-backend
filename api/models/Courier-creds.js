const mongoose = require("mongoose");

const CourierCredsSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courier: { type: mongoose.Schema.Types.ObjectId, ref: "Courier", required: true },
    couriersname: { type: String, ref: "Courier", required: true },
    apiKey: { type: String, required: true },
    apiPassword: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CourierCredsSchema.index({ user: 1, courier: 1 }, { unique: true });
module.exports = mongoose.model("CourierCreds", CourierCredsSchema);