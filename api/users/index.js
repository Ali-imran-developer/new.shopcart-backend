const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/create', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    const savedUser = await user.save();
    res.status(201).json({ success: true, data: savedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;