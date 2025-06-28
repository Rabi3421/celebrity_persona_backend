const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');

router.post('/', async (req, res) => {
  const { type, slug, event } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const result = await Analytics.create({ type, slug, event, ip });
  res.status(201).json(result);
});

module.exports = router;
