const mongoose = require('mongoose');

const celebritySchema = new mongoose.Schema({
  name: String,
  bio: String,
  image: String,
  slug: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Celebrity', celebritySchema);