const express = require("express");
const { createCategory, getAllCategory, updateCategory, deleteCategory } = require("../controllers/category");
const router = express.Router();

router.post("/create", createCategory);
router.get("/get", getAllCategory);
router.put("/update/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;