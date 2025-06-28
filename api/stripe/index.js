const express = require("express");
const { paymentIntent, webhookCreate } = require("../controllers/stripewebhook");
const router = express.Router();

router.post("/create-payment-intent", paymentIntent);
router.post("/webhook", webhookCreate);

module.exports = router;