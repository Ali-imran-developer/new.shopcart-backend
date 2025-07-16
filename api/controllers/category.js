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
    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const totalCategories = await Category.countDocuments({ user: userId });
    const categories = await Category.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return res.status(200).json({ page, limit, categories, success: true, totalCategories });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicCatrgory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;
    const filter = { user: { $exists: null } };
    const totalCategories = await Category.countDocuments(filter);
    const categories = await Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    return res.status(200).json({ page, limit, categories, success: true, totalCategories });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
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
    console.log(err);
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
  getPublicCatrgory,
};
