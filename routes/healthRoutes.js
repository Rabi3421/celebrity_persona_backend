const router = require('express').Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };
  
  res.status(200).json(healthCheck);
});

module.exports = router;