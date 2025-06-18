const express = require("express");
const router = express.Router();
const { createOrder, getAllOrders } = require("../controllers/order");

router.post("/create", createOrder);
router.get("/getting", getAllOrders);

module.exports = router;