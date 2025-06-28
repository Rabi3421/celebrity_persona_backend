const router = require('express').Router();
const { getTopClickedOutfits } = require('../controllers/trendingController');

router.get('/top-clicked-outfits', getTopClickedOutfits);

module.exports = router;