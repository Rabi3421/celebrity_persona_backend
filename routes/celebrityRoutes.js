const express = require('express');
const { createCelebrity, getCelebrities } = require('../controllers/celebrityController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

router.post('/', protect, isAdmin, createCelebrity); // Admins only
router.get('/', getCelebrities); // Open to all users

module.exports = router;
