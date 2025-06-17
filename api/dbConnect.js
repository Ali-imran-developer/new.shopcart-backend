const mongoose = require("mongoose");

const dbConnect = () => {
  mongoose.connect(process.env.DB)
    .then(() => {
      console.log("Connected to database successfully!");
    })
    .catch((error) => {
      console.log("Failed to connect with database:" + error);
    });
};

module.exports = dbConnect;