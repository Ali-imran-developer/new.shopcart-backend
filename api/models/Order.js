// const mongoose = require("mongoose");

// const lineItemsData = new mongoose.Schema({
//   itemId: { type: Number },
//   productName: { type: String },
//   productTitle: { type: String },
//   productPrice: { type: String },
//   productQuantity: { type: Number },
//   productSKU: { type: String },
//   variantId: { type: Number },
//   variantTitle: { type: String },
//   productVendor: { type: String },
//   grams: { type: Number },
// });

// const addressSchema = new mongoose.Schema({
//   first_name: { type: String },
//   last_name: { type: String },
//   address1: { type: String },
//   address2: { type: String },
//   phone: { type: String },
//   city: { type: String },
//   zip: { type: String },
//   country: { type: String },
//   company: { type: String },
//   name: { type: String },
// });

// const orderSchema = new mongoose.Schema({
//   orderId: { type: String },
//   orderShopifyId: { type: Number },
//   customerEmail2: { type: String },
//   createdAt: { type: String },
//   contactEmail: { type: String },
//   email: { type: String },
//   phone: { type: String },
//   financialStatus: { type: String },
//   fulfillmentStatus: { type: String },
//   note: { type: String },
//   tags: { type: String },
//   customerId: { type: Number },
//   customerEmail: { type: String },
//   customerPhone: { type: String },
//   customerCreatedAt: { type: String },
//   addressId: { type: Number },
//   addressCustomerId: { type: Number },
//   customerCompany: { type: String },
//   customerName: { type: String },
//   customerAddress1: { type: String },
//   customerAddress2: { type: String },
//   customerCity: { type: String },
//   customerZip: { type: String },
//   customerCountry: { type: String },
//   countryName: { type: String },
//   addressPhone: { type: String },
//   isDefaultAddress: { type: Boolean },
//   lineItems: [lineItemsData],
//   shippingAddress: addressSchema,
//   billingAddress: addressSchema,
// });

// module.exports = mongoose.models.Orders || mongoose.model("Orders", orderSchema);


const mongoose = require("mongoose");

const ShipmentDetailsSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true },
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
});

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  productQty: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema(
  {
    // user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
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