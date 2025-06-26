const Courier = require("../models/Courier");
const CourierCreds = require("../models/Courier-creds");
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

const courierCreds = async (req, res) => {
  try {
    const { courierId, courierName, apiKey, apiPassword, isDefault } = req.body;
    if (!courierId || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "Please provide courierId, apiKey, and apiPassword",
      });
    }
    const courierExists = await Courier.findById(courierId);
    if (!courierExists) {
      return res
        .status(404)
        .json({ success: false, message: "Courier not found" });
    }
    const existingCreds = await CourierCreds.findOne({
      user: req.user._id,
      courier: courierId,
    });
    let savedCreds;
    if (existingCreds) {
      existingCreds.apiKey = apiKey;
      existingCreds.apiPassword = apiPassword;
      savedCreds = await existingCreds.save();
    } else {
      savedCreds = await CourierCreds.create({
        user: req.user._id,
        courier: courierId,
        couriersname: courierName,
        apiKey,
        apiPassword,
        isDefault,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Courier credentials saved successfully",
      creds: savedCreds,
    });
  } catch (error) {
    console.error("Error saving courier creds:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getCourierCreds = async (req, res) => {
  try {
    const fetchCourierCreds = await CourierCreds.find({ user: req.user._id });
    if (!fetchCourierCreds) {
      return res.status(200).json({
        creds: [],
        message: "No courierCreds found",
      });
    }
    return res.status(200).json({
      success: true,
      creds: fetchCourierCreds,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteCourierCreds = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid courier credential ID!",
      });
    }
    const creds = await CourierCreds.findOne({ _id: id, user: req.user._id });
    if (!creds) {
      return res.status(404).json({
        success: false,
        message: "Courier credentials not found for this user.",
      });
    }
    await CourierCreds.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Courier credentials deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting courier creds:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

const defaultCourier = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDefault } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid courier credential ID!",
      });
    }
    const creds = await CourierCreds.findOne({ _id: id, user: req.user._id });
    if (!creds) {
      return res.status(404).json({
        success: false,
        message: "Courier credential not found for this user.",
      });
    }
    if (isDefault === true) {
      await CourierCreds.updateMany(
        { user: req.user._id, _id: { $ne: id } },
        { $set: { isDefault: false } }
      );
    }
    creds.isDefault = isDefault;
    await creds.save();
    return res.status(200).json({
      success: true,
      message: isDefault
        ? "Courier credential set as default."
        : "Courier credential unset as default.",
      data: creds,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server error",
    });
  }
};

module.exports = {
  handleImageUpload,
  createCourier,
  getAllCourier,
  updateCourier,
  deleteCourier,
  courierCreds,
  getCourierCreds,
  deleteCourierCreds,
  defaultCourier,
};
