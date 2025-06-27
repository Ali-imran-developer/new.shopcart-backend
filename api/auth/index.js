const express = require("express");
const { registerUser, loginUser, updateUser, forgetPassword, resetPassword } = require("../controllers/auth");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/update/:id", updateUser);
router.post("/forgot-password", forgetPassword);
router.post("/reset-password", resetPassword);

module.exports = router;