const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');

router.post('/create', async (req, res) => {
  try {
    const { title, content, userId } = req.body;
    const post = new Post({
      title,
      content,
      author: userId,
    });
    const savedPost = await post.save();
    res.status(201).json({ success: true, data: savedPost });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const posts = await Post.find().populate('author', 'name email');
    res.status(200).json({ success: true, data: posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;