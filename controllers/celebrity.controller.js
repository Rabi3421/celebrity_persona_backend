const Celebrity = require('../models/Celebrity');
const { generateUniqueSlug } = require('../utils/helper');

exports.createCelebrity = async (req, res) => {
  const slug = await generateUniqueSlug(Celebrity, req.body.name);
  const celeb = await Celebrity.create({ ...req.body, slug });
  res.status(201).json(celeb);
};

exports.getAllCelebrities = async (req, res) => {
  const celebs = await Celebrity.find().sort('-createdAt');
  res.json(celebs);
};

exports.getCelebrityBySlug = async (req, res) => {
  const celeb = await Celebrity.findOne({ slug: req.params.slug });
  if (!celeb) return res.status(404).json({ message: 'Not found' });
  res.json(celeb);
};

exports.updateCelebrity = async (req, res) => {
  const celeb = await Celebrity.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
  res.json(celeb);
};

exports.deleteCelebrity = async (req, res) => {
  const celeb = await Celebrity.findOneAndDelete({ slug: req.params.slug });
  res.json({ message: 'Deleted' });
};
