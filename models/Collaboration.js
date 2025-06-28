const mongoose = require('mongoose');

const collaborationSchema = new mongoose.Schema({
  brandName: String,
  email: String,
  message: String
}, { timestamps: true });

module.exports = mongoose.model('Collaboration', collaborationSchema);
