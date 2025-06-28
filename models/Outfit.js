const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema({
  title: String,
  image: String,
  buyLink: String,
  celebrity: { type: mongoose.Schema.Types.ObjectId, ref: 'Celebrity' },
  slug: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Outfit', outfitSchema);
