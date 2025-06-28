const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  slug: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
