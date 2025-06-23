const express = require("express");
const { deleteSubCategory } = require("../controllers/subcategory");
const router = express.Router();
// const protect = require("../controllers/protect");

router.delete("/delete/:categoryId/:subCategoryId", deleteSubCategory);
module.exports = router;