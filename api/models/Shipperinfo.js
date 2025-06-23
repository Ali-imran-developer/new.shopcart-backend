const mongoose = require("mongoose");

const shipperInfoSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    locationName: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    storeName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    returnAddress: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const ShipperInfo = mongoose.model("ShipperInfo", shipperInfoSchema);
module.exports = ShipperInfo;