const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' }
}, { _id: false });

const CelebritySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  birthDate: { type: Date },
  occupation: { type: String },
  nationality: { type: String },
  infoboxImage: { type: String },
  facts: [{ label: String, value: String }],
  type: { type: String },
  films: [{ title: String, year: String }],
  awards: [{name: String,year: String,movie: String,status: String,category: String}],
  matches: [{ type: String, count: String }],
  trophies: [{ name: String, year: String }],
  albums: [{ title: String, year: String }],
  books: [{ title: String, year: String }],
  positions: [{ title: String, year: String }],
  achievements: [{ name: String, year: String }],
  events: [{ name: String, year: String }],
  medals: [{ type: String, year: String }],
  metaTitle: { type: String },
  metaDescription: { type: String },
  slug: { type: String, required: true, unique: true, trim: true },
  coverImage: { type: String },
  sections: [SectionSchema],
  image: { type: String }, // for uploaded image filename
  trending: { type: Boolean, default: false },
  trendingScore: { type: Number, default: 0 },
  category: { type: String },
  profession: { type: String },
  isDraft: { type: Boolean, default: false },
  galleryImages: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Celebrity', CelebritySchema);