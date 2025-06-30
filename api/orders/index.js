const express = require("express");
const router = express.Router();
const protect = require("../controllers/protect");
const rateLimiter  = require("../controllers/ratelimiter");
const { createOrder, getAllOrder, updateOrder, deleteOrder, updateStatus, bookingOrder, getBookingOrder, getDashboardStats } = require("../controllers/order");

router.post("/create", protect, createOrder);
router.get("/get", rateLimiter(2, 1), protect, getAllOrder);
router.get("/dashboard-stats", protect, getDashboardStats);
router.put("/update/:id", updateOrder);
router.delete("/delete/:id", deleteOrder);
router.put("/status/update/:id", updateStatus);
router.post("/booking", protect, bookingOrder);
router.get("/booking/get", protect, getBookingOrder);

module.exports = router;