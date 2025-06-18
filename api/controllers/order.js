const Orders = require("../models/Order");

// Create Order (Webhook handler)
const createOrder = async (req, res) => {
  try {
    const order = req.body;
    const parsed = {
      orderId: order?.name,
      orderShopifyId: order?.id,
      createdAt: order?.created_at,
      contactEmail: order?.contact_email,
      email: order?.email,
      phone: order?.phone,
      financialStatus: order?.financial_status,
      fulfillmentStatus: order?.fulfillment_status,
      note: order?.note,
      tags: order?.tags,
      customerId: order?.customer?.id,
      customerEmail: order?.customer?.email,
      customerPhone: order?.customer?.phone,
      customerCreatedAt: order?.customer?.created_at,
      addressId: order?.customer?.default_address?.id,
      addressCustomerId: order?.customer?.default_address?.customer_id,
      customerCompany: order?.customer?.default_address?.company,
      customerName: order?.customer?.default_address?.name,
      customerAddress1: order?.customer?.default_address?.address1,
      customerAddress2: order?.customer?.default_address?.address2,
      customerCity: order?.customer?.default_address?.city,
      customerZip: order?.customer?.default_address?.zip,
      customerCountry: order?.customer?.default_address?.country,
      countryName: order?.customer?.default_address?.country_name,
      addressPhone: order?.customer?.default_address?.phone,
      isDefaultAddress: order?.customer?.default_address?.default,
      lineItems: order?.line_items?.map((item) => ({
        itemId: item?.id,
        productName: item?.name,
        productTitle: item?.title,
        productPrice: item?.price,
        productQuantity: item?.quantity,
        productSKU: item?.sku,
        variantId: item?.variant_id,
        variantTitle: item?.variant_title,
        productVendor: item?.vendor,
        grams: item?.grams,
      })),
    };
    const saved = await Orders.create(parsed);
    return res.status(201).json({
      success: true,
      message: "Order received successfully!",
      data: saved,
    });
  } catch (error) {
    res.status(500).json({ error: "Server Error", details: error?.message });
  }
};

// Get All Orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Orders.find({});
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).send("Server Error.");
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
                "$lineItems.productQuantity"
              ]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } }
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
              $toDate: "$createdAt"
            }
          }
        }
      },
      {
        $group: {
          _id: "$createdMonth",
          totalOrders: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
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
          totalSold: { $sum: "$lineItems.productQuantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
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
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { orderCount: -1 } }
    ]);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


module.exports = {
  createOrder,
  getAllOrders,
  getOrderStatsByVendor,
  getMonthlyOrdersSummary,
  getTopSellingProducts,
  getCustomerOrderCounts,
};
