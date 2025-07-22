const express = require('express');
const router = express.Router();
const ApiKey = require('../models/ApiKey');
// User requests a new API key
const hashApiKey = require('../utils/hashApiKey'); // Use a SHA256 hash function
const generateApiKey = require('../utils/generateApiKey');

router.post('/register', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const key = generateApiKey();
  const keyHash = hashApiKey(key);
  await ApiKey.create({ key, keyHash, ownerEmail: email });
  res.json({ success: true, apiKey: key, usageLimit: 100 }); // Show only once!
});

router.get('/dashboard', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const keyDoc = await ApiKey.findOne({ ownerEmail: email, active: true });
  if (!keyDoc) {
    return res.status(404).json({ success: false, message: 'API key not found for this email' });
  }

  res.json({
    success: true,
    apiKey: keyDoc.key, // Show the real API key
    usage: keyDoc.usage,
    usageLimit: keyDoc.usageLimit,
    remaining: keyDoc.usageLimit - keyDoc.usage,
    plan: keyDoc.plan,
    resetDate: keyDoc.lastReset,
    validUntil: keyDoc.validUntil
  });
});

router.post('/regenerate', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  const keyDoc = await ApiKey.findOne({ ownerEmail: email, active: true });
  if (!keyDoc) {
    return res.status(404).json({ success: false, message: 'API key not found for this email' });
  }

  const newKey = generateApiKey();
  const newKeyHash = hashApiKey(newKey);

  keyDoc.keyHash = newKeyHash;
  keyDoc.usage = 0;
  keyDoc.lastReset = new Date();
  await keyDoc.save();

  res.json({
    success: true,
    apiKey: newKey, // Show only once!
    usageLimit: keyDoc.usageLimit
  });
});

// Check API key usage/limit
router.get('/usage', async (req, res) => {
  const apiKey = req.headers['api_key'];
  if (!apiKey) {
    return res.status(400).json({ success: false, message: 'API key required in header' });
  }

  const keyDoc = await ApiKey.findOne({ key: apiKey, active: true });
  if (!keyDoc) {
    return res.status(404).json({ success: false, message: 'API key not found' });
  }

  // --- Daily reset logic for free plan ---
  if (keyDoc.plan === 'free') {
    const now = new Date();
    const lastReset = keyDoc.lastReset || now;
    if (
      lastReset.getUTCFullYear() !== now.getUTCFullYear() ||
      lastReset.getUTCMonth() !== now.getUTCMonth() ||
      lastReset.getUTCDate() !== now.getUTCDate()
    ) {
      keyDoc.usage = 0;
      keyDoc.lastReset = now;
      await keyDoc.save();
    }
  }

  const remaining = keyDoc.usageLimit - keyDoc.usage;
  res.json({
    success: true,
    usage: keyDoc.usage,
    usageLimit: keyDoc.usageLimit,
    remaining,
    plan: keyDoc.plan,
    validUntil: keyDoc.validUntil
  });
});

router.post('/upgrade', async (req, res) => {
  const apiKey = req.headers['api_key'];
  const { plan } = req.body; // plan: '100k', '1m', '10m'
  if (!apiKey || !plan) {
    return res.status(400).json({ success: false, message: 'API key and plan required' });
  }

  const plans = {
    '100k': { price: 300, usageLimit: 100000 },
    '1m': { price: 1000, usageLimit: 1000000 },
    '10m': { price: 5000, usageLimit: 10000000 }
  };

  if (!plans[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid plan' });
  }

  const keyDoc = await ApiKey.findOne({ key: apiKey, active: true });
  if (!keyDoc) {
    return res.status(404).json({ success: false, message: 'API key not found' });
  }

  // Set plan, usageLimit, validUntil (1 month from now), and pricePaid
  keyDoc.plan = plan;
  keyDoc.usageLimit = plans[plan].usageLimit;
  keyDoc.usage = 0;
  keyDoc.lastReset = new Date();
  keyDoc.validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
  keyDoc.pricePaid = plans[plan].price;
  await keyDoc.save();

  res.json({
    success: true,
    message: `Upgraded to ${plan} plan`,
    usageLimit: keyDoc.usageLimit,
    validUntil: keyDoc.validUntil,
    pricePaid: keyDoc.pricePaid
  });
});

module.exports = router;