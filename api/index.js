const express = require("express");
const cors = require("cors");
const axios = require("axios");
const orderRoutes = require("./orders/index");
const dbConnect = require("./dbConnect");
const serverless = require("serverless-http");
require("dotenv").config();

const app = express();
dbConnect();
app.use(express.json());
app.use(cors());

app.use("/orders", orderRoutes);

// async function registerOrderWebhook(shop, accessToken) {
//   try {
//     const response = await axios.post(
//       `https://${shop}/admin/api/2023-10/webhooks.json`,
//       {
//         webhook: {
//           topic: "orders/create",
//           address: `https://learning-express-three.vercel.app/orders/create`,
//           format: "json",
//         },
//       },
//       {
//         headers: {
//           "X-Shopify-Access-Token": accessToken,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     console.log("✅ Webhook registered:", response.data);
//     return response.data;
//   } catch (err) {
//     console.error("❌ Webhook registration failed:", err.response?.data || err.message);
//     throw err;
//   }
// }

// app.get("/webhook/register", async (req, res) => {
//   try {
//     const shop = "crkwtg-ji.myshopify.com";
//     const accessToken = "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";
//     const result = await registerOrderWebhook(shop, accessToken);
//     res.status(200).json({ success: true, message: "Webhook registered", data: result });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error?.message });
//   }
// });

module.exports = app;
module.exports.handler = serverless(app);