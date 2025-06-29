require("dotenv").config();
const Stripe = require("stripe");
const Transactions = require("../models/Transactions");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const paymentIntent = async (req, res) => {
  try {
    const { amount, currency = "usd", metadata = {} } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
    });
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server error",
    });
  }
};

const webhookCreate = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  console.log(sig);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log(error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
  console.log(event.type);
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      const transactionData = {
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        email: paymentIntent.metadata?.email || "",
        orderId: paymentIntent.metadata?.orderId || "",
        customer: {
          id: paymentIntent.customer || null,
          name: paymentIntent.shipping?.name || null,
          email: paymentIntent.metadata?.email || null,
        },
        paymentMethod: {
          type: paymentIntent.payment_method_types?.[0] || null,
          // brand: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.brand || null,
          // last4: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.last4 || null,
          // exp_month: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.exp_month || null,
          // exp_year: paymentIntent.charges?.data?.[0]?.payment_method_details?.card?.exp_year || null,
        },
      };
      const exists = await Transactions.findOne({ paymentIntentId: paymentIntent?.id });
      if (!exists) {
        await Transactions.create(transactionData);
        console.log("Transaction saved:", paymentIntent.id);
      }
      break;
    case "payment_intent.payment_failed":
      console.log("Payment failed:", event.data.object.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  res.sendStatus(200);
};

module.exports = { paymentIntent, webhookCreate };