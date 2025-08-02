const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: String,
  content: String,
  categories: [String], // Array of category names
  tags: [{
    type: String
  }],
  slug: { type: String, unique: true },
  metaTitle: String,
  metaDescription: String,
  coverImage: String, // For your frontend cover image
  image: String,      // (optional, for legacy or other use)
  date: { type: String }, // Store as YYYY-MM-DD string
  createdAt: { type: Date, default: Date.now },
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  relatedCelebrities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Celebrity'
  }]
});

// Tag usage count logic
blogSchema.post('save', async function () {
  if (this.isModified('tags')) {
    const Tag = require('./Tag');
    await Tag.updateMany(
      { _id: { $in: this.tags } },
      { $inc: { usageCount: 1 } }
    );
  }
});

blogSchema.post('deleteOne', { document: true }, async function () {
  const Tag = require('./Tag');
  await Tag.updateMany(
    { _id: { $in: this.tags } },
    { $inc: { usageCount: -1 } }
  );
});

module.exports = mongoose.model('Blog', blogSchema);