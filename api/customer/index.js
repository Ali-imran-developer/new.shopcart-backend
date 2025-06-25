const express = require("express");
const { createCustomer, getAllCustomer, updateCustomer, deleteCustomer, } = require("../controllers/customer");
const router = express.Router();
const protect = require("../controllers/protect");

router.post("/create", protect, createCustomer);
router.get("/get", protect, getAllCustomer);
router.put("/update/:id", updateCustomer);
router.delete("/delete/:id", deleteCustomer);

module.exports = router;