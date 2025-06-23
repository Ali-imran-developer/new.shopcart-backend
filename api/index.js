const express = require("express");
const cors = require("cors");
const OrderRouter = require("./orders/index");
const CategoryRoute = require("./categories/index");
const productRouter = require("./products/index");
const shipperInfo = require("./shipperinfo/index");
const testRoutes = require("./populate/index");
const userRoutes = require("./users/index");
const dbConnect = require("./dbConnect");
const serverless = require("serverless-http");
require("dotenv").config();
const path = require("path");

const app = express();
dbConnect();
app.use(express.json());
app.use(cors());

app.use("/api/orders", OrderRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", CategoryRoute);
app.use("/api/shipperinfo", shipperInfo);
app.use("/populate", testRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// require("./crones/order");
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);