const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  const result = await Contact.create(req.body);
  res.status(201).json(result);
});

module.exports = router;
