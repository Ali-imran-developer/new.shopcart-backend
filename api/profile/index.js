const express = require("express");
const { handleImageUpload, createProfile, getProfile, updateProfile } = require("../controllers/profile");
const { upload } = require("../utils/cloudinary");
const router = express.Router();
// const protect = require("../controllers/protect");

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/create", createProfile);
router.get("/get", getProfile);
router.put("/update/:id", updateProfile);

module.exports = router;