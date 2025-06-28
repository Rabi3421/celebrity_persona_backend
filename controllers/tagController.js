const Outfit = require('../models/Outfit');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Outfit.distinct('tags');
    res.status(200).json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ message: 'Server error while fetching tags' });
  }
};