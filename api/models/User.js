const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  name: { type: String, default: "" },
  address: { type: String, default: "" },
  image: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  resetCode: { type: String, default: null },
  resetCodeExpiry: { type: Date, default: null },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);
module.exports = User;