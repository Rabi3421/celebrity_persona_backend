const hashApiKey = require('../utils/hashApiKey');
const ApiKey = require('../models/ApiKey');

module.exports = async function (req, res, next) {
  const apiKey = req.headers['api_key'];
  if (!apiKey) {
    return res.status(401).json({ success: false, message: 'API key required in header' });
  }
  const keyHash = hashApiKey(apiKey);

  const keyDoc = await ApiKey.findOne({ keyHash, active: true });
  if (!keyDoc) {
    return res.status(403).json({ success: false, message: 'Invalid or inactive API key' });
  }

  const now = new Date();

  // --- Daily reset logic for free plan ---
  if (keyDoc.plan === 'free') {
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
    if (keyDoc.usage >= keyDoc.usageLimit) {
      return res.status(429).json({ success: false, message: 'API usage limit reached. Please wait for daily reset.' });
    }
  }

  // --- Monthly reset/expiry logic for paid plans ---
  if (['100k', '1m', '10m'].includes(keyDoc.plan)) {
    if (keyDoc.validUntil && now > keyDoc.validUntil) {
      // Plan expired, reset to free
      keyDoc.plan = 'free';
      keyDoc.usageLimit = 100;
      keyDoc.usage = 0;
      keyDoc.lastReset = now;
      keyDoc.validUntil = undefined;
      keyDoc.pricePaid = 0;
      await keyDoc.save();
      return res.status(403).json({ success: false, message: 'Plan expired. Please renew.' });
    }
    if (keyDoc.usage >= keyDoc.usageLimit) {
      return res.status(429).json({ success: false, message: 'API usage limit reached for this month. Please renew.' });
    }
  }

  // Increment usage
  keyDoc.usage += 1;
  await keyDoc.save();

  req.apiKeyInfo = keyDoc;
  next();
};