const express = require("express");
const router = express.Router();
const protect = require("../controllers/protect");
const { upload } = require("../utils/cloudinary");
const { updateStore, getAllStore, handleImageUpload } = require("../controllers/store");

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.put("/update/:id", protect, updateStore);
router.get("/get", protect, getAllStore);

module.exports = router;