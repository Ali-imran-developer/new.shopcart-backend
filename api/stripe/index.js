const express = require("express");
const { paymentIntent, webhookCreate } = require("../controllers/stripewebhook");
const router = express.Router();
// const protect = require("../controllers/protect");

router.post("/create-payment-intent", paymentIntent);
router.post("/webhook", express.raw({ type: "application/json" }), webhookCreate);

module.exports = router;