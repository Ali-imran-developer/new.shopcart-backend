const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrder,
  getCustomerOrderCounts,
  getMonthlyOrdersSummary,
  getOrderStatsByVendor,
  getTopSellingProducts,
} = require("../controllers/order");

router.post("/create", createOrder);
router.get("/getting", getAllOrder);
router.get("/vendor-stats", getOrderStatsByVendor);
router.get("/monthly-summary", getMonthlyOrdersSummary);
router.get("/top-products", getTopSellingProducts);
router.get("/customer-count", getCustomerOrderCounts);

module.exports = router;