const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const cache = require('../middleware/cache');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');
const {
  getTrendingCelebrities,
  getTrendingOutfits,
  getTrendingBlogs,
  getAllTrending,
  getTrendingByCategory,
  setTrendingStatus,
  getTrendingStats
} = require('../controllers/trendingController');

// Validation middleware
const validateTrendingStatus = [
  body('type')
    .isIn(['celebrity', 'outfit', 'blog'])
    .withMessage('Type must be celebrity, outfit, or blog'),
  body('id')
    .isMongoId()
    .withMessage('Invalid content ID'),
  body('trending')
    .isBoolean()
    .withMessage('Trending must be true or false'),
  validateRequest
];

// Public routes (cached)
router.get('/', cache(300), getAllTrending); // Cache for 5 minutes
router.get('/celebrities', cache(300), getTrendingCelebrities);
router.get('/outfits', cache(300), getTrendingOutfits);
router.get('/blogs', cache(300), getTrendingBlogs);
router.get('/category/:category', cache(300), getTrendingByCategory);
router.get('/stats', cache(600), getTrendingStats); // Cache for 10 minutes

// Protected routes (admin only)
router.use(protect);
router.post('/set-status', authorize('admin', 'moderator', 'super_admin'), validateTrendingStatus, setTrendingStatus);

module.exports = router;