const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  title: String,
  image: String,
  affiliateLink: String,
  celebrity: { type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity' },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  createdAt: { type: Date, default: Date.now }
});

// Add to Outfit.js after the schema definition and before module.exports
outfitSchema.post('save', async function () {
  if (this.isModified('tags')) {
    const Tag = require('./Tag');

    // Update usage counts for all tags
    await Tag.updateMany(
      { _id: { $in: this.tags } },
      { $inc: { usageCount: 1 } }
    );
  }
});

outfitSchema.post('deleteOne', { document: true }, async function () {
  const Tag = require('./Tag');

  // Decrease usage counts for all tags
  await Tag.updateMany(
    { _id: { $in: this.tags } },
    { $inc: { usageCount: -1 } }
  );
});

module.exports = mongoose.model('Outfit', outfitSchema);