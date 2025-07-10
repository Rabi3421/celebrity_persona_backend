const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50,
    index: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    maxlength: 200
  },
  type: {
    type: String,
    enum: ['general', 'style', 'color', 'occasion', 'brand', 'category', 'season'],
    default: 'general',
    index: true
  },
  color: {
    type: String,
    default: '#007bff',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  usageCount: {
    type: Number,
    default: 0,
    min: 0,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for better query performance
tagSchema.index({ type: 1, usageCount: -1 });
tagSchema.index({ name: 'text', description: 'text' });

// Pre-save middleware to update slug
tagSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }
  next();
});

// Static method to find or create tags
tagSchema.statics.findOrCreateTags = async function(tagNames) {
  const tags = [];
  
  for (const tagName of tagNames) {
    const normalizedName = tagName.trim();
    if (!normalizedName) continue;
    
    let tag = await this.findOne({ 
      name: { $regex: new RegExp(`^${normalizedName}$`, 'i') } 
    });
    
    if (!tag) {
      const slug = normalizedName.toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      
      tag = await this.create({
        name: normalizedName,
        slug,
        usageCount: 0
      });
    }
    
    tags.push(tag._id);
  }
  
  return tags;
};

// Instance method to increment usage count
tagSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  return this.save();
};

// Instance method to decrement usage count
tagSchema.methods.decrementUsage = async function() {
  if (this.usageCount > 0) {
    this.usageCount -= 1;
    return this.save();
  }
};

module.exports = mongoose.model('Tag', tagSchema);