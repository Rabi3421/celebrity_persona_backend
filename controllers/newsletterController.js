const Subscriber = require('../models/Subscriber');

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Subscriber.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Already subscribed' });
    const sub = new Subscriber({ email });
    await sub.save();
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Error subscribing to newsletter:', err);
    res.status(500).json({ message: 'Server error while subscribing' });
  }
};