const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch){
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    };
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

module.exports = { registerUser, loginUser, updateUser };