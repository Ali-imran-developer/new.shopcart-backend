const mongoose = require("mongoose");

const CourierSchema = new mongoose.Schema(
  {
    // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, required: false, trim: true },
  },
  { timestamps: true }
);

const Courier = mongoose.model("Courier", CourierSchema);
module.exports = Courier;