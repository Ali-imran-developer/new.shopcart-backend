const express = require("express");
const router = express.Router();
// const protect = require("../controllers/protect");
const { upload } = require("../utils/cloudinary");
const { createCourier, getAllCourier, updateCourier, deleteCourier, handleImageUpload } = require("../controllers/courier");

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/create", createCourier);
router.get("/get", getAllCourier);
router.put("/update/:id", updateCourier);
router.delete("/delete/:id", deleteCourier);

module.exports = router;