const router = require('express').Router();
const { getViewsPerDay, getClicksPerOutfit } = require('../controllers/analyticsController');

router.get('/views-per-day', getViewsPerDay);
router.get('/clicks-per-outfit', getClicksPerOutfit);

module.exports = router;