const mongoose = require('mongoose');

const celebritySchema = new mongoose.Schema({
  name: String,
  slug: { type: String, unique: true },
  bio: String,
  image: String,
  category: String,
  styleType: String,
  birthdate: Date,
  birthplace: String,
  nationality: String,
  height: String,
  education: String,
  careerHighlights: String,
  awards: String,
  personalLife: String,
  languages: String,
  styleEvolution: String,
  measurements: String,
  netWorth: String,
  zodiacSign: String,
  philanthropyWork: String,
  businessVentures: String,
  controversies: String,
  fanbaseNickname: String,

  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    youtube: String,
    tiktok: String,
    website: String
  },
  signature: {
    look: String,
    accessories: String,
    designers: String,
    perfume: String
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  trending: {
    type: Boolean,
    default: false,
    index: true
  }
}, { timestamps: true });

// Add to Celebrity.js after the schema definition and before module.exports
celebritySchema.post('save', async function () {
  if (this.isModified('tags')) {
    const Tag = require('./Tag');

    // Update usage counts for all tags
    await Tag.updateMany(
      { _id: { $in: this.tags } },
      { $inc: { usageCount: 1 } }
    );
  }
});

celebritySchema.post('deleteOne', { document: true }, async function () {
  const Tag = require('./Tag');

  // Decrease usage counts for all tags
  await Tag.updateMany(
    { _id: { $in: this.tags } },
    { $inc: { usageCount: -1 } }
  );
});

module.exports = mongoose.model('Celebrity', celebritySchema);
