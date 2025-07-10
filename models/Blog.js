const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  image: String,
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  trending: {
    type: Boolean,
    default: false,
    index: true
  }
});

// Add this middleware to update tag usage counts
blogSchema.post('save', async function () {
  if (this.isModified('tags')) {
    const Tag = require('./Tag');

    // Update usage counts for all tags
    await Tag.updateMany(
      { _id: { $in: this.tags } },
      { $inc: { usageCount: 1 } }
    );
  }
});

blogSchema.post('deleteOne', { document: true }, async function () {
  const Tag = require('./Tag');

  // Decrease usage counts for all tags
  await Tag.updateMany(
    { _id: { $in: this.tags } },
    { $inc: { usageCount: -1 } }
  );
});

module.exports = mongoose.model('Blog', blogSchema);