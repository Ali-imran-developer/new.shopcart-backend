const Resale = require("../models/Resale");
const Product = require("../models/Product");
const Order = require("../models/Order");

const createResaleProduct = async (req, res) => {
  try {
    const { productId, resale } = req.body;
    const userId = req?.user?._id;
    const existing = await Resale.findOne({ product: productId, user: userId });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Product already listed" });
    }
    const newResale = await Resale.create({
      user: userId,
      product: productId,
      resale,
    });
    return res.status(201).json({ success: true, data: newResale });
  } catch (error) {
    console.error("Create Resale Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getAllResaleProducts = async (req, res) => {
  try {
    const resales = await Resale.find().populate("product").populate("user", "name");
    res.status(200).json({ success: true, data: resales });
  } catch (error) {
    console.error("Get All Resales Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getUserResaleProducts = async (req, res) => {
  try {
    const { isListed } = req.query;
    const userId = req?.user?._id;
    if (isListed === "true") {
      const listed = await Resale.find({ user: userId }).populate({
        path: "product",
        populate: {
          path: "store",
          model: "Store",
        },
      });
      return res.status(200).json({ success: true, data: listed });
    } else if (isListed === "false") {
      const allUserProducts = await Product.find({ user: userId }).populate(
        "store"
      );
      const listedProductIds = await Resale.find({ user: userId }).distinct(
        "product"
      );
      const listedIds = listedProductIds.map((id) => id.toString());
      const unlistedProducts = allUserProducts.filter(
        (product) => !listedIds.includes(product._id.toString())
      );
      console.log("unlistedProducts", unlistedProducts);
      return res.status(200).json({ success: true, data: unlistedProducts });
    }
    return res.status(400).json({
      success: false,
      message: "isListed param required (true/false)",
    });
  } catch (error) {
    console.error("Get User Resale Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getResaleOrders = async (req, res) => {
  const { status, page, limit, payment } = req.query;
  const parsedPage = parseInt(page) || 1;
  const parsedLimit = parseInt(limit) || 10;

  const query = { user: req.user._id };
  if (status) query.status = status;
  if (payment === "pending") {
    query.paymentMethod = "cod";
  } else if (payment === "paid") {
    query.paymentMethod = { $ne: "cod" };
  }

  try {
    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit).sort({ createdAt: -1 });
    if (!orders || orders.length === 0) {
      return res.status(200).json({
        orders: [],
        totalOrders: 0,
        currentPage: parsedPage,
        totalPages: 0,
        message: "No orders found",
      });
    }

    const clientSecrets = orders.map((order) => order.clientSecret);
    const transactions = await Transaction.find({ paymentIntentId: { $in: clientSecrets }});
    const courierIds = orders?.map((order) => order.courierId).filter((id) => id);
    const shipperIds = orders?.map((order) => order.shipperId).filter((id) => id);
    const allCouriers = await Courier.find({ _id: { $in: courierIds } });
    const allShippers = await ShipperInfo.find({ _id: { $in: shipperIds } });

    const enrichedOrders = orders?.map((order) => {
      const isPaid = transactions?.some((tx) => tx?.paymentIntentId === order?.clientSecret);
      const courierData = allCouriers.find((c) => c?._id.equals(order?.courierId));
      const shipperData = allShippers.find((s) => s?._id.equals(order?.shipperId));
      return {
        ...order.toObject(),
        courier: courierData || null,
        shipper: shipperData || null,
        shipmentType: order.shipmentType || null,
        trackingId: order.trackingId || null,
        payment: isPaid ? "paid" : "pending",
      };
    });
    const responsePayload = {
      success: true,
      orders: enrichedOrders,
      totalOrders,
      currentPage: parsedPage,
      totalPages: Math.ceil(totalOrders / parsedLimit),
    };
    console.log("enrichedOrders", enrichedOrders);
    return res.status(200).json({ ...responsePayload, message: "Fetched from DB" });
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

module.exports = {
  createResaleProduct,
  getAllResaleProducts,
  getUserResaleProducts,
};
