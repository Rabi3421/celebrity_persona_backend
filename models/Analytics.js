const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  type: String, // outfit, blog, celebrity
  slug: String,
  event: String, // view or click
  ip: String
}, { timestamps: true });

module.exports = mongoose.model('Analytics', analyticsSchema);
