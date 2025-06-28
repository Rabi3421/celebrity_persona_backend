const express = require('express');
const router = express.Router();
const Collaboration = require('../models/Collaboration');

router.post('/', async (req, res) => {
  const result = await Collaboration.create(req.body);
  res.status(201).json(result);
});

module.exports = router;
