const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/blog.controller');

router.post('/', auth, ctrl.createBlog);
router.get('/', ctrl.getAllBlogs);
router.get('/:slug', ctrl.getBlogBySlug);
router.put('/:slug', auth, ctrl.updateBlog);
router.delete('/:slug', auth, ctrl.deleteBlog);

module.exports = router;
