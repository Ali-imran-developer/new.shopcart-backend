const Profile = require("../models/Profile");
const { ImageUploadUtil } = require("../utils/cloudinary");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await ImageUploadUtil(url);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

const createProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, address, image } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }
    const profile = new Profile({
      user: req.user._id,
      name,
      email,
      phoneNumber,
      address,
      image,
    });
    await profile.save();
    res.status(201).json({
      success: true,
      message: "Profile created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const fetchProfile = await Profile.findOne({ user: req?.user?._id });
    console.log(fetchProfile);
    if (!fetchProfile || fetchProfile?.length === 0) {
      return res.status(200).json({
        profile: {},
        message: "Please create the Profile first!",
      });
    }
    return res.status(200).json({
      success: true,
      profile: fetchProfile,
    });
  } catch (error) {
    console.log(error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID format",
      });
    }
    if (error.name === "MongoNetworkError") {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, address, image } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID",
      });
    }
    const findProfile = await Profile.findById(id);
    console.log(findProfile);
    if (!findProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    // if (!findProfile.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    if (name !== undefined) findProfile.name = name;
    if (image !== undefined) findProfile.image = image;
    if (email !== undefined) findProfile.email = email;
    if (phoneNumber !== undefined) findProfile.phoneNumber = phoneNumber;
    if (address !== undefined) findProfile.address = address;
    await findProfile.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: findProfile,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Profile with this name already exists",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid profile ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  handleImageUpload,
  createProfile,
  getProfile,
  updateProfile,
};
