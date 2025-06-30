const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => { const { token } = req.user;
    res.redirect(`https://learning-express-three.vercel.app/oauth-success?token=${token}`);
  }
);

module.exports = router;