const express = require("express");
const router = express.Router();
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

router.post("/create", createOrder);
router.get("/get", getAllOrder);
router.put("/update/:id", updateOrder);
router.delete("/delete/:id", deleteOrder);
router.put("/status/update/:id", updateStatus);
router.post("/booking", bookingOrder);
router.get("/booking/get", getBookingOrder);
router.get("/vendor-stats", getOrderStatsByVendor);
router.get("/monthly-summary", getMonthlyOrdersSummary);
router.get("/top-products", getTopSellingProducts);
router.get("/customer-count", getCustomerOrderCounts);

module.exports = router;