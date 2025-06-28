const router = require('express').Router();
const upload = require('../middleware/upload');
const {
  getCelebrities, getCelebrityBySlug, createCelebrity
} = require('../controllers/celebrityController');

router.get('/', getCelebrities);
router.get('/:slug', getCelebrityBySlug);
router.post('/', upload.single('image'), createCelebrity);

module.exports = router;