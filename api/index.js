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
  res.send("<h1>Hello World from Vercel!</h1>");
});

module.exports = app;
module.exports.handler = serverless(app);