const Courier = require("../models/Courier");
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

const createCourier = async (req, res) => {
  try {
    const { name, logo, isDefault } = req.body;
    if (!name || !logo) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }
    const newCourier = new Courier({
    //   user: req.user._id,
      name,
      isDefault,
      logo,
    });
    await newCourier.save();
    res.status(201).json({
      success: true,
      message: "Courier created successfully!",
      courier: newCourier,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllCourier = async (req, res) => {
  try {
    const fetchCourier = await Courier.find();
    if (!fetchCourier || fetchCourier.length === 0) {
      return res.status(200).json({
        courier: [],
        message: "No courier found",
      });
    }
    return res.status(200).json({
      success: true,
      courier: fetchCourier,
    });
  } catch (error) {
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

const updateCourier = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, isDefault } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid courier id",
      });
    }
    const findCourier = await Courier.findById(id);
    if (!findCourier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }
    if (name !== undefined) findCourier.name = name;
    if (logo !== undefined) findCourier.logo = logo;
    await findCourier.save();
    res.status(200).json({
      success: true,
      message: "Courier updated successfully",
      courier: findCourier,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid courier ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteCourier = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid courier id!",
      });
    }
    const courier = await Courier.findByIdAndDelete(id);
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: "courier not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "courier deleted successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid courier ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  handleImageUpload,
  createCourier,
  getAllCourier,
  updateCourier,
  deleteCourier,
};
