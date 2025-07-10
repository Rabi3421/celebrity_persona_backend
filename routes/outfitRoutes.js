const router = require('express').Router();
const upload = require('../middleware/upload');
const { validateOutfit } = require('../middleware/validation');
const cache = require('../middleware/cache');
const {
  getOutfits,
  getOutfit,
  createOutfit,
  updateOutfit,
  deleteOutfit,
  filterOutfits,
  getTrendingOutfits,
  searchOutfits,
  getOutfitsByCelebrity
} = require('../controllers/outfitController');

// Public routes with caching
router.get('/', cache(300), getOutfits);
router.get('/trending', cache(600), getTrendingOutfits);
router.get('/search', cache(180), searchOutfits);
router.get('/celebrity/:celebrityId', cache(300), getOutfitsByCelebrity);
router.get('/:id', cache(300), getOutfit);

// Filter route (POST for complex filtering)
router.post('/filter', filterOutfits);

// Admin routes (add authentication middleware later)
router.post('/', upload.single('image'), validateOutfit, createOutfit);
router.put('/:id', upload.single('image'), validateOutfit, updateOutfit);
router.delete('/:id', deleteOutfit);

module.exports = router;