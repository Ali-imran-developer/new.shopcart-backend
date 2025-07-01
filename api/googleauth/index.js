const express = require("express");
const passport = require("passport");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => { const { token } = req.user;
    res.redirect(`https://learning-express-three.vercel.app/oauth-success?token=${token}`);
  }
);
router.post("/google/token-login", async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        userName: payload.name,
        image: payload.picture,
        authProvider: "google",
      });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        userName: user.userName,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.json({ token, user });
  } catch (error) {
    console.error("Google token login error:", error);
    return res.status(401).json({ message: "Invalid Google Token" });
  }
});

module.exports = router;