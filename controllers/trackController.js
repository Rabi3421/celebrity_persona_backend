const Track = require('../models/Track');

exports.trackEvent = async (req, res) => {
  try {
    const { type, refId, page } = req.body;
    const newTrack = new Track({ type, refId, page });
    await newTrack.save();
    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Error tracking event:', err);
    res.status(500).json({ message: 'Server error while tracking event' });
  }
};