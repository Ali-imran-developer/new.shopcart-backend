const express = require("express");
const Orders = require("../models/Order");
const router = express.Router();

// POST /orders/create — Shopify webhook
router.post("/create", async (req, res) => {
  try {
    const body = req.body;
    const order = await body;
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
});

// GET /orders/getting
router.get("/getting", async (req, res) => {
  try {
    const orders = await Orders.find({});
    return res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).send("Server Error.");
  }
});

module.exports = router;