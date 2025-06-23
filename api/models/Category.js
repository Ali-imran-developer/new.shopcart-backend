const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
  name: { type: String, trim: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
});

const CategorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, trim: true },
    subCategory: [SubCategorySchema],
    description: { type: String, trim: true },
    status: { type: String, trim: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;