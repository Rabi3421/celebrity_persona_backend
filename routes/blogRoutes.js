const router = require('express').Router();
const upload = require('../middleware/upload');
const { getBlogs, getBlogBySlug, createBlog } = require('../controllers/blogController');

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', upload.single('image'), createBlog);

module.exports = router;