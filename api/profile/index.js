const express = require("express");
const { updateProfile, getProfile } = require("../controllers/profile");
const router = express.Router();
const protect = require("../controllers/protect");

router.get("/get", protect, getProfile);
router.put("/update", protect, updateProfile);

module.exports = router;