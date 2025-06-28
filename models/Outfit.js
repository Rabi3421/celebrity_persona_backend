const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  title: String,
  image: String,
  affiliateLink: String,
  celebrity: { type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity' },
  tags: [String],
  trending: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Outfit', outfitSchema);