const Inquiry = require('../models/Inquiry');

exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, message, type } = req.body;
    const inquiry = new Inquiry({ name, email, message, type });
    await inquiry.save();
    res.status(201).json({ message: 'Inquiry submitted successfully' });
  } catch (err) {
    console.error('Error submitting inquiry:', err);
    res.status(500).json({ message: 'Server error while submitting inquiry' });
  }
};