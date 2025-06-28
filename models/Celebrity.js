const mongoose = require('mongoose');

const celebritySchema = new mongoose.Schema({
  name: String,
  bio: String,
  image: String,
  slug: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Celebrity', celebritySchema);
