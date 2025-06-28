const router = require('express').Router();
const { getAllTags } = require('../controllers/tagController');

router.get('/', getAllTags);

module.exports = router;