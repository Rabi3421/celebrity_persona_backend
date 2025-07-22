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
  getTrendingCelebrities,
  getDraftCelebrities,
  saveDraftCelebrity
} = require('../controllers/celebrityController');
const apiKeyAuth = require('../middleware/apiKeyAuth');

// Public routes with API key and caching
router.get('/', apiKeyAuth, cache(300), getCelebrities);
router.get('/trending', apiKeyAuth, cache(600), getTrendingCelebrities);
router.get('/search', apiKeyAuth, cache(180), searchCelebrities);
router.get('/:slug', apiKeyAuth, cache(300), getCelebrity);
router.get('/:slug/outfits', apiKeyAuth, cache(300), getCelebrityOutfits);

// Admin routes (add authentication middleware later)
router.post('/', upload.single('image'), validateCelebrity, createCelebrity);
router.put('/:id', upload.single('image'), validateCelebrity, updateCelebrity);
router.delete('/:id', deleteCelebrity);
router.post('/draft', saveDraftCelebrity);
router.get('/drafts', getDraftCelebrities);

module.exports = router;