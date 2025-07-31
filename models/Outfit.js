const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  title: String,
  description: String,
  occasion: String,
  brand: String,
  price: Number,
  affiliateLink: String,
  images: [String],
  sections: [
    {
      title: String,
      content: String
    }
  ],
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
  createdAt: { type: Date, default: Date.now },
  sections: [
    {
      title: String,
      content: String
    }
  ]
});

// Virtual for outfitId
outfitSchema.virtual('outfitId').get(function () {
  return this._id.toString();
});

// Ensure virtuals are included in JSON and Object output
outfitSchema.set('toJSON', { virtuals: true });
outfitSchema.set('toObject', { virtuals: true });

// Update tag usage count after save
outfitSchema.post('save', async function () {
  if (this.isModified('tags')) {
    const Tag = require('./Tag');
    await Tag.updateMany(
      { _id: { $in: this.tags } },
      { $inc: { usageCount: 1 } }
    );
  }
});

// Decrease tag usage count after delete
outfitSchema.post('deleteOne', { document: true }, async function () {
  const Tag = require('./Tag');
  await Tag.updateMany(
    { _id: { $in: this.tags } },
    { $inc: { usageCount: -1 } }
  );
});

module.exports = mongoose.model('Outfit', outfitSchema);