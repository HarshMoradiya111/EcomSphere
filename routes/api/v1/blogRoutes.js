const express = require('express');
const router = express.Router();
const Blog = require('../../../models/Blog');

// @desc    Get all blog posts for the public feed
// @route   GET /api/v1/blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ date: -1 });
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @desc    Get single blog post
// @route   GET /api/v1/blogs/:id
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: 'Article not found' });
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
