const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

let isConnected = false;
const dbConnect = async () => {
  if (isConnected) return;
  if (!process.env.DB) throw new Error("MONGO_URI not defined");
  await mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log("✅ MongoDB connected");
};

const webhookSchema = new mongoose.Schema({
  githubId: { type: Number },
  repoName: { type: String },
  image: { type: String },
  committerName: { type: String },
  committerEmail: { type: String },
  commitDate: { type: String },
  commitData: { type: Number },
  repositoryId: { type: Number },
  repositoryLanguage: { type: String },
  branch: { type: String },
});

const Webhook =
  mongoose.models.Webhook || mongoose.model("Webhook", webhookSchema);

app.get("/", (req, res) => {
  res.send("🌐 Webhook Server Working on Vercel");
});

app.post("/webhook/create", async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;
    console.log(body);
    const dataToSave = {
      githubId: body?.id,
      repoName: body?.name,
      image: body?.avatar_url,
      committerName: body?.commit?.commit?.committer?.name,
      committerEmail: body?.commit?.commit?.committer?.email,
      commitDate: body?.commit?.commit?.committer?.date,
      commitData: body?.repository?.owner?.size,
      repositoryId: body?.repository?.id,
      repositoryLanguage: body?.repository?.owner?.language,
      branch: body?.repository?.owner?.default_branch,
    };
    const saved = await Webhook.create(dataToSave);
    return res.status(201).json({
      success: true,
      message: "Data saved",
      data: saved,
    });
  } catch (error) {
    const body = req.body;
    console.log(body);
    console.error("❌ POST Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/webhook/getting", async (req, res) => {
  try {
    await dbConnect();
    const all = await Webhook.find().sort({ _id: -1 });
    return res.status(200).json({ success: true, data: all });
  } catch (error) {
    console.error("❌ GET Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

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

app.post("/orders/create", async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;
    console.log(body);
    const order = await body.json();
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
    await dbConnect();
    const orders = await Orders.find({});
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).send("Server Error.");
  }
});

module.exports = app;
module.exports.handler = serverless(app);