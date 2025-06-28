const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Contact = require('../models/Contact');
const Collaboration = require('../models/Collaboration');
const Analytics = require('../models/Analytics');

router.get('/contacts', auth, async (req, res) => {
  const messages = await Contact.find().sort('-createdAt');
  res.json(messages);
});

router.get('/collaborations', auth, async (req, res) => {
  const collabs = await Collaboration.find().sort('-createdAt');
  res.json(collabs);
});

router.get('/analytics', auth, async (req, res) => {
  const totalViews = await Analytics.countDocuments({ event: 'view' });
  const totalClicks = await Analytics.countDocuments({ event: 'click' });
  const viewsByType = await Analytics.aggregate([
    { $match: { event: 'view' } },
    { $group: { _id: '$type', count: { $sum: 1 } } }
  ]);
  res.json({ totalViews, totalClicks, viewsByType });
});

module.exports = router;
