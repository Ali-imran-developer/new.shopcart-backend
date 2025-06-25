const express = require("express");
const { createShipperInfo, getShipperInfo, updateShipperInfo, deleteShipperInfo } = require("../controllers/shipperinfo");
const router = express.Router();
const protect = require("../controllers/protect");

router.post("/create", protect, createShipperInfo);
router.get("/get", protect, getShipperInfo);
router.put("/update/:id", updateShipperInfo);
router.delete("/delete/:id", deleteShipperInfo);

module.exports = router;