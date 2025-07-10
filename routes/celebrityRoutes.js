const router = require('express').Router();
const upload = require('../middleware/upload');
const { validateCelebrity } = require('../middleware/validation');
const cache = require('../middleware/cache');
const {
  getCelebrities,
  getCelebrity,
  createCelebrity,
  updateCelebrity,
  deleteCelebrity,
  searchCelebrities,
  getCelebrityOutfits,
  getTrendingCelebrities
} = require('../controllers/celebrityController');

// Public routes with caching
router.get('/', cache(300), getCelebrities);
router.get('/trending', cache(600), getTrendingCelebrities);
router.get('/search', cache(180), searchCelebrities);
router.get('/:slug', cache(300), getCelebrity);
router.get('/:slug/outfits', cache(300), getCelebrityOutfits);

// Admin routes (add authentication middleware later)
router.post('/', upload.single('image'), validateCelebrity, createCelebrity);
router.put('/:id', upload.single('image'), validateCelebrity, updateCelebrity);
router.delete('/:id', deleteCelebrity);

module.exports = router;