const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ctrl = require('../controllers/celebrity.controller');

router.post('/', auth, ctrl.createCelebrity);
router.get('/', ctrl.getAllCelebrities);
router.get('/:slug', ctrl.getCelebrityBySlug);
router.put('/:slug', auth, ctrl.updateCelebrity);
router.delete('/:slug', auth, ctrl.deleteCelebrity);

module.exports = router;
