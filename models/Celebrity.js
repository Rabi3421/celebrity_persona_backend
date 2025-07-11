// In Celebrity.js model - make all fields optional except required ones
const celebritySchema = new mongoose.Schema({
  // Required fields
  name: {
    type: String,
    required: [true, 'Celebrity name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: [true, 'Slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },

  // All other fields are optional and accept any value
  image: { type: String },
  bio: { type: String },
  category: { type: String },
  styleType: { type: String },
  birthdate: { type: Date },
  birthplace: { type: String },
  nationality: { type: String },
  height: { type: String },
  education: { type: String },
  careerHighlights: { type: String },
  awards: { type: String },
  personalLife: { type: String },
  languages: { type: String },
  styleEvolution: { type: String },
  measurements: { type: String },
  netWorth: { type: String },
  zodiacSign: { type: String },
  philanthropyWork: { type: String },
  businessVentures: { type: String },
  controversies: { type: String },
  fanbaseNickname: { type: String },

  // Nested objects - use Mixed type to accept any structure
  socialMedia: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  signature: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // System fields
  trending: { type: Boolean, default: false },
  trendingScore: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'active' },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  views: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 }
}, {
  timestamps: true,
  strict: false, // This allows any additional fields not defined in schema
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});