const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(409).json({
        success: false,
        message: "User Already exists!",
      });
    }
    const checkUserName = await User.findOne({ userName });
    if (checkUserName) {
      return res.status(409).json({
        success: false,
        message: "Username already taken!",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });
    await newUser.save();
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log(token);
    res.status(200).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        userName: newUser.userName,
        email: newUser.email,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.status(404).json({
        success: false,
        message: "User doesn't exists! Please register first",
      });
    if (checkUser.authProvider === "google") {
      return res.status(400).json({
        success: false,
        message: "You signed up with Google. Please login using 'Continue with Google'.",
      });
    }
    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }
    const token = jwt.sign(
      {
        userId: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        userName: checkUser.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        _id: checkUser._id,
        email: checkUser.email || "",
        userName: checkUser.userName || "",
        role: checkUser.role || "",
        name: checkUser.name || "",
        address: checkUser.address || "",
        image: checkUser.image || "",
        phoneNumber: checkUser.phoneNumber || "",
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, email, image, name, phoneNumber } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          address: address || "",
          email: email || "",
          image: image || "",
          name: name || "",
          phoneNumber: phoneNumber || "",
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    user.resetCode = resetToken;
    user.resetCodeExpiry = expiry;
    await user.save();
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const resetLink = `https://shopcart-frontend-six.vercel.app/reset-password/${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset Code",
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`,
    });
    res.json({ message: "Reset code sent to email" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password required" });
    }
    const user = await User.findOne({
      resetCode: token,
      resetCodeExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "Cannot use same password!" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();
    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  updateUser,
  forgetPassword,
  resetPassword,
};
