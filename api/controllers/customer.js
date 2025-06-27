const Customer = require("../models/Customer");
const Store = require("../models/Store");

const createCustomer = async (req, res) => {
  try {
    const { customerName, phone, city, totalOrders, totalSpent } = req.body;
    const store = await Store.findOne({ user: req.user._id });
    // const store = await Store.findOne();
    if (!store) {
      return res.status(404).json({ success: false, message: "Store not found" });
    }
    const existingCustomer = await Customer.findOne({
      customerName,
      city,
      user: req.user._id,
    });
    if (existingCustomer) {
      return res.status(200).json({
        success: false,
        message: "Customer already exists with the same name and city",
      });
    }
    const newCustomer = new Customer({
      user: req.user._id,
      store: store._id,
      customerName,
      phone,
      city,
      totalOrders,
      totalSpent,
    });
    await newCustomer.save();
    store.totalCustomers = (store.totalCustomers || 0) + 1;
    await store.save();
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Customer already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllCustomer = async (req, res) => {
  try {
    const fetchCustomer = await Customer.find({ user: req.user._id });
    if (!fetchCustomer || fetchCustomer?.length === 0) {
      return res.status(200).json({
        customer: [],
        message: "No customer found",
      });
    }
    return res.status(200).json({
      success: true,
      customer: fetchCustomer,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
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

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerName, phone, city, totalOrders, totalSpent } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }
    const findCustomer = await Customer.findById(id);
    if (!findCustomer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    // if (!findCustomer.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    if (customerName !== undefined) findCustomer.customerName = customerName;
    if (phone !== undefined) findCustomer.phone = phone;
    if (city !== undefined) findCustomer.city = city;
    if (totalOrders !== undefined) findCustomer.totalOrders = totalOrders;
    if (totalSpent !== undefined) findCustomer.totalSpent = totalSpent;
    await findCustomer.save();
    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer: findCustomer,
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
        message: "Customer with this name already exists",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Customer ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid Customer ID",
      });
    }
    const customer = await Customer.findById(id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }
    // if (!customer.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    const store = await Store.findById(customer.store);
    await customer.deleteOne();
    if (store && store.totalCustomers > 0) {
      store.totalCustomers -= 1;
      await store.save();
    }
    return res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
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
        message: "Invalid Customer ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createCustomer,
  getAllCustomer,
  updateCustomer,
  deleteCustomer,
};
