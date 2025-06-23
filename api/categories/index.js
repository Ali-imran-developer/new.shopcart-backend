const express = require("express");
const { createCategory, getAllCategory, updateCategory, deleteCategory } = require("../controllers/category");
const router = express.Router();
const protect = require("../controllers/protect")

router.post("/create", protect, createCategory);
router.get("/get", protect, getAllCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;