const Outfit = require('../models/Outfit');

exports.getOutfits = async (req, res) => {
  try {
    const data = await Outfit.find().populate('celebrity').sort({ createdAt: -1 });
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching outfits:', err);
    res.status(500).json({ message: 'Server error while fetching outfits' });
  }
};

exports.createOutfit = async (req, res) => {
  try {
    const { title, affiliateLink, celebrity, tags, trending } = req.body;
    const image = req.file ? req.file.path : '';
    const newOutfit = new Outfit({ title, affiliateLink, celebrity, tags, image, trending });
    await newOutfit.save();
    res.status(201).json(newOutfit);
  } catch (err) {
    console.error('Error creating outfit:', err);
    res.status(500).json({ message: 'Server error while creating outfit' });
  }
};

exports.filterOutfits = async (req, res) => {
  try {
    const { trending, celebrityId } = req.body;
    const query = {};
    if (trending) query.trending = true;
    if (celebrityId) query.celebrity = celebrityId;
    const filtered = await Outfit.find(query).populate('celebrity').sort({ createdAt: -1 });
    res.status(200).json(filtered);
  } catch (err) {
    console.error('Error filtering outfits:', err);
    res.status(500).json({ message: 'Server error while filtering outfits' });
  }
};