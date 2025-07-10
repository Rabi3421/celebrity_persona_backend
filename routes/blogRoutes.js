const router = require('express').Router();
const upload = require('../middleware/upload');
const { validateBlog } = require('../middleware/validation');
const cache = require('../middleware/cache');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  searchBlogs,
  getFeaturedBlogs,
  getBlogsByCategory,
  getPopularBlogs,
  getRecentBlogs,
  toggleBlogLike
} = require('../controllers/blogController');

// Public routes with caching
router.get('/', cache(300), getBlogs);
router.get('/featured', cache(600), getFeaturedBlogs);
router.get('/popular', cache(600), getPopularBlogs);
router.get('/recent', cache(300), getRecentBlogs);
router.get('/search', cache(180), searchBlogs);
router.get('/category/:category', cache(300), getBlogsByCategory);
router.get('/:slug', cache(300), getBlog);

// Interaction routes
router.post('/:id/like', toggleBlogLike);

// Admin routes (add authentication middleware later)
router.post('/', upload.single('featuredImage'), validateBlog, createBlog);
router.put('/:id', upload.single('featuredImage'), validateBlog, updateBlog);
router.delete('/:id', deleteBlog);

module.exports = router;