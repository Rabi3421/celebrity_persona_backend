const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const { validateTag, validateTagMerge } = require('../middleware/validation');
const cache = require('../middleware/cache');
const {
  getAllTags,
  getTagById,
  getContentByTag,
  getPopularTags,
  getTrendingTags,
  createTag,
  updateTag,
  deleteTag,
  mergeTags,
  updateTagUsageCounts,
  searchTags
} = require('../controllers/tagController');

// Public routes (cached)
router.get('/', cache(600), getAllTags); // Cache for 10 minutes
router.get('/popular', cache(600), getPopularTags);
router.get('/trending', cache(300), getTrendingTags); // Cache for 5 minutes
router.get('/search', cache(300), searchTags);
router.get('/:id', cache(600), getTagById);
router.get('/:tagId/content', cache(300), getContentByTag);

// Protected routes (admin only)
router.use(protect);

router.post('/', authorize('admin', 'super_admin'), validateTag, createTag);
router.put('/:id', authorize('admin', 'super_admin'), validateTag, updateTag);
router.delete('/:id', authorize('admin', 'super_admin'), deleteTag);

// Advanced admin operations
router.post('/merge', authorize('super_admin'), validateTagMerge, mergeTags);
router.post('/update-usage-counts', authorize('super_admin'), updateTagUsageCounts);

module.exports = router;