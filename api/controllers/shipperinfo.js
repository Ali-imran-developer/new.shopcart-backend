const ShipperInfo = require("../models/Shipperinfo");

const createShipperInfo = async (req, res) => {
  try {
    const {
      locationName,
      city,
      storeName,
      phoneNumber,
      address,
      returnAddress,
    } = req.body;
    const newShipperInfo = new ShipperInfo({
      user: req.user._id,
      locationName,
      city,
      storeName,
      phoneNumber,
      address,
      returnAddress,
    });
    await newShipperInfo.save();
    res.status(201).json({
      success: true,
      message: "ShipperInfo created successfully!",
      shipperinfo: newShipperInfo,
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

const getShipperInfo = async (req, res) => {
  try {
    const shipperInfo = await ShipperInfo.find({ user: req.user._id });
    // const shipperInfo = await ShipperInfo.find();
    if (!shipperInfo || shipperInfo.length === 0) {
      return res.status(200).json({
        shipper: [],
        message: "No shipperInfo found!",
      });
    }
    return res.status(200).json({
      success: true,
      shipper: shipperInfo,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateShipperInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      locationName,
      city,
      storeName,
      phoneNumber,
      address,
      returnAddress,
    } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid Shipper ID",
      });
    }
    const findShipper = await ShipperInfo.findById(id);
    if (!findShipper) {
      return res.status(404).json({
        success: false,
        message: "Shipper not found",
      });
    }
    // if (!findShipper.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    if (locationName !== undefined) findShipper.locationName = locationName;
    if (city !== undefined) findShipper.city = city;
    if (storeName !== undefined) findShipper.storeName = storeName;
    if (phoneNumber !== undefined) findShipper.phoneNumber = phoneNumber;
    if (address !== undefined) findShipper.address = address;
    if (returnAddress !== undefined) findShipper.returnAddress = returnAddress;
    await findShipper.save();
    res.status(200).json({
      success: true,
      message: "Shipper updated successfully",
      shipper: findShipper,
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
        message: "Invalid ID format",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteShipperInfo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid shipper ID",
      });
    }
    const shipperInfo = await ShipperInfo.findByIdAndDelete(id);
    if (!shipperInfo) {
      return res.status(404).json({
        success: false,
        message: "Shipper not found",
      });
    }
    // if (!shipperInfo.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    return res.status(200).json({
      success: true,
      message: "Shipper deleted successfully",
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
        message: "Invalid Shipper ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createShipperInfo,
  getShipperInfo,
  updateShipperInfo,
  deleteShipperInfo,
};
