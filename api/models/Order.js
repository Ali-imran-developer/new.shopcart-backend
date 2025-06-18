const mongoose = require("mongoose");

const lineItemsData = new mongoose.Schema({
  itemId: Number,
  productName: String,
  productTitle: String,
  productPrice: String,
  productQuantity: Number,
  productSKU: String,
  variantId: Number,
  variantTitle: String,
  productVendor: String,
  grams: Number,
});

const orderSchema = new mongoose.Schema({
  orderId: String,
  orderShopifyId: Number,
  createdAt: String,
  contactEmail: String,
  email: String,
  phone: String,
  financialStatus: String,
  fulfillmentStatus: String,
  note: String,
  tags: String,
  customerId: Number,
  customerEmail: String,
  customerPhone: String,
  customerCreatedAt: String,
  addressId: Number,
  addressCustomerId: Number,
  customerCompany: String,
  customerName: String,
  customerAddress1: String,
  customerAddress2: String,
  customerCity: String,
  customerZip: String,
  customerCountry: String,
  countryName: String,
  addressPhone: String,
  isDefaultAddress: Boolean,
  lineItems: [lineItemsData],
});

module.exports = mongoose.models.Orders || mongoose.model("Orders", orderSchema);