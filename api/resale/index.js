const express = require("express");
const { createResaleProduct, getAllResaleProducts, getUserResaleProducts } = require("../controllers/resaleController");
const router = express.Router();
const protect = require("../controllers/protect");

router.post("/listed", protect, createResaleProduct);
router.get("/getListed/all", getAllResaleProducts);
router.get("/getListed/mine", protect, getUserResaleProducts);

module.exports = router;