const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  // In models/ApiKey.js
  key: { type: String, required: true, unique: true },
  keyHash: { type: String, required: true, unique: true },
  ownerEmail: { type: String, required: true },
  usage: { type: Number, default: 0 },
  usageLimit: { type: Number, default: 100 },
  lastReset: { type: Date, default: Date.now },
  validUntil: { type: Date },
  plan: { type: String, enum: ['free', '100k', '1m', '10m'], default: 'free' },
  pricePaid: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);