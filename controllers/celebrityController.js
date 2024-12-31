const Celebrity = require('../models/celebrityModel');

// Create a celebrity profile (Admins only)
exports.createCelebrity = async (req, res) => {
  try {
    const { name, bio, image } = req.body;
    const celebrity = new Celebrity({ name, bio, image });
    await celebrity.save();
    res.status(201).json({ message: 'Celebrity profile created successfully', celebrity });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create celebrity profile', details: error.message });
  }
};

// Get all celebrity profiles
exports.getCelebrities = async (req, res) => {
  try {
    const celebrities = await Celebrity.find();
    res.json({ celebrities });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch celebrity profiles', details: error.message });
  }
};
