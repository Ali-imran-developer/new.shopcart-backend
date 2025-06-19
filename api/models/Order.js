const mongoose = require("mongoose");

const lineItemsData = new mongoose.Schema({
  itemId: { type: Number },
  productName: { type: String },
  productTitle: { type: String },
  productPrice: { type: String },
  productQuantity: { type: Number },
  productSKU: { type: String },
  variantId: { type: Number },
  variantTitle: { type: String },
  productVendor: { type: String },
  grams: { type: Number },
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String },
  orderShopifyId: { type: Number },
  customerEmail2: { type: String },
  createdAt: { type: String },
  contactEmail: { type: String },
  email: { type: String },
  phone: { type: String },
  financialStatus: { type: String },
  fulfillmentStatus: { type: String },
  note: { type: String },
  tags: { type: String },
  customerId: { type: Number },
  customerEmail: { type: String },
  customerPhone: { type: String },
  customerCreatedAt: { type: String },
  addressId: { type: Number },
  addressCustomerId: { type: Number },
  customerCompany: { type: String },
  customerName: { type: String },
  customerAddress1: { type: String },
  customerAddress2: { type: String },
  customerCity: { type: String },
  customerZip: { type: String },
  customerCountry: { type: String },
  countryName: { type: String },
  addressPhone: { type: String },
  isDefaultAddress: { type: Boolean },
  lineItems: [lineItemsData],
});

module.exports = mongoose.models.Orders || mongoose.model("Orders", orderSchema);