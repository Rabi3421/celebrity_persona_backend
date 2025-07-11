const mongoose = require('mongoose');

const celebritySchema = new mongoose.Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Celebrity name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  category: {
    type: String,
    trim: true,
    enum: ['Actor', 'Musician', 'Model', 'Athlete', 'Influencer', 'Fashion Icon', 'Other']
  },
  styleType: {
    type: String,
    trim: true
  },

  // Biography
  birthdate: {
    type: Date
  },
  birthplace: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true
  },
  height: {
    type: String,
    trim: true
  },

  // Career & Personal
  education: {
    type: String,
    trim: true
  },
  careerHighlights: {
    type: String,
    trim: true
  },
  awards: {
    type: String,
    trim: true
  },
  personalLife: {
    type: String,
    trim: true
  },
  languages: {
    type: String,
    trim: true
  },

  // Style & Fashion
  signature: {
    look: {
      type: String,
      trim: true
    },
    accessories: {
      type: String,
      trim: true
    },
    designers: {
      type: String,
      trim: true
    },
    perfume: {
      type: String,
      trim: true
    }
  },
  styleEvolution: {
    type: String,
    trim: true
  },
  measurements: {
    type: String,
    trim: true
  },

  // Additional Info
  netWorth: {
    type: String,
    trim: true
  },
  zodiacSign: {
    type: String,
    trim: true
  },
  philanthropyWork: {
    type: String,
    trim: true
  },
  businessVentures: {
    type: String,
    trim: true
  },
  controversies: {
    type: String,
    trim: true
  },
  fanbaseNickname: {
    type: String,
    trim: true
  },

  // Social Media
  socialMedia: {
    instagram: {
      type: String,
      trim: true
    },
    twitter: {
      type: String,
      trim: true
    },
    facebook: {
      type: String,
      trim: true
    },
    youtube: {
      type: String,
      trim: true
    },
    tiktok: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },

  // System fields
  trending: {
    type: Boolean,
    default: false
  },
  trendingScore: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better search performance
celebritySchema.index({ name: 1 });
celebritySchema.index({ slug: 1 });
celebritySchema.index({ category: 1 });
celebritySchema.index({ trending: -1, trendingScore: -1 });
celebritySchema.index({ status: 1 });
celebritySchema.index({ createdAt: -1 });

// Text search index
celebritySchema.index({
  name: 'text',
  bio: 'text',
  category: 'text'
});

// Virtual for full name with category
celebritySchema.virtual('displayName').get(function() {
  return this.category ? `${this.name} (${this.category})` : this.name;
});

// Method to increment views
celebritySchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment clicks
celebritySchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

module.exports = mongoose.model('Celebrity', celebritySchema);