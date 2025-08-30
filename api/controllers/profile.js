const Profile = require("../models/Profile");
const { ImageUploadUtil } = require("../utils/cloudinary");

const getProfile = async (req, res) => {
  try {
    const fetchProfile = await Profile.findOne({ user: req?.user?._id });
    // const fetchProfile = await Profile.findOne();
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
    // const { id } = req.params;
    const { name, email, phoneNumber, address, image } = req.body;
    // if (!id || id.length !== 24) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid profile ID",
    //   });
    // }
    const findProfile = await Profile.findById({ user: req.user._id });
    if (!findProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }
    if (!findProfile.user.equals(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (image !== undefined) {
      const uploadResult = await ImageUploadUtil(image);
      findProfile.image = uploadResult?.secure_url;
      console.log("Uploaded image URL:", uploadResult?.secure_url);
      console.log("image upload:", findProfile.image);
    }
    if (name !== undefined) findProfile.name = name;
    if (email !== undefined) findProfile.email = email;
    if (phoneNumber !== undefined) findProfile.phoneNumber = phoneNumber;
    if (address !== undefined) findProfile.address = address;
    await findProfile.save();
    console.log("findProfile", findProfile);
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profile: findProfile,
    });
    console.log("findProfile", findProfile);
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
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
  // createProfile,
  getProfile,
  updateProfile,
};
