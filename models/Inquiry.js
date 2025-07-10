const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  phone: {
    type: String,
    trim: true,
    match: [
      /^[\+]?[1-9][\d]{0,15}$/,
      'Please provide a valid phone number'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['general', 'business', 'partnership', 'support', 'feedback', 'press'],
    default: 'general',
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending',
    index: true
  },
  source: {
    type: String,
    enum: ['website', 'mobile_app', 'social_media', 'email', 'phone', 'other'],
    default: 'website'
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  referrer: {
    type: String,
    trim: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  tags: [{
    type: String,
    trim: true
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    path: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  responses: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: [2000, 'Response cannot exceed 2000 characters']
    },
    isPublic: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  notes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    note: {
      type: String,
      required: true,
      maxlength: [1000, 'Note cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readBy: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  followUpRequired: {
    type: Boolean,
    default: false,
    index: true
  },
  followUpDate: {
    type: Date
  },
  resolution: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resolution cannot exceed 1000 characters']
  },
  satisfactionRating: {
    type: Number,
    min: 1,
    max: 5
  },
  metadata: {
    browserInfo: String,
    deviceInfo: String,
    location: String,
    customFields: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
inquirySchema.index({ email: 1, createdAt: -1 });
inquirySchema.index({ type: 1, status: 1 });
inquirySchema.index({ priority: 1, createdAt: -1 });
inquirySchema.index({ assignedTo: 1, status: 1 });
inquirySchema.index({ createdAt: -1 });
inquirySchema.index({
  name: 'text',
  email: 'text',
  subject: 'text',
  message: 'text'
});

// Virtual for response count
inquirySchema.virtual('responseCount').get(function () {
  return this.responses ? this.responses.length : 0;
});

// Virtual for days since created
inquirySchema.virtual('daysSinceCreated').get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set priority based on type
inquirySchema.pre('save', function (next) {
  if (this.isNew) {
    // Auto-set priority based on inquiry type
    const priorityMap = {
      'business': 'high',
      'partnership': 'high',
      'press': 'urgent',
      'support': 'medium',
      'feedback': 'low',
      'general': 'medium'
    };

    if (!this.priority || this.priority === 'medium') {
      this.priority = priorityMap[this.type] || 'medium';
    }
  }
  next();
});

// Static method to get inquiry statistics
inquirySchema.statics.getStatistics = async function (startDate, endDate) {
  const matchQuery = {};
  if (startDate && endDate) {
    matchQuery.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const stats = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byStatus: {
          $push: {
            status: '$status',
            type: '$type',
            priority: '$priority'
          }
        }
      }
    }
  ]);

  const statusCounts = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const typeCounts = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const priorityCounts = await this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 }
      }
    }
  ]);
  // Add this to the end of your Inquiry model file, before module.exports
  const mongoosePaginate = require('mongoose-paginate-v2');
  inquirySchema.plugin(mongoosePaginate);

  return {
    total: stats[0]?.total || 0,
    byStatus: statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    byType: typeCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    byPriority: priorityCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {})
  };
};

module.exports = mongoose.model('Inquiry', inquirySchema);