const router = require('express').Router();
const upload = require('../middleware/upload');
const {
  getOutfits, createOutfit, filterOutfits
} = require('../controllers/outfitController');

router.get('/', getOutfits);
router.post('/', upload.single('image'), createOutfit);
router.post('/filter', filterOutfits);

module.exports = router;