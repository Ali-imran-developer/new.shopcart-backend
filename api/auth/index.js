const express = require("express");
const { registerUser, loginUser, getUser, updateUser, forgetPassword, resetPassword } = require("../controllers/auth");
const protect = require("../controllers/protect");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/get", protect, getUser);
router.put("/update", protect, updateUser);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", resetPassword);

module.exports = router;