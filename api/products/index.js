const express = require("express");
const { handleImageUpload, createProduct, getAllProducts, getShopifyProducts, updateProduct, deleteProduct } = require("../controllers/product");
const { upload } = require("../utils/cloudinary");
const router = express.Router();
const protect = require("../controllers/protect");

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/create", protect, createProduct);
router.get("/get", protect, getAllProducts);
router.get("/shopify-products", getShopifyProducts);
router.put("/update/:id", updateProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;