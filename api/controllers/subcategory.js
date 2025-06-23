const Category = require("../models/Category");

const deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // if (!category.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    const subExists = category.subCategory.some(
      (sub) => sub._id.toString() === subCategoryId
    );
    if (!subExists) {
      return res.status(403).json({ message: "Subcategory not found" });
    }
    category.subCategory = category.subCategory.filter(
      (sub) => sub._id.toString() !== subCategoryId
    );
    await category.save();
    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  deleteSubCategory,
};
