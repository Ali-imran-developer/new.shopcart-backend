const cron = require("node-cron");
const axios = require("axios");
const Orders = require("../models/Order");
require("dotenv").config();

// cron.schedule("*/10 * * * * *", async () => {
//   try {
//     const response = await axios.get(`${process.env.production_server}/orders/getting`);
//     const orders = response?.data?.data;
//     if (orders && orders.length) {
//       orders.map(async (order) => {
//         await Orders.create(order);
//         console.log("Order added:", order.orderId);
//       });
//     }
//   } catch (error) {
//     console.error("Error in 10s cron:", error.message);
//   }
// });

// cron.schedule("0 * * * * *", async () => {
//   try {
//     await Orders.deleteMany({});
//     console.log("All orders deleted at", new Date().toLocaleTimeString());
//   } catch (error) {
//     console.error("Error in 1-minute cron:", error.message);
//   }
// });
