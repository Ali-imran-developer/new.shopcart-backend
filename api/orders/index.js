const express = require("express");
const router = express.Router();
const protect = require("../controllers/protect");
const {
  createOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  updateStatus,
  bookingOrder,
  getBookingOrder,
  getCustomerOrderCounts,
  getMonthlyOrdersSummary,
  getOrderStatsByVendor,
  getTopSellingProducts,
} = require("../controllers/order");

router.post("/create", protect, createOrder);
router.get("/get", protect, getAllOrder);
router.put("/update/:id", updateOrder);
router.delete("/delete/:id", deleteOrder);
router.put("/status/update/:id", updateStatus);
router.post("/booking", protect, bookingOrder);
router.get("/booking/get", protect, getBookingOrder);
router.get("/vendor-stats", getOrderStatsByVendor);
router.get("/monthly-summary", getMonthlyOrdersSummary);
router.get("/top-products", getTopSellingProducts);
router.get("/customer-count", getCustomerOrderCounts);

module.exports = router;