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
  // githubId: { type: Number, required: false },
  repoName: { type: String, required: true },
  image: { type: String, required: true },
  committerName: { type: String, required: true },
  committerEmail: { type: String, required: true },
  commitDate: { type: String, required: true },
  commitData: { type: Number, required: true },
  repositoryId: { type: Number, required: true },
  repositoryLanguage: { type: String, required: true },
  branch: { type: String, required: true },
});

const Webhook = mongoose.models.Webhook || mongoose.model("Webhook", webhookSchema);

app.get("/", (req, res) => {
  res.send("🌐 Webhook Server Working on Vercel");
});

app.post("/webhook/create", async (req, res) => {
  try {
    await dbConnect();
    const body = req.body;

    const dataToSave = {
      // githubId: body?.id,
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

module.exports = app;
module.exports.handler = serverless(app);