const express = require("express");
const cors = require("cors");
const authRouter = require("./auth/index");
const OrderRouter = require("./orders/index");
const CategoryRoute = require("./categories/index");
const subCategoryRoutes = require("./subcategories/index");
const productRouter = require("./products/index");
const resaleRouter = require("./resale");
const shipperInfo = require("./shipperinfo/index");
const courierRouter = require("./couriers/index");
const customerRouter = require("./customer/index");
const storeRouter = require("./store/index");
const stripeRouter = require("./stripe/index");
const ProfileRouter = require("./profile/index");
const testRoutes = require("./populate/index");
const userRoutes = require("./users/index");
const session = require("express-session");
const passport = require("passport");
const googleAuthRoutes = require("./googleauth/index");
const dbConnect = require("./dbConnect");
const serverless = require("serverless-http");
require("dotenv").config();
require("./controllers/passport");
const path = require("path");

const app = express();
dbConnect();
app.use(cors());
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(session({ secret: "google_secret", resave: false, saveUninitialized: false,}));
app.use(passport.initialize());
app.use(passport.session());

app.use("/api", authRouter);
app.use("/api/auth", googleAuthRoutes);
app.use("/api/orders", OrderRouter);
app.use("/api/products", productRouter);
app.use("/api/resale", resaleRouter);
app.use("/api/categories", CategoryRoute);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/shipperinfo", shipperInfo);
app.use("/api/customer", customerRouter);
app.use("/api/store", storeRouter);
app.use("/api/courier", courierRouter);
app.use("/api/profile", ProfileRouter);
app.use("/populate", testRoutes);
app.use("/users", userRoutes);
app.use("/api/stripe", stripeRouter);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// require("./crones/order");
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;
module.exports.handler = serverless(app);