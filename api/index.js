const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dbConnect = require("./dbConnect");
const serverless = require("serverless-http");

require("dotenv").config();
const app = express();

dbConnect();
app.use(express.json());
app.use(cors());

const webhookSchema = new mongoose.Schema({
  githubId: { type: Number, required: true },
  repoName: { type: String, required: true },
  image: { type: String, requied: true },
  committerName: { type: String, required: true },
  committerEmail: { type: String, required: true },
  commitDate: { type: String, required: true },
  commitData: { type: Number, required: true },
  repositoryId: { type: Number, required: true },
  repositoryLanguage: { type: String, required: true },
  branch: { type: String, required: true },
});

const Webhook = mongoose.model("Webhook", webhookSchema);

app.get("/", (req, res) => {
  res.send("<h1>what is this?</h1>");
});

app.post("/webhook/create", async (req, res) => {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method Not Allowed" });
  }
  try {
    const body = req.body;
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
    const saved = await new Webhook(dataToSave).save();
    console.log("✅ Saved webhook to DB:", saved);
    return res.status(201).json({
      success: true,
      message: "Webhook data saved",
      data: saved,
    });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
});

app.get("/webhook/getting", async (req, res) => {
  try {
    const allWebhooks = await Webhook.find().sort({ _id: -1 });
    return res.status(200).json({
      success: true,
      message: "Fetched webhook data",
      data: allWebhooks,
    });
  } catch (error) {
    console.error("❌ Error fetching data:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data",
    });
  }
});

module.exports = app;
module.exports.handler = serverless(app);