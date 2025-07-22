const crypto = require('crypto');

module.exports = (apiKey) => crypto.createHash('sha256').update(apiKey).digest('hex');