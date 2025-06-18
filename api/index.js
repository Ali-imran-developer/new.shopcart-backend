const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");
const dbConnect = require("./dbConnect");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();
dbConnect();
app.use(express.json());
app.use(cors());

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

  lineItems: { type: [lineItemsData] },
});

const Orders = mongoose.models.Orders || mongoose.model("Orders", orderSchema);

async function registerOrderWebhook(shop, accessToken) {
  try {
    const response = await axios.post(
      `https://${shop}/admin/api/2023-10/webhooks.json`,
      {
        webhook: {
          topic: "orders/create",
          address: `https://learning-express-three.vercel.app/orders/create`,
          format: "json",
        },
      },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("✅ Webhook registered:", response.data);
    return response.data;
  } catch (err) {
    console.error("❌ Webhook registration failed:", err.response?.data || err.message);
    throw err;
  }
}

app.get("/webhook/register", async (req, res) => {
  try {
    const shop = "crkwtg-ji.myshopify.com";
    const accessToken = "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";
    const result = await registerOrderWebhook(shop, accessToken);
    res.status(200).json({ success: true, message: "Webhook registered", data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error?.message });
  }
});

app.post("/orders/create", async (req, res) => {
  try {
    // await dbConnect();
    const body = req.body;
    console.log(body);
    const order = await body;
    const parsed = {
      orderId: order?.name,
      orderShopifyId: order?.id,
      createdAt: order?.created_at,
      contactEmail: order?.contact_email,
      email: order?.email,
      phone: order?.phone,
      financialStatus: order?.financial_status,
      fulfillmentStatus: order?.fulfillment_status,
      note: order?.note,
      tags: order?.tags,
      customerId: order?.customer?.id,
      customerEmail: order?.customer?.email,
      customerPhone: order?.customer?.phone,
      customerCreatedAt: order?.customer?.created_at,
      addressId: order?.customer?.default_address?.id,
      addressCustomerId: order?.customer?.default_address?.customer_id,
      customerCompany: order?.customer?.default_address?.company,
      customerName: order?.customer?.default_address?.name,
      customerAddress1: order?.customer?.default_address?.address1,
      customerAddress2: order?.customer?.default_address?.address2,
      customerCity: order?.customer?.default_address?.city,
      customerZip: order?.customer?.default_address?.zip,
      customerCountry: order?.customer?.default_address?.country,
      countryName: order?.customer?.default_address?.country_name,
      addressPhone: order?.customer?.default_address?.phone,
      isDefaultAddress: order?.customer?.default_address?.default,
      lineItems: order?.line_items?.map((item) => ({
        itemId: item?.id,
        productName: item?.name,
        productTitle: item?.title,
        productPrice: item?.price,
        productQuantity: item?.quantity,
        productSKU: item?.sku,
        variantId: item?.variant_id,
        variantTitle: item?.variant_title,
        productVendor: item?.vendor,
        grams: item?.grams,
      })),
    };
    console.log(parsed);
    const saved = await Orders.create(parsed);
    return res.status(201).json({
      success: true,
      message: "Order received successfully!",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error?.message });
  }
});

app.get("/orders/getting", async (req, res) => {
  try {
    // await dbConnect();
    const orders = await Orders.find({});
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).send("Server Error.");
  }
});

module.exports = app;
module.exports.handler = serverless(app);