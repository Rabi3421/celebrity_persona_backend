const Celebrity = require('../models/Celebrity');

exports.getCelebrities = async (req, res) => {
  try {
    const data = await Celebrity.find();
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching celebrities:', err);
    res.status(500).json({ message: 'Server error while fetching celebrities' });
  }
};

exports.getCelebrityBySlug = async (req, res) => {
  try {
    const celeb = await Celebrity.findOne({ slug: req.params.slug });
    if (!celeb) return res.status(404).json({ message: 'Celebrity not found' });
    res.status(200).json(celeb);
  } catch (err) {
    console.error('Error fetching celebrity by slug:', err);
    res.status(500).json({ message: 'Server error while fetching celebrity' });
  }
};

exports.createCelebrity = async (req, res) => {
  try {
    const { name, bio, slug } = req.body;
    const image = req.file ? req.file.path : '';
    const newCeleb = new Celebrity({ name, bio, image, slug });
    await newCeleb.save();
    res.status(201).json(newCeleb);
  } catch (err) {
    console.error('Error creating celebrity:', err);
    res.status(500).json({ message: 'Server error while creating celebrity' });
  }
};