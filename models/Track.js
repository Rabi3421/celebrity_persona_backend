const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  type: { type: String, enum: ['view', 'click'], required: true },
  refId: String, // outfitId, blogId etc.
  page: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Track', trackSchema);