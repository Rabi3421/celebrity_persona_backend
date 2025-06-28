const Outfit = require('../models/Outfit');
const { generateUniqueSlug } = require('../utils/helper');

exports.createOutfit = async (req, res) => {
  const slug = await generateUniqueSlug(Outfit, req.body.title);
  const outfit = await Outfit.create({ ...req.body, slug });
  res.status(201).json(outfit);
};

exports.getAllOutfits = async (req, res) => {
  const outfits = await Outfit.find().populate('celebrity').sort('-createdAt');
  res.json(outfits);
};

exports.getOutfitBySlug = async (req, res) => {
  const outfit = await Outfit.findOne({ slug: req.params.slug }).populate('celebrity');
  res.json(outfit);
};

exports.updateOutfit = async (req, res) => {
  const outfit = await Outfit.findOneAndUpdate({ slug: req.params.slug }, req.body, { new: true });
  res.json(outfit);
};

exports.deleteOutfit = async (req, res) => {
  const outfit = await Outfit.findOneAndDelete({ slug: req.params.slug });
  res.json({ message: 'Deleted' });
};
