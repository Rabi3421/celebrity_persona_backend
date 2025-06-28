const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  type: { type: String, enum: ['contact', 'collab'], default: 'contact' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inquiry', inquirySchema);