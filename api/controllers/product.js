const Product = require("../models/Product");
const Store = require("../models/Store");
const axios = require("axios");
const { ImageUploadUtil } = require("../utils/cloudinary");

const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await ImageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      subCategory,
      stock,
      available,
    } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the required fields",
      });
    }
    let store = await Store.findOne({ user: req.user._id });
    // let store = await Store.findOne();
    if (!store) {
      store = new Store({
        user: req.user._id,
        storeName: "Store Owner",
        storeDomain: `${Math.random().toString()}/Owner`,
        totalProducts: 1,
        totalOrders: 0,
        totalCustomers: 0,
      });
      await store.save();
    } else {
      store.totalProducts += 1;
      await store.save();
    }
    const newProduct = new Product({
      user: req.user._id,
      store: store._id,
      name,
      description,
      price,
      image,
      category,
      subCategory,
      stock,
      available,
    });
    await newProduct.save();
    console.log(newProduct);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
    });
  } catch (error) {
    console.log(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const fetchProducts = await Product.find({ user: req.user._id });
    // const fetchProducts = await Product.find();
    if (!fetchProducts || fetchProducts.length === 0) {
      return res.status(200).json({
        products: [],
        message: "No products found",
      });
    }
    return res.status(200).json({
      success: true,
      count: fetchProducts.length,
      products: fetchProducts,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }
    if (error.name === "MongoNetworkError") {
      return res.status(503).json({
        success: false,
        message: "Database connection error. Please try again later.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      image,
      category,
      subCategory,
      stock,
      available,
    } = req.body;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // if (!findProduct.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields (name, price, stock)",
      });
    }
    if (typeof price !== "number" || typeof stock !== "number") {
      return res.status(400).json({
        success: false,
        message: "Price and Stock must be numbers",
      });
    }
    if (name !== undefined) findProduct.name = name;
    if (description !== undefined) findProduct.description = description;
    if (price !== undefined) findProduct.price = price;
    if (image !== undefined) findProduct.image = image;
    if (category !== undefined) findProduct.category = category;
    if (subCategory !== undefined) findProduct.subCategory = subCategory;
    if (stock !== undefined) findProduct.stock = stock;
    if (available !== undefined) findProduct.available = available;
    await findProduct.save();
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: findProduct,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product with this name already exists",
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    // if (!product.user.equals(req.user._id)) {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }
    const store = await Store.findById(product.store);
    if (store) {
      store.totalProducts = Math.max(store.totalProducts - 1, 0);
      await store.save();
    }
    await product.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getShopifyProducts = async (req, res) => {
  try{
    const domain = "dev-shopilam.myshopify.com";
    const accessToken = "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";
    const response = await axios.get(`https://${domain}/admin/api/2024-04/products.json`, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
    });
    console.log(response?.data?.products);
    return res.status(200).json({
      response
    });
  }catch(error){
    console.log(error);
  }
};

module.exports = {
  handleImageUpload,
  createProduct,
  getShopifyProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
