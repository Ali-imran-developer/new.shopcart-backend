const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getCustomerOrderCounts,
  getMonthlyOrdersSummary,
  getOrderStatsByVendor,
  getTopSellingProducts,
} = require("../controllers/order");

router.post("/create", createOrder);
router.get("/getting", getAllOrders);
router.get("/vendor-stats", getOrderStatsByVendor);
router.get("/monthly-summary", getMonthlyOrdersSummary);
router.get("/top-products", getTopSellingProducts);
router.get("/customer-count", getCustomerOrderCounts);

module.exports = router;