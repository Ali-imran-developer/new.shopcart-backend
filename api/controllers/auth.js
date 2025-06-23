const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  try {
    const checkUser = await User.findOne({ email });
    if (checkUser){
      return res.status(409).json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });
    };
    const checkUserName = await User.findOne({ userName });
    if (checkUserName) {
      return res.status(409).json({
        success: false,
        message: "Username is already taken. Please choose another one.",
      });
    };
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
        id: checkUser._id,
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
        id: checkUser._id,
        email: checkUser.email,
        userName: checkUser.userName,
        role: checkUser.role,
      },
    });
    // res.cookie("token", token, { httpOnly: true, secure: false }).json({
    //   success: true,
    //   message: "Logged in successfully",
    //   user: {
    //     email: checkUser.email,
    //     role: checkUser.role,
    //     id: checkUser._id,
    //     userName: checkUser.userName,
    //   },
    // });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

// const logoutUser = (req, res) => {
//   res.clearCookie("token").json({
//     success: true,
//     message: "Logged out successfully!",
//   });
// };

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  try {
    const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ isLoggedIn: false });
    }
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    return res.status(200).json({
      isLoggedIn: true,
      user: {
        email: decoded.email,
        id: decoded.id,
        userName: decoded.userName,
        role: decoded.role,
      },
    });
  } catch (error) {
    return res.status(401).json({ isLoggedIn: false });
  }
};

module.exports = { checkAuth, registerUser, loginUser, authMiddleware };