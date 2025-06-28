const Blog = require('../models/Blog');
const { generateUniqueSlug } = require('../utils/helper');

exports.createBlog = async (req, res) => {
  const slug = await generateUniqueSlug(Blog, req.body.title);
  const blog = await Blog.create({ ...req.body, slug });
  res.status(201).json(blog);
};

exports.getAllBlogs = async (req, res) => {
  const blogs = await Blog.find().sort('-createdAt');
  res.json(blogs);
};

exports.getBlogBySlug = async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug });
  res.json(blog);
};

exports.updateBlog = async (req, res) => {
  const blog = await Blog.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
  res.json(blog);
};

exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findOneAndDelete({ slug: req.params.slug });
  res.json({ message: 'Deleted' });
};
