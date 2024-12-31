const mongoose = require('mongoose');

const celebritySchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Celebrity', celebritySchema);
