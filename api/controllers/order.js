const Order = require("../models/Order");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Store = require("../models/Store");
const ShipperInfo = require("../models/Shipperinfo");
const Courier = require("../models/Courier");
const Transaction = require("../models/Transactions");
const axios = require("axios");
const mongoose = require("mongoose");

const createOrder = async (req, res) => {
  try {
    const { products, tags, promoCode, shipmentDetails, pricing, paymentMethod, shipperCity, status, clientSecret } = req.body;
    const store = await Store.findOne({ user: req?.user?._id });
    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }
    const totalOrders = await Order.countDocuments();
    const customOrderName = `#${1001 + totalOrders}`;
    const { email, name, phone, city } = shipmentDetails;
    let customer;
    customer = await Customer.findOne({
      user: req.user._id,
      customerName: name,
      phone,
    });
    let isNewCustomer = false;
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += pricing.totalPrice;
      customer.city = city;
    } else {
      const sameCityCustomer = await Customer.findOne({
        user: req.user._id,
        city,
      });
      if (sameCityCustomer) {
        customer = new Customer({
          customerName: name,
          phone,
          city,
          totalOrders: 1,
          totalSpent: pricing?.totalPrice,
        });
      } else {
        customer = new Customer({
          user: req?.user?._id,
          customerName: name,
          phone,
          city,
          totalOrders: 1,
          totalSpent: pricing.totalPrice,
        });
        isNewCustomer = true;
      }
    }
    await customer.save();
    const productIds = products?.map((p) => p?.productId);
    const fullProducts = await Product?.find({ _id: { $in: productIds } });
    const enrichedProducts = products?.map((p) => {
      const productData = fullProducts?.find((fp) => fp?._id?.equals(p?.productId));
      if (!productData) return null;
      const flattened = {
        ...productData.toObject(),
        productId: p?.productId,
        productQty: p?.productQty,
      };
      return flattened;
    }).filter(Boolean);
    const newOrder = new Order({
      user: req?.user?._id,
      store: store?._id,
      name: customOrderName,
      products: enrichedProducts,
      tags,
      promoCode,
      paymentMethod,
      shipperCity,
      shipmentDetails,
      pricing,
      customer: customer?._id,
      status,
      clientSecret,
    });
    await newOrder.save();
    store.totalOrders = (store?.totalOrders || 0) + 1;
    if (isNewCustomer) {
      store.totalCustomers = (store?.totalCustomers || 0) + 1;
    }
    await store.save();
    // const cacheKey = `orders:${req.user._id.toString()}`;
    // const cached = await getCache(cacheKey);
    // const newOrderData = {
    //   ...newOrder?.toObject(),
    //   trackingId: newOrder?.trackingId || null,
    //   products: newOrder?.products?.map((p) => ({
    //     productData: p?.productData,
    //     quantity: p?.productQty,
    //   })),
    //   payment: paymentMethod === "paid" ? "paid" : "pending",
    // };
    // let updatedOrders = [];
    // if (Array.isArray(cached)) {
    //   const exists = cached.some((o) => o._id === newOrderData._id.toString());
    //   updatedOrders = exists ? cached : [newOrderData, ...cached];
    // } else {
    //   updatedOrders = [newOrderData];
    // }
    // await setCache(cacheKey, updatedOrders);
    res.status(201).json({
      success: true,
      message: "Order created successfully!",
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllOrder = async (req, res) => {
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

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipmentDetails } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
      });
    }
    if (!shipmentDetails) {
      return res.status(404).json({
        success: false,
        message: "ShipmentDetails is required!",
      });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // if (!order.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    order.shipmentDetails = {
      ...order.shipmentDetails.toObject(),
      ...shipmentDetails,
    };
    await order.save();
    return res.status(200).json({
      success: true,
      message: "Shipment details updated successfully",
      order,
    });
  } catch (error) {
    console.log(error);
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

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
      });
    }
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // if (!order.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    const storeId = order.store;
    await Order.findByIdAndDelete(id);
    if (storeId) {
      const store = await Store.findById(storeId);
      if (store && store.totalOrders > 0) {
        store.totalOrders -= 1;
        await store.save();
      }
    }
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
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
        message: "Invalid Order ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid Order ID",
      });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({
        success: false,
        message: "Valid status must be provided",
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // if (!order.user.equals(req.user._id)) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Not authorized to update this order",
    //   });
    // }

    if (order.status === status) {
      return res.status(200).json({
        success: true,
        message: "Order status is already up to date",
        order,
      });
    }

    order.status = status;
    await order.save();
    // const cacheKey = `orders:${order.user.toString()}`;
    // const cached = await getCache(cacheKey);
    // if (cached && Array.isArray(cached)) {
    //   const updatedCache = cached.map((cachedOrder) => {
    //     if (cachedOrder._id === id) {
    //       return {
    //         ...cachedOrder,
    //         status,
    //       };
    //     }
    //     return cachedOrder;
    //   });
    //   await setCache(cacheKey, updatedCache);
    // }

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      updatedOrder: order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const bookingOrder = async (req, res) => {
  const { orderId, userId, courierId, shipmentType, shipperId } = req.body;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (!order.user.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to book this order",
      });
    }
    const courierPayload = {
      payment_method: order.paymentMethod?.toUpperCase() || "COD",
      total: order.pricing?.totalPrice || 0,
      name: order._id ? `#${order._id}` : "",
      subtotal: order.pricing?.subTotal || 0,
      shipping_name: order.shipmentDetails?.name || "",
      email: order.shipmentDetails?.email || "",
      shipping_phone:
        `+92${order.shipmentDetails?.phone?.replace(/^0/, "")}` || "",
      shipping_street: order.shipmentDetails?.address || "",
      shipping_company: "shopCart",
      shipping_city: order.shipmentDetails?.city || "",
      line_items: order.products.map((item) => ({
        lineitem_price: item?.productData?.price || 0,
        lineitem_quantity: item?.quantity || 1,
        lineitem_name: item?.productData?.name || "",
        lineitem_sku: item?.productData?._id || "",
      })),
      shipping_address1: order.shipmentDetails?.address || "",
      created_at: new Date(order.createdAt).toISOString(),
      account_id: "q6398070",
    };

    const response = await axios.post(
      "http://honeybeecourier.com/api/v10/parcels/booking",
      courierPayload,
      {
        headers: {
          apiKey: "HBC_0xGhUiqkNtziEPaeUZnt6ghy",
          "Content-Type": "application/json",
        },
      }
    );

    const { message, tracking_id } = response?.data || {};
    const trackingId = tracking_id;
    if (message && trackingId) {
      order.trackingId = trackingId;
      order.status = "booked";
      order.courierId = courierId;
      order.shipperId = shipperId;
      order.shipmentType = shipmentType;
      await order.save();
      return res.status(200).json({
        success: true,
        message: `${message}`,
        trackingId,
        order,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Courier booking failed",
        courierResponse: response.data,
      });
    }
  } catch (error) {
    console.error(
      "Courier Booking Error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Failed to book order with courier",
      error: error.response?.data || error.message,
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const openOrders = await Order.find({ user: req.user._id });
    const totalSales = openOrders.reduce((sum, order) => {
      return sum + (order.pricing?.totalPrice || 0);
    }, 0);
    const totalRevenue = openOrders.reduce((sum, order) => {
      return (
        sum + ((order.pricing?.subTotal || 0) + (order.pricing?.orderTax || 0))
      );
    }, 0);
    const topProductStats = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user._id) } },
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.productQty" },
        },
      },
      { $match: { totalSold: { $gte: 5 } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);

    const topProductIds = topProductStats.map((item) => item._id);
    const allProducts = await Product.find({ _id: { $in: topProductIds } });
    const topProducts = topProductStats
      .map((stat) => {
        const productData = allProducts.find((p) => p._id.equals(stat._id));
        return productData
          ? { product: productData, totalSold: stat.totalSold }
          : null;
      })
      .filter(Boolean);
    res.json({
      newOrders: {
        todayOrders: openOrders.length,
        id: 1,
        totalPercentage: Number((Math.random() * 100).toFixed(2)),
      },
      totalSales: {
        totalSales: totalSales,
        id: 2,
        totalPercentage: Number((Math.random() * 100).toFixed(2)),
      },
      totalRevenue: {
        totalRevenue: totalRevenue,
        id: 3,
        totalPercentage: Number((Math.random() * 100).toFixed(2)),
      },
      topProducts,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const orders = await Order.find({ user: req.user._id });
    if (!orders.length) {
      return res.status(200).json({
        transactions: [],
        page,
        limit,
        totalPayments: 0,
        message: "No orders found",
      });
    }
    const clientSecrets = orders.map((order) => order.clientSecret);
    const transactions = await Transaction.find({
      paymentIntentId: { $in: clientSecrets },
    });
    const orderMap = new Map();
    orders.forEach((order) => {
      orderMap.set(order.clientSecret, order);
    });
    let runningTotal = 0;
    const allTransactionDetails = transactions
      .map((tx) => {
        const order = orderMap.get(tx.paymentIntentId);
        if (order) {
          runningTotal += tx.amount;
          return {
            totalReceived: runningTotal,
            ordersItems: order?.products?.length,
            orderName: order?.name,
            amount: tx.amount,
            transactionId: tx._id,
            date: tx.createdAt,
            customerName: order?.shipmentDetails?.name,
          };
        }
        return null;
      }).filter(Boolean);
    return res.status(200).json({
      transactions: allTransactionDetails,
      page,
      limit,
      totalPayments: allTransactionDetails.length,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPayments,
  createOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  updateStatus,
  bookingOrder,
  getDashboardStats,
};
