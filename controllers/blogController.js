const Blog = require('../models/Blog');

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.status(200).json(blogs);
  } catch (err) {
    console.error('Error fetching blogs:', err);
    res.status(500).json({ message: 'Server error while fetching blogs' });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.status(200).json(blog);
  } catch (err) {
    console.error('Error fetching blog by slug:', err);
    res.status(500).json({ message: 'Server error while fetching blog' });
  }
};

exports.createBlog = async (req, res) => {
  try {
    const { title, content, slug } = req.body;
    const image = req.file ? req.file.path : '';
    const newBlog = new Blog({ title, content, image, slug });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    console.error('Error creating blog:', err);
    res.status(500).json({ message: 'Server error while creating blog' });
  }
};