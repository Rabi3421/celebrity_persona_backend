const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['celebrity', 'outfit', 'blog', 'affiliate_link', 'external_link', 'page_view', 'custom_event'],
    index: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  eventName: {
    type: String,
    index: true
  },
  eventCategory: {
    type: String,
    index: true
  },
  eventValue: {
    type: Number
  },
  url: {
    type: String
  },
  page: {
    type: String
  },
  title: {
    type: String
  },
  duration: {
    type: Number // Time spent on page in seconds
  },
  ipAddress: {
    type: String,
    index: true
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  },
  userId: {
    type: String,
    index: true
  },
  sessionId: {
    type: String,
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  additionalData: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
trackSchema.index({ type: 1, timestamp: -1 });
trackSchema.index({ targetId: 1, timestamp: -1 });
trackSchema.index({ userId: 1, timestamp: -1 });
trackSchema.index({ sessionId: 1, timestamp: -1 });
trackSchema.index({ timestamp: -1 });

// TTL index to automatically delete old records (optional)
// trackSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('Track', trackSchema);