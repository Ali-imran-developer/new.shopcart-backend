const express = require("express");
const router = express.Router();
const protect = require("../controllers/protect");
const { upload } = require("../utils/cloudinary");
const { createCourier, getAllCourier, updateCourier, deleteCourier, defaultCourier, courierCreds, handleImageUpload, deleteCourierCreds, getCourierCreds } = require("../controllers/courier");

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/create", createCourier);
router.post("/creds", protect, courierCreds);
router.get("/get-creds", protect, getCourierCreds);
router.delete("/creds/:id", protect, deleteCourierCreds);
router.put("/creds/default/:id", protect, defaultCourier);
router.get("/get", getAllCourier);
router.put("/update/:id", updateCourier);
router.delete("/delete/:id", deleteCourier);

module.exports = router;