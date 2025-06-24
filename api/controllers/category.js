const Category = require("../models/Category");

const createCategory = async (req, res) => {
  try {
    const { name, subCategory, description, status } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }
    const category = new Category({
      user: req.user._id,
      name,
      description,
      status,
    });
    if (Array.isArray(subCategory)) {
      subCategory.forEach((sub) => {
        category.subCategory.push({
          name: sub.name,
          categoryId: category._id,
        });
      });
    }
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    console.log(categories);
    res.status(200).json(categories);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subCategory, subCategoryId, subCategoryName } = req.body;
    const category = await Category.findById(id);
    if (!category){
      return res.status(404).json({ message: "Category not found" });
    }
    // if (!category.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    if (name) category.name = name;
    if (subCategoryId && subCategoryName) {
      const sub = category.subCategory.id(subCategoryId);
      if (sub) {
        sub.name = subCategoryName;
      } else {
        return res.status(404).json({ message: "Subcategory not found" });
      }
    }

    if (Array.isArray(subCategory) && subCategory.length > 0) {
      subCategory.forEach((sub) => {
        const exists = category.subCategory.find((s) => s.name === sub.name);
        if (!exists) {
          category.subCategory.push({
            name: sub.name,
            categoryId: category._id,
          });
        }
      });
    }

    await category.save();
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    // if (!category.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
