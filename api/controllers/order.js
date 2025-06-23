// const path = require("path");
// const fs = require("fs");
// const responsePath = path.join(__dirname, "../logs/order-response.json");
const Order = require("../models/Order");
const Product = require("../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      products,
      tags,
      promoCode,
      shipmentDetails,
      pricing,
      paymentMethod,
      shipperCity,
      status,
    } = req.body;

    // const store = await Store.findOne({ user: req.user._id });
    // if (!store) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Store not found for this user.",
    //   });
    // }

    const totalOrders = await Order.countDocuments();
    const customOrderName = `#${1001 + totalOrders}`;
    // const { email, name, phone, city } = shipmentDetails;
    // let customer;
    // customer = await Customer.findOne({
    //   user: req.user._id,
    //   customerName: name,
    //   phone,
    // });
    // let isNewCustomer = false;
    // if (customer) {
    //   customer.totalOrders += 1;
    //   customer.totalSpent += pricing.totalPrice;
    //   customer.city = city;
    // } else {
    //   const sameCityCustomer = await Customer.findOne({
    //     user: req.user._id,
    //     city,
    //   });
    //   if (sameCityCustomer) {
    //     customer = new Customer({
    //       customerName: name,
    //       phone,
    //       city,
    //       totalOrders: 1,
    //       totalSpent: pricing.totalPrice,
    //     });
    //   } else {
    //     customer = new Customer({
    //       user: req.user._id,
    //       customerName: name,
    //       phone,
    //       city,
    //       totalOrders: 1,
    //       totalSpent: pricing.totalPrice,
    //     });
    //     isNewCustomer = true;
    //   }
    // }
    // await customer.save();
    const newOrder = new Order({
      // user: req.user._id,
      // store: store._id,
      name: customOrderName,
      products,
      tags,
      promoCode,
      paymentMethod,
      shipperCity,
      shipmentDetails,
      pricing,
      // customer: customer._id,
      status,
    });
    await newOrder.save();
    // store.totalOrders = (store.totalOrders || 0) + 1;
    // if (isNewCustomer) {
    //   store.totalCustomers = (store.totalCustomers || 0) + 1;
    // }
    // await store.save();
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
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const getAllOrder = async (req, res) => {
  try {
    // const orders = await Orders.find({ user: req.user._id });
    const orders = await Order.find();
    if (!orders || orders.length === 0) {
      return res.status(200).json({
        orders: [],
        message: "No orders found",
      });
    }
    const allProductIds = orders?.flatMap((order) =>
      order?.products?.map((pd) => pd?.productId)
    );
    const uniqueProductIds = [...new Set(allProductIds)];
    const allProducts = await Product.find({ _id: { $in: uniqueProductIds } });
    const enrichedOrders = orders.map((order) => {
      const enrichedProductDetails = order?.products
        ?.map((pd) => {
          const productData = allProducts?.find((product) =>
            product._id.equals(pd.productId)
          );
          if (productData) {
            return {
              productData,
              quantity: pd.productQty,
            };
          }
          return null;
        })
        .filter(Boolean);
      return {
        ...order.toObject(),
        trackingId: order.trackingId || null,
        products: enrichedProductDetails,
      };
    });
    console.log("Enriched Orders:", enrichedOrders);
    return res.status(200).json({
      success: true,
      orders: enrichedOrders,
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

// Total Orders and Total Revenue (by product vendor)
const getOrderStatsByVendor = async (req, res) => {
  try {
    const result = await Orders.aggregate([
      { $unwind: "$lineItems" },
      {
        $group: {
          _id: "$lineItems.productVendor",
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $multiply: [
                { $toDouble: "$lineItems.productPrice" },
                "$lineItems.productQuantity",
              ],
            },
          },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Monthly Orders Summary (grouped by month)
const getMonthlyOrdersSummary = async (req, res) => {
  try {
    const result = await Orders.aggregate([
      {
        $addFields: {
          createdMonth: {
            $month: {
              $toDate: "$createdAt",
            },
          },
        },
      },
      {
        $group: {
          _id: "$createdMonth",
          totalOrders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Top Selling Products
const getTopSellingProducts = async (req, res) => {
  try {
    const result = await Orders.aggregate([
      { $unwind: "$lineItems" },
      {
        $group: {
          _id: "$lineItems.productTitle",
          totalSold: { $sum: "$lineItems.productQuantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Customer Order Count
const getCustomerOrderCounts = async (req, res) => {
  try {
    const result = await Orders.aggregate([
      {
        $group: {
          _id: "$customerEmail",
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { orderCount: -1 } },
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrder,
  getOrderStatsByVendor,
  getMonthlyOrdersSummary,
  getTopSellingProducts,
  getCustomerOrderCounts,
};
