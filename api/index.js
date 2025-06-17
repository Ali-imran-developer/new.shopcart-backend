const express = require("express");
const cors = require("cors");
const dbConnect = require("./dbConnect");
const serverless = require("serverless-http");

require("dotenv").config();
const app = express();

dbConnect();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("<h1>what the fuck is this?</h1>");
});

app.post("/webhook/create", async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const event = req.headers["x-github-event"];
    const body = req.body;
    console.log("🔥 GitHub Webhook Event:", event);
    console.log("📦 Payload:", JSON.stringify(body, null, 2));
    return res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/webhook/getting", (req, res) => {
  const mockData = {
    id: 1,
    event: "order_created",
    status: "received",
  };
  console.log(mockData);
  return res.status(200).json({
    success: true,
    message: "Webhook data fetched",
    data: mockData,
  });
});

module.exports = app;
module.exports.handler = serverless(app);