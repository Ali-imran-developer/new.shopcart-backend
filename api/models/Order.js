const mongoose = require("mongoose");

const ShipmentDetailsSchema = new mongoose.Schema({
  email: { type: String, required: false, trim: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  address: { type: String, required: true, trim: true },
});

const PricingSchema = new mongoose.Schema({
  subTotal: { type: Number, required: true },
  orderTax: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  shipping: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  profit : { type: Number, required: true, default: 0 },
});

const productSchema = new mongoose.Schema({}, { strict: false, _id: false });

const OrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    clientSecret: { type: String, trim: true },
    name: { type: String, trim: true },
    paymentMethod: { type: String, trim: true, required: false },
    shipperCity: { type: String, trim: true, required: false },
    products: { type: [productSchema], required: true },
    tags: { type: [String], required: false },
    promoCode: { type: String, trim: true },
    shipmentDetails: { type: ShipmentDetailsSchema, required: true },
    pricing: { type: PricingSchema, required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    status: { type: String, trim: true, required: true },
    trackingId: { type: String, trim: true, required: false, default: null },
    courierId: { type: mongoose.Schema.Types.ObjectId, ref: "Courier", default: null },
    shipperId: { type: mongoose.Schema.Types.ObjectId, ref: "ShipperInfo", default: null },
    shipmentType: { type: String,  default: null },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;